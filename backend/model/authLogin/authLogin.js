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

});

module.exports = mongoose.model('Authlogin', authSchema);
