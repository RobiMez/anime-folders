#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// cus modules
const myAnimeList_init = require("./modules/myAnimeList/init");
const get_anime_list = require("./modules/get_anime_list");
const get_anime_data = require("./modules/myAnimeList/get_anime_data");
const download = require("./modules/download");
const ico = require("./modules/to_ico_re_size");
const check_folder_icon = require("./modules/check_folder_icon");
const set_folder_icon = require("./modules/set_folder_icon");

// vars
const home_folder = process.argv[2];
if (!home_folder) {
  console.log("[-] enter folder eg. anime-folder c:\\....myanimes");
  process.exit(1);
}

var api_key;
var user_anime_list;
var anime_data;
var anime_pic;

async function start() {
  var conter = 0;
  var error_conter = 0;
  try {
    api_key = await myAnimeList_init();
    user_anime_list = get_anime_list(home_folder);

    user_anime_list.forEach(async (anime) => {
      let skip = check_folder_icon(home_folder + "\\" + anime);
      if (skip) {
        console.log(`[!] skiping "${anime}" b/c it has an icon`);
        if (conter == user_anime_list.length - 1) {
          console.log(
            `\n\n\n[x] finshed with <${
              user_anime_list.length - 1 - error_conter
            }/${user_anime_list.length - 1}>`
          );
          process.exit(1);
        }
        conter++;
      } else {
        anime_data = await get_anime_data(api_key, anime);

        anime_pic_url = anime_data.main_picture.large;
        var download_ = await download(anime_pic_url, home_folder, anime);

        if (download_.ok == 1) {
          console.log(`[+] downloading done for ${anime} poster`);
          var ico_ = await ico(download_.file);
          if (ico_.ok == 1) {
            console.log("[+] done makeing icon for " + anime);
            let por_id = await set_folder_icon(ico_.file, anime, conter);
            conter++;
            if (por_id == user_anime_list.length - 1) {
              console.log(
                `\n\n\n[x] finshed with <${
                  user_anime_list.length - 1 - error_conter
                }/${user_anime_list.length - 1}>`
              );
              process.exit(1);
            }
          } else {
            console.log("[-] can not makeing icon for " + anime);
          }
        } else {
          console.log(`[-] can not downloading done for ${anime} poster`);
          error_conter++;
        }
      }
    });
  } catch (error) {
    console.log("all");
    console.log(error);
    error_conter++;
    conter++;
  }
}

start();

// download(data.main_picture.large, anime_name, file)
//   .then(() => {
//     console.log("[+] done downloding for " + anime_name);
//     ico(file);
//     desktop_ini(file);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
