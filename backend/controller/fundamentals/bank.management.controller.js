const bankManagementModel  = require('../../model/fundamentals/bank.management.model')

exports.createBankingManagementName = async (req, res) => {
    // const { bank_name, management_name, management_value } = req.body;
    console.log(req.body)
    try {
        const newBankManagement = await new bankManagementModel(req.body);
        await newBankManagement.save();
        res.status(201).json(newBankManagement);
    } catch (err) {
        res.status(400).json({ error: 'Error creating bank', details: err });
    }
};
exports.getBankingManagementDetails = async (req, res) => {
    try {
        const bankManagementDetails = await bankManagementModel.find();
        console.log(bankManagementDetails)
        res.status(200).json(bankManagementDetails);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching bankDetails', details: err });
    }
};