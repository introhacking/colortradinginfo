const researchModel  = require('../../model/research/reSearchModel')


exports.getResearchDetails = async (req, res) => {
    try {
        const researchDetails = await researchModel.find();
        res.status(200).json(researchDetails);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching researchModel', details: err });
    }
};