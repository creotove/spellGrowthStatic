const jwt = require("jsonwebtoken");
const authUser = async (req, res, next) => {
  try {
    const token = await req.headers["authorization"].split(" ")[1]; // current using token from headers but will switch to cookies in future
    // return console.log(token)
    if (!token) {
      return res.status(400).send({
        success: false,
        message: "No token found",
      });
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      if (err) {
        return res.status(401).send({
          message: "Auth Failed",
          success: false,
        });
      } else {
        req.body.email = decode.email;
        next();
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  authUser,
};
