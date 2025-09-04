const { default: mongoose } = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Kindly provide a Title"],
        trim: true,
    },
    content: {
        type: String,
        required: [true, "Kindly provide content"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
    ],
    categories: [
        {
            type: String,
            trim: true,
            lowercase: true,
        },
    ],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
    },
    publishedAt: {
        type: Date,
        default: null,
    },
    meta: {
        views: { type: Number, default: 0 },
        likes: { type: Number, default: 0 },
    },
}, { timestamps: true });

module.exports = mongoose.model("Blog", blogSchema, "Blogs");