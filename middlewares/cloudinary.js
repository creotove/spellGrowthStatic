const { uploadOnCloudinary } = require("../utils/cloudinary.js");

const uploadMiddleWare = async (req, res, next) => {
  const { secure_url, public_id, format } = await uploadOnCloudinary(
    req.file.path
  );
  console.log("secure_url",secure_url);
  console.log("public_id" ,public_id);
  console.log("format", format);
  req.body.pic = secure_url;
  next();
};

module.exports = {
  uploadMiddleWare,
}