const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userschema = new schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    googleId: {  // ✅ New field for Google authentication
        type: String,
        unique: true,
        sparse: true,  // ✅ Allows unique constraint but accepts null values
    }
});

const usermodel = mongoose.model('users', userschema);
module.exports = usermodel;
