const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        lowerCase: true,
        trim:true,
    },
    passwordHash: {
        type: String,
        required:true,
        select:false
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user'
    },
    refreshToken:{
        type:String,
        default:null,
    },

},{timestamps:true});

module.exports = mongoose.model("User",userSchema)