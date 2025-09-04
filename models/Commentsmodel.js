const { default: mongoose, mongo } = require("mongoose");

const CommentsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
    },
    desc: {
        type: String,
        required: true,
    },
    isSpam:{
        type:Boolean,
        default:false
    }
}, { timestamps: true })

module.exports = mongoose.model("Comment", CommentsSchema,"Comments");