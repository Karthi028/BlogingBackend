const { Webhook } = require("svix");
const { CLERK_SECRET } = require("../utils/config");
const User = require("../models/Usermodel");
const Commentsmodel = require("../models/Commentsmodel");
const Postmodel = require("../models/Postmodel");
const Draftpostmodel = require("../models/Draftpostmodel");

const clerkHook = async (req, res) => {

    const secret = CLERK_SECRET;

    if (!secret) {
        console.error('Clerk Webhook Secret is not set in environment variables.');
        return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    const payload = req.body;
    const headers = req.headers;

    let evt;
    try {
        const wh = new Webhook(secret);
        evt = wh.verify(payload, headers);
    } catch (err) {
        console.error('Webhook verification failed:', err.message);
        return res.status(400).json({ success: false, message: 'Webhook signature verification failed.' });
    }

    console.log('Incoming Clerk webhook event:', evt);

    const { username, email_addresses, image_url } = evt.data;
    const clerkUserID = evt.data.id;

    try {
        switch (evt.type) {
            case 'user.created':
            case 'user.updated':

                const email = email_addresses.length > 0 ? email_addresses[0].email_address : null;

                if (email) {
                    await User.findOneAndUpdate({ email },
                        { clerkUserId: clerkUserID, img: image_url, username: username || email },
                        { upsert: true, new: true, setDefaultsOnInsert: true }
                    );

                    console.log(`Successfully processed '${evt.type}' event for user: ${clerkUserID}`);
                    break;
                } else {
                    console.warn(`Webhook event '${evt.type}' received with no email address. Skipping.`);
                }

                break;

            case 'user.deleted':
                const deleteUser = await User.findOne({ clerkUserId:clerkUserID });

                if (deleteUser) {
                    await User.findByIdAndDelete(deleteUser._id);

                    await Commentsmodel.deleteMany({ user: deleteUser._id });
                    await Postmodel.deleteMany({ user: deleteUser._id });
                    await Draftpostmodel.deleteMany({user: deleteUser._id});

                    console.log(`Successfully processed '${evt.type}' event for user: ${clerkUserID}`);
                } else {
                    console.log(`User not found for clerkUserId: ${clerkUserID}`);
                }
                break;
        }

        return res.status(200).json({ success: true, message: `Webhook event '${evt.type}' processed.` });

    } catch (error) {

        console.error(`Database operation failed for event '${evt.type}':`, error);
        return res.status(500).json({ success: false, message: `Failed to process event '${evt.type}'.` });
    }

}


module.exports = { clerkHook }


