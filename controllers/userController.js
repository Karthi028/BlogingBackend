const Postmodel = require("../models/Postmodel");
const User = require("../models/Usermodel");

const getUserSavedPost = async (req, res) => {
    try {
        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            return res.status(401).json("Not authenticated!");
        }

        const user = await User.findOne({ clerkUserId });

        res.status(200).json(user.savedPosts);
    } catch (error) {
        res.status(500).json("internal server error", error.message)
    }
}

const savePost = async (req, res) => {
    try {
        const clerkUserId = req.auth().userId;
        const postId = req.body.postId;

        if (!clerkUserId) {
            return res.status(401).json("Not authenticated!");
        }

        const user = await User.findOne({ clerkUserId });

        const isSaved = user.savedPosts.some((p) => p === postId);

        if (!isSaved) {
            await User.findByIdAndUpdate(user._id, {
                $push: { savedPosts: postId },
            });
        } else {
            await User.findByIdAndUpdate(user._id, {
                $pull: { savedPosts: postId },
            });
        }

        res.status(200).json(isSaved ? "Post Unsaved" : "Post Saved")

    } catch (error) {
        res.status(500).json(error.message)
    }
}

const subscribe = async (req, res) => {
    const { bloggerId } = req.params;
    const ClerkUserId = req.auth().userId;

    try {
        // Find the current user who is subscribing
        const currentUser = await User.findOne({ clerkUserId: ClerkUserId });
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found." });
        }

        // Find the user being subscribed to
        const userToSubscribeTo = await User.findById(bloggerId);
        if (!userToSubscribeTo) {
            return res.status(404).json({ message: "User to subscribe to not found." });
        }

        // Add the user to the subscribedTo list if not already present
        if (!currentUser.subscribedTo.includes(userToSubscribeTo._id)) {
            currentUser.subscribedTo.push(userToSubscribeTo._id);
            await currentUser.save();
        }

        res.status(200).json({ message: "Subscription successful." });

    } catch (error) {
        res.status(500).json({ message: "An error occurred during subscription.", error: error.message });
    }
};

const unsubscribe = async (req, res) => {
    const { bloggerId } = req.params;
    const ClerkUserId = req.auth().userId;

    try {
        // Find the current user who is unsubscribing
        const currentUser = await User.findOne({ clerkUserId: ClerkUserId });
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found." });
        }

        // Find the user being unsubscribed from
        const userToUnsubscribeFrom = await User.findById(bloggerId);
        if (!userToUnsubscribeFrom) {
            return res.status(404).json({ message: "User not found." });
        }

        // Remove the user from the subscribedTo list
        currentUser.subscribedTo.pull(userToUnsubscribeFrom._id);
        await currentUser.save();

        res.status(200).json({ message: "Unsubscription successful." });

    } catch (error) {
        res.status(500).json({ message: "An error occurred during unsubscription.", error: error.message });
    }
};

const getSubscriptions = async (req, res) => {
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json("not authenticated")
    }
    const ClerkUserId = req.auth().userId;

    try {

        const user = await User.findOne({ clerkUserId: ClerkUserId }).populate('subscribedTo');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Return the list of subscriptions (users the current user is subscribed to).
        res.status(200).json(user.subscribedTo);
    } catch (err) {
        res.status(500).json({ message: "An error occurred while fetching subscriptions.", error: err.message });
    }
};

const getNotifications = async (req, res) => {
    const { userId } = req.auth;

    if (!userId) {
        return res.status(401).json("not authenticated")
    }
    const ClerkUserId = req.auth().userId;

    try {

        const user = await User.findOne({ clerkUserId: ClerkUserId }).populate('subscribedTo');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const subscribedIds = user.subscribedTo.map(blogger => blogger._id);

        const posts = await Postmodel.find({
            'user': { $in: subscribedIds },
            'createdAt': { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).populate('user', "username").sort({ createdAt: -1 })
        // Return the list of subscriptions (users the current user is subscribed to).
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "An error occurred while fetching subscriptions.", error: err.message });
    }
};


module.exports = { getUserSavedPost, savePost, subscribe, unsubscribe, getSubscriptions, getNotifications }