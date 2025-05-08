const mongoose = require('mongoose')

const mediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    videos: [{
        type: String,
        required: true
    }],
}, {
    timestamps: true // This adds `createdAt` and `updatedAt` fields
});

const mediaSchemaModal = mongoose.model('mediaSchema', mediaSchema);
module.exports = mediaSchemaModal