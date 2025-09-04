const { default: mongoose } = require("mongoose");

const DraftSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    img: {
        type: Object,
        default: {}
    },
    title: {
        type: String,
    },
    desc: {
        type: String,
    },
    category: {
        type: String,
        default: "general",
    },
    content: {
        type: String,
    },
    tags: {
        type: [String],
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model("Draft", DraftSchema, "Drafts");