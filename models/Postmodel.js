const { default: mongoose } = require("mongoose");

const PostSchema = new mongoose.Schema({

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
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
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
    required: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: []
  },
  likes: {
    type: [String],
    default: []
  }

}, { timestamps: true })

module.exports = mongoose.model("Post", PostSchema, "Posts");