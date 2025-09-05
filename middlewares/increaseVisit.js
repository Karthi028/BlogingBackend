const Post = require("../models/Postmodel");

const increasseVisit = async (req, res, next) => {
    const slug = req.params.slug;
    await Post.findOneAndUpdate({ slug }, { $inc: { views: 1 } });

    next();
};

module.exports = increasseVisit;