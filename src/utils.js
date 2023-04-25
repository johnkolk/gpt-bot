import { unlink } from "fs/promises";

export const removeFile = async (filePath) => {
  try {
    await unlink(filePath);
  } catch (e) {
    console.log("Error while remove file ", e.message);
  }
};
