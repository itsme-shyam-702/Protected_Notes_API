const mongoose = require('mongoose')
const { required } = require('zod/mini')

const noteSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    content:{
        type:String,
        required:true
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true,
        index:true,
    },
    tags: {
        type: [String],
        default: []
    },
},{timestamps:true})

module.exports = mongoose.model('Note',noteSchema);