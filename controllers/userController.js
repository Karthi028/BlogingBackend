const { clerkClient } = require("@clerk/express");
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

        const currentUser = await User.findOne({ clerkUserId: ClerkUserId });
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found." });
        }


        const userToSubscribeTo = await User.findById(bloggerId);
        if (!userToSubscribeTo) {
            return res.status(404).json({ message: "User to subscribe to not found." });
        }


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

        const currentUser = await User.findOne({ clerkUserId: ClerkUserId });
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found." });
        }


        const userToUnsubscribeFrom = await User.findById(bloggerId);
        if (!userToUnsubscribeFrom) {
            return res.status(404).json({ message: "User not found." });
        }

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
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "An error occurred while fetching subscriptions.", error: err.message });
    }
};

const updateBio = async (req, res) => {

    try {

        const clerkUserId = req.auth.userId;
        const { bio } = req.body;
        if (!bio) {
            return res.status(400).json({ success: false, message: "Bio content is required." });
        }

        const updatedUser = await User.findOneAndUpdate(
            { clerkUserId: clerkUserId },
            { bio: bio },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.status(200).json({
            success: true,
            message: "Bio updated successfully!",
            user: updatedUser
        });

    } catch (err) {
        next(err);
    }

}

const syncUser = async (req, res) => {
    const { clerkUserId } = req.body;

    if (!clerkUserId) {
        return res.status(400).json({ success: false, message: 'clerkUserId is required.' });
    }

    try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);

        console.log(clerkUser._User);

        const { username, emailAddresses , id, imageUrl } = clerkUser;
        const email = emailAddresses?.length > 0 ? emailAddresses[0].emailAddress : null;

        if (email) {
            await User.findOneAndUpdate(
                { email },
                { clerkUserId:id, img: imageUrl, username: username || email },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            console.log(`Successfully synced user: ${clerkUserId}`);
            return res.status(200).json({ success: true, message: 'User data synced successfully.' });
        } else {
            console.warn(`User fetched with no email address. Skipping sync.`);
            return res.status(400).json({ success: false, message: 'User has no email address.' });
        }

    } catch (error) {
        console.error('Error syncing user:', error);
        return res.status(500).json({ success: false, message: 'Failed to sync user data.' });
    }
}


module.exports = { getUserSavedPost, savePost, subscribe, unsubscribe,syncUser, getSubscriptions, getNotifications, updateBio }