const { default: mongoose } = require("mongoose");
const bcrypt = require('bcrypt');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is Required'],
        trim: true,
        maxlength: [50, 'name cannot be more than 50 character']
    },
    email: {
        type: String,
        required: [true, "Kindly Provide your email"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        ]

    },
    password: {
        type: String,
        required: [true, "kindly provide your password"],
        minlength: [6, "Password must be atleast 6 characters"],
        select: false
    },
    roles: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    profile: {
        bio: {
            type: String,
            maxlength: 250,
        },
        profilePhoto: String,//Url or path to image
        socialMedia: {
            Instagram: String,
            Twitter: String,
            linkedin: String,
        },
    },
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post', // 'Post' refers to the name of the Post model.
        },
    ],
    joinDate: {
        type: Date,
        default: Date.now,
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    emailverified: {
        type: Boolean,
        default: false
    },
    emailVerifytoken: String,
    passwordResettoken: String,
    passwordResetExpires: Date
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    next();

});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
};


module.exports = mongoose.model("User", userSchema, "Users");