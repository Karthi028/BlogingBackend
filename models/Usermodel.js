const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  img: {
    type: String,
  },
  savedPosts: {
    type: [String],
    default: [],
  },
  password: {
    type: String,
    required: false
  },
  subscribedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  bio: {
    type: String,
    default: "Nor is there anyone who loves, pursues, or desires pain itself, because it is pain..."
  }


}, { timestamps: true })

module.exports = mongoose.model("User", UserSchema, "Users");