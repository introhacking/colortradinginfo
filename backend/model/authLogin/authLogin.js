const mongoose = require('mongoose');

const authSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    disclaimer: {
        type: Boolean,
        default: false
    },
    verify: {
        type: Boolean,
        default: false
    },
    allowedScreens: [{ type: String }] // NEW: list of allowed screens for this user

}, {
    timestamps: true // This adds `createdAt` and `updatedAt` fields
});

module.exports = mongoose.model('Authlogin', authSchema);
