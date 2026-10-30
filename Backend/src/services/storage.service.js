const ImageKit = require("@imagekit/nodejs");

const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const uploadFile = async (
  buffer,
  fileName,
  folder = "/company-logos"
) => {
  return await imagekit.files.upload({
    file: buffer.toString("base64"),
    fileName,
    folder,
    useUniqueFileName: true,
  });
};

const deleteFile = async (fileId) => {
  return await imagekit.files.delete(fileId);
};

module.exports = { uploadFile, deleteFile };