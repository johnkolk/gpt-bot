import axios from "axios";
import { createWriteStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMp3(oggPath, userId) {
    console.log("toMp3 --  ", { oggPath, userId });

    try {
      const outputPath = resolve(dirname(oggPath), `${userId}.mp3`);
      console.log("outputPath ", outputPath);

      return new Promise((resolve, reject) => {
        ffmpeg(oggPath)
          .inputOptions("-t 30")
          .output(outputPath)
          .on("end", () => {
            removeFile(oggPath);
            resolve(outputPath);
          })
          .on("error", (err) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.log("Error while creating mp3 ", e.message);
    }
  }

  async create(url, fileName) {
    try {
      const oggPath = resolve(__dirname, "../voices", `${fileName}.ogg`);
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });

      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => resolve(oggPath));
      });
    } catch (e) {
      console.log("Error while creating ogg file ", e.message);
    }
  }
}
export const ogg = new OggConverter();
