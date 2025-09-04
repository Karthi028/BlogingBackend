const ImageKit = require("imagekit");
const Post = require("../models/Postmodel");
const User = require("../models/Usermodel");
const { IMAGEKIT_URL_ENDPOINT, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY } = require("../utils/config");
const Comment = require("../models/Commentsmodel");
const Draftpostmodel = require("../models/Draftpostmodel");

const getPosts = async (req, res) => {
    try {

        const page = +(req.query.page || 1);
        const limit = +(req.query.limit) || 5;

        const query = {};

        const cat = req.query.cat;
        const author = req.query.author;
        const searchQuery = req.query.search;
        const sortQuery = req.query.sort;
        const featured = req.query.featured;

        if (cat) {
            query.category = cat;
        }

        if (searchQuery) {
            query.title = { $regex: searchQuery, $options: "i" };
        }

        if (author) {
            const user = await User.findOne({ username: author }).select("_id");

            if (!user) {
                return res.status(404).json("No post found!");
            }

            query.user = user._id;
        }

        let sortObj = { createdAt: -1 };

        if (sortQuery) {
            switch (sortQuery) {
                case "newest":
                    sortObj = { createdAt: -1 };
                    break;
                case "oldest":
                    sortObj = { createdAt: 1 };
                    break;
                case "popular":
                    sortObj = { views: -1 };
                    break;
                case "trending":
                    sortObj = { views: -1 };
                    query.createdAt = {
                        $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                    };
                    break;
                default:
                    break;
            }
        }

        if (featured) {
            query.isFeatured = true;
        }


        const posts = await Post.find(query)
            .populate('user', "username")
            .sort(sortObj)
            .limit(limit)
            .skip((page - 1) * limit);

        const totalPosts = await Post.countDocuments();
        const hasMore = page * limit < totalPosts;

        res.status(200).json({ posts, hasMore });
    } catch (error) {
        res.status(400).json({ message: "server error during fetching posts", error: error.message })
    }
};

const getPost = async (req, res) => {
    try {
        const slug = req.params.slug
        const post = await Post.findOne({ slug }).populate('user', "clerkUserId username img")

        res.status(200).json(post);

    } catch (error) {
        res.status(400).json({ message: "server error during fetching post", error: error.message })
    }
};

const createPost = async (req, res) => {
    try {

        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const { title, content, user, img, category, desc, tags } = req.body;

        let slug = req.body.title.replace(/ /g, '-').toLowerCase();

        let existingPost = await Post.findOne({ slug });

        let counter = 2;

        while (existingPost) {
            slug = `${req.body.title.replace(/ /g, '-').toLowerCase()}-${counter}`;
            existingPost = await Post.findOne({ slug });
            counter++;
        }

        console.log(req.body);

        const newPost = new Post({
            title,
            slug,
            content,
            user: existingUser._id,
            img,
            category,
            desc,
            tags
        })

        await newPost.save();

        res.status(201).json({ message: "Post created Successfully", post: newPost })
    } catch (error) {
        res.status(400).json({ message: "Error creating Post", error: error.message })
    }
};

const updateTags = async (req, res) => {

    // Correctly get the slug from the request parameters
    const { slug } = req.params;
    const { tags } = req.body;

    // Check if a slug was provided
    if (!slug) {
        return res.status(400).json({ message: "Post slug is missing from the request." });
    }

    const clerkUserId = req.auth().userId;

    if (!clerkUserId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const existingUser = await User.findOne({ clerkUserId });

    if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
    }

    // Log the user IDs to help with debugging
    console.log(`Authenticated Clerk User ID: ${clerkUserId}`);
    console.log(`Found User's MongoDB ID: ${existingUser._id}`);
    console.log(`Attempting to update post with slug: ${slug}`);

    try {
        // Use findOneAndUpdate to find the post by both slug and the user's ID
        // This ensures that only the author can update the tags
        const updatedPost = await Post.findOneAndUpdate(
            { slug: slug, user: existingUser._id },
            { $set: { tags: tags } },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found or you do not have permission to update it." });
        }

        res.status(200).json(updatedPost);

    } catch (error) {
        res.status(500).json({ message: "An error occurred while updating the post.", error: error.message });
    }
};


const deletePost = async (req, res) => {
    try {

        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const role = req.auth.sessionClaims?.metadata?.role || "user";

        if (role === 'admin') {
            await Post.findByIdAndDelete(req.params.id)
            await Comment.deleteMany({ post: req.params.id })
            return res.status(200).json({ message: "Post Deleted Successfully" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        const id = req.params.id;

        const deletedPost = await Post.findOneAndDelete({ _id: id, user: existingUser._id });

        if (deletePost) {
            return res.status(200).json({ message: "Post Deleted Successfully" })
        }

        res.status(403).json({ message: "Access Forbidden to Delete other users Post" })


    } catch (error) {
        res.status(400).json({ message: "Error Deleting Post", error: error.message })
    }
};

const imgUpload = async (req, res) => {

    const imagekit = new ImageKit({

        urlEndpoint: IMAGEKIT_URL_ENDPOINT,
        publicKey: IMAGEKIT_PUBLIC_KEY,
        privateKey: IMAGEKIT_PRIVATE_KEY

    })

    const result = imagekit.getAuthenticationParameters();
    res.send(result);
}

const featurePost = async (req, res) => {
    try {

        const clerkUserId = req.auth().userId;
        const postId = req.body.postId

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const role = req.auth().sessionClaims?.metadata?.role || "user";

        if (role !== 'admin') {
            return res.status(403).json({ message: "only Admin can Feature the Post!!!" })
        }

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ message: "Post not found!!" })
        }

        const isFeatured = post.isFeatured;

        const updatedPost = await Post.findByIdAndUpdate(postId, { isFeatured: !isFeatured }, { new: true });

        return res.status(200).json(updatedPost);

    } catch (error) {
        res.status(400).json({ message: "Error Deleting Post", error: error.message })
    }
};

const createDraft = async (req, res) => {
    try {

        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const newPost = new Draftpostmodel({ user: existingUser._id, ...req.body });

        await newPost.save();

        res.status(201).json({ message: "Draft Saved Successfully", post: newPost })
    } catch (error) {
        res.status(400).json({ message: "Error creating Post", error: error.message })
    }
};

const getDrafts = async (req, res) => {
    console.log("Received a request to fetch drafts.");
    try {
        const clerkUserId = req.auth().userId;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const drafts = await Draftpostmodel.find({ user: existingUser._id }).lean()

        res.status(200).json(drafts);
    } catch (error) {
        console.error("Error fetching drafts:", error);
        res.status(500).json({ message: "Internal Server Error" });

    }

};

const getDraft = async (req, res) => {

    try {
        const clerkUserId = req.auth().userId;
        const { id } = req.params;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const draft = await Draftpostmodel.findOne({ _id: id, user: existingUser._id }).lean();

        if (!draft) {
            return res.status(404).json({ message: "Draft not found or you do not have permission to view it." });
        }

        res.status(200).json(draft);


    } catch (error) {
        console.error("Error fetching single draft:", error);
        res.status(400).json({ message: "Invalid draft ID." });

    }

}

const updateDraft = async (req, res) => {

    try {
        const clerkUserId = req.auth().userId;
        const id = req.params.id;
        const updatedData = req.body;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const updatedDraft = await Draftpostmodel.findOneAndUpdate(
            { _id: id, user: existingUser._id },
            { $set: updatedData },
            { new: true, runValidators: true } // `new: true` returns the updated document
        );

        if (!updatedDraft) {
            return res.status(404).json({ message: "Draft not found or you do not have permission to update it." });
        }

        res.status(200).json(updatedDraft);


    } catch (error) {
        console.error("Error updating draft:", error);
        res.status(400).json({ message: "Invalid data provided for update." });

    }

}

const deleteDraft = async (req, res) => {

    try {
        const clerkUserId = req.auth().userId;
        const { id } = req.params;

        if (!clerkUserId) {
            return res.status(401).json({ message: "Not authenticated" })
        }

        const existingUser = await User.findOne({ clerkUserId })

        if (!existingUser) {
            return res.status(404).json({ message: "user not found" })
        }

        const result = await Draftpostmodel.findOneAndDelete({ _id: id, user: existingUser._id });

        if (!result) {
            return res.status(404).json({ message: "Draft not found or you do not have permission to delete it." });
        }

        res.status(200).json({ message: "Draft deleted successfully." });


    } catch (error) {
        console.error("Error deleting draft:", error);
        res.status(400).json({ message: "Invalid draft ID." });
    }

}

const likePosts = async (req, res) => {
    const { postId } = req.params;
    const { userId } = req.auth;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json("Post not found");
        }

        const userIndex = post.likes.indexOf(userId);

        if (userIndex === -1) {
            // User has not liked the post, so add their ID
            post.likes.push(userId);
        } else {
            // User has already liked the post, so remove their ID
            post.likes.splice(userIndex, 1);
        }

        await post.save();
        res.status(200).json(post.likes.length); // Return the new like count
    } catch (err) {
        res.status(500).json("An error occurred: " + err.message);
    }
}




module.exports = { getPosts, getPost, createPost, deletePost, imgUpload, featurePost, createDraft, getDrafts, updateDraft, getDraft, deleteDraft, updateTags, likePosts }