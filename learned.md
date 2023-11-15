// password hashing
use bcrypt for hashing the passwords
const salt = bcrypt.genSalt(5) // 5 = round of salt
const saltedPass = bcrypt.hash(password, salt);

// mongoose models 
- step 1: const schema = new mongoose.Schema({
    //Schema attributes
})
- step 2: create model name and export the model
const modelName = mongoose.model("collectionName",schemaName)
modules.exports = modelName

//Image Upload using multer and cloudinary