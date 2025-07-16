const mongoose = require('mongoose');
const mediaTable = require('../../model/videoUpload/media.model')
const path = require('path');
const fs = require('fs');


exports.getAllVideoLists = async (req, res) => {
    try {
        const media = await mediaTable.find()
        res.status(200).json(media)

    } catch (err) {
        res.status(400).json(err)
    }
}

exports.postVideoList = async (req, res) => {
    const { video_name, modules } = req.body; // expecting structured JSON
    // const videoFiles = req.files?.videos || [];

    const videoFiles = req.files || [];


    let videoIndex = 0; // Track position in req.files.videos if array

    try {
        // Construct modules with chapters and video paths
        const structuredModules = JSON.parse(modules).map(module => ({
            moduleName: module.moduleName,
            chapters: module.chapters.map(chapter => ({
                chapterName: chapter.chapterName,
                videos: chapter.videos.map(videoTitle => {
                    const file = videoFiles[videoIndex++];
                    return {
                        title: videoTitle,
                        url: '/' + file.path.replace(/\\/g, '/')
                    };
                })
            }))
        }));

        const createdMedia = await mediaTable.create({
            name: video_name,
            modules: structuredModules
        });

        res.status(201).json({ message: 'Media created successfully', createdMedia });

    } catch (err) {
        console.error(err);
        res.status(400).json({ error: 'Failed to create media', details: err.message });
    }
};

// DELETE /media/:mediaId/video
exports.deleteSpecificVideo = async (req, res) => {
    const { id } = req.params;
    const { moduleName, chapterName, videoTitle, videoUrl } = req.body;

    try {
        const media = await mediaTable.findById(id);
        if (!media) return res.status(404).json({ message: 'Media not found' });

        const moduleIndex = media.modules.findIndex(mod => mod.moduleName === moduleName);
        if (moduleIndex === -1) return res.status(404).json({ message: 'Module not found' });

        const module = media.modules[moduleIndex];

        const chapterIndex = module.chapters.findIndex(chap => chap.chapterName === chapterName);
        if (chapterIndex === -1) return res.status(404).json({ message: 'Chapter not found' });

        const chapter = module.chapters[chapterIndex];

        const videoIndex = chapter.videos.findIndex(v => v.title === videoTitle);
        if (videoIndex === -1) return res.status(404).json({ message: 'Video not found' });

        // ✅ Delete the actual video file from the filesystem
        const filePath = path.join(__dirname, '../../', videoUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // ✅ Remove the video entry
        chapter.videos.splice(videoIndex, 1);

        // ✅ If chapter has no videos → remove chapter
        if (chapter.videos.length === 0) {
            module.chapters.splice(chapterIndex, 1);
        }

        // ✅ If module has no chapters → remove module
        if (module.chapters.length === 0) {
            media.modules.splice(moduleIndex, 1);
        }

        // ✅ If media has no modules → delete media
        if (media.modules.length === 0) {
            await mediaTable.findByIdAndDelete(id);
            return res.status(200).json({ message: 'All videos deleted — media removed' });
        }

        // ✅ Save the updated media if not fully deleted
        await media.save();

        res.status(200).json({ message: 'Video deleted and structure cleaned' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal error during deletion', details: err.message });
    }
};

exports.updatingSpecificVideo = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        moduleName,
        newModuleName,
        chapterName,
        newChapterName,
        originalTitle,
        newTitle,
    } = req.body;

    try {
        const media = await mediaTable.findById(id);
        if (!media) return res.status(404).json({ message: 'Media not found' });

        let updated = false;

        // Optional media name update
        if (name && media.name !== name) {
            media.name = name;
            updated = true;
        }

        for (const mod of media.modules) {
            if (mod.moduleName === moduleName) {
                if (newModuleName && mod.moduleName !== newModuleName) {
                    mod.moduleName = newModuleName;
                    updated = true;
                }

                for (const chap of mod.chapters) {
                    if (chap.chapterName === chapterName) {
                        if (newChapterName && chap.chapterName !== newChapterName) {
                            chap.chapterName = newChapterName;
                            updated = true;
                        }

                        for (const vid of chap.videos) {
                            if (vid.title === originalTitle) {
                                if (newTitle && vid.title !== newTitle) {
                                    vid.title = newTitle;
                                    updated = true;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (!updated) {
            return res.status(400).json({ message: 'No updates performed. Please modify a field.' });
        }

        await media.save();
        res.status(200).json({ message: 'Video info updated successfully', updatedMedia: media });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


//  [ currently not working ]
exports.postVideoList_first = async (req, res) => {
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











// =-------------------------------------------------------------------------------------------------------------------------------- //
// ============================================= DATABASE OPERATION EXCUTE HERE ============================================ //
//  DELETE 

exports.deleteOrTruncateTable = async (req, resp) => {

    try {
        const db = mongoose.connection;
        const collection = db.collection('media'); // Ensure the collection name matches exactly
        // console.log(collection); // Logging to check if the collection is retrieved
        await collection.deleteMany({});
        resp.status(200).json('Table rows data successfully delete');
    } catch (error) {
        console.error('Error truncating collection:', error);
    }

}