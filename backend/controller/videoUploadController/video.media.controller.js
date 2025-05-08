const mediaTable = require('../../model/videoUpload/media.model')

exports.getAllVideoLists = async (req, res) => {
    try {
        const media = await mediaTable.find()
        res.status(200).json(media)

    } catch (err) {
        res.status(400).json(err)
    }
}

exports.postVideoList = async (req, res) => {
    const { video_name } = req.body
    let videoPath = []

    if (Array.isArray(req.files.videos) && req.files.videos.length > 0) {
        for (let video of req.files.videos) {
            videoPath.push('/' + video.path)
        }
    }
    // Check if a single file is uploaded
    else if (req.files.videos) {
        // videoPath.push('/' + req.files.videos.path);
        
        // Replace backslashes with forward slashes
        videoPath.push('/' + video.path.replace(/\\/g, '/'));
    }
    try {
        const createMedia = await mediaTable.create({
            name: video_name,
            videos: videoPath
        })
        // await mediaTable.save();
        res.status(201).json({ message: 'Media crated successfullly', createMedia })

    } catch (err) {
        res.status(400).json(err)
    }
}