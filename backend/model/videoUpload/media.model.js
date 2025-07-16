const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    }
});

const chapterSchema = new mongoose.Schema({
    chapterName: {
        type: String,
        required: true
    },
    videos: [videoSchema]
});

const moduleSchema = new mongoose.Schema({
    moduleName: {
        type: String,
        required: true
    },
    chapters: [chapterSchema]
});

const mediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    modules: [moduleSchema]
}, {
    timestamps: true
});

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;




// const mongoose = require('mongoose')

// const mediaSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true
//     },
//     videos: [{
//         type: String,
//         required: true
//     }],
// }, {
//     timestamps: true // This adds `createdAt` and `updatedAt` fields
// });

// const mediaSchemaModal = mongoose.model('mediaSchema', mediaSchema);
// module.exports = mediaSchemaModal