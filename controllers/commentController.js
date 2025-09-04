const Commentsmodel = require("../models/Commentsmodel");
const Comment = require("../models/Commentsmodel");
const User = require("../models/Usermodel");

const getcomments = async (req, res) => {
    try {
        const postId = req.params.postId;
        const clerkUserId = req.auth().userId;

        const role = await req.auth().sessionClaims?.metadata?.role || "user";


        const findQuery = {post:postId}

        if(role !== 'admin'){
            findQuery.$or = [
                { isSpam: false },
                { isSpam: { $exists: false } } 
            ];
        }

        const comments = await Comment.find(findQuery).populate("user", "clerkUserId username img").sort({ createdAt: -1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: "error during fetching", error: error.message })
    }

}

const addComment = async (req, res) => {
    try {

        const clerkUserId = req.auth().userId;
        const postId = req.params.postId;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const { desc } = req.body;
        const newComment = await Comment.create({
            desc,
            user: existingUser._id,
            post: postId
        })

        res.status(201).json(newComment)
    } catch (error) {
        res.status(500).json({ message: "error during adding comment", error: error.message })
    }

}

const editComment = async (req, res) => {
    try {

        const clerkUserId = req.auth().userId;
        const Id = req.params.Id;


        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const { desc } = req.body;
        const editComment = await Comment.findOneAndUpdate(
            { _id: Id, user: existingUser._id },
            { desc },
            { new: true, runValidators: true }
        )

        res.status(201).json(editComment)
    } catch (error) {
        res.status(500).json({ message: "error during adding comment", error: error.message })
    }

}

const deleteComment = async (req, res) => {
    try {
        const clerkUserId = req.auth().userId;
        const Id = req.params.Id;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const role = req.auth.sessionClaims?.metadata?.role || "user";

        if (role === 'admin') {
            await Comment.findByIdAndDelete(Id)
            return res.status(200).json({ message: "Comment has been deleted" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const deleteComment = await Comment.findOneAndDelete({ _id: Id, user: existingUser._id })

        if (!deleteComment) {
            res.status(401).json({ message: "Unaithorised to delete the comments" })
        }

        res.status(200).json({ message: 'Deleted Successfully' })
    } catch (error) {
        res.status(500).json({ message: "error during Deleting", error: error.message })
    }

}

const isSpam = async (req, res) => {
    try {
        const clerkUserId = req.auth().userId;
        const commentId  = req.params.commentId

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const role = req.auth().sessionClaims?.metadata?.role || "user";

        if (role !== 'admin') {
            return res.status(403).json({ message: "only Admin can Feature the Post!!!" })
        }

        if (role === 'admin') {
            await Commentsmodel.findByIdAndUpdate({_id:commentId},{isSpam:true},{new: true, runValidators: true })
            return res.status(200).json({ message: "Post Pinned as Spam" })
        }

    } catch (error) {

        res.status(500).json({ message: "Internal Server error Unable to Pin it as Spam" })

    }
}

const restoreSpam = async(req,res)=>{
    try {
        const clerkUserId = req.auth().userId;
        const { commentId } = req.params

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const role = req.auth().sessionClaims?.metadata?.role || "user";

        if (role !== 'admin') {
            return res.status(403).json({ message: "only Admin can Feature the Post!!!" })
        }

        if (role === 'admin') {
            await Commentsmodel.findByIdAndUpdate({_id:commentId},{isSpam:false},{new: true, runValidators: true })
            return res.status(200).json({ message: "Post Pinned as Spam" })
        }

    } catch (error) {

        res.status(500).json({ message: "Internal Server error Unable to Pin it as Spam" })

    }
}

module.exports = { getcomments, deleteComment, addComment, editComment, restoreSpam, isSpam }