const mongoose = require("mongoose");

async function connectDb() {
  mongoose.connect(`${process.env.MONGOURL}/spellGrowth`);
  console.log("DB connected successfully")
}

module.exports = {
  connectDb,
};
