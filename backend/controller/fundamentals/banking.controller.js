const bankManagementSchema = require('../../model/fundamentals/bank.management.model');
const Bank = require('../../model/fundamentals/banking.model');
const readerFileService = require('../../services/fileReadingServices');
const fs = require('fs')



exports.createBankingDetails = async (req, res) => {
    const { bank_name, management_type, description, color } = req.body;

    try {
        // Find the bank by name
        let bank = await Bank.findOne({ bank_name });

        if (bank) {
            // Bank exists, check if management type exists
            const managementTypeIndex = bank.management_types.findIndex(mt => mt.management_name === management_type.charAt(0).toUpperCase() + management_type.slice(1));

            if (managementTypeIndex >= 0) {
                // Management type exists, update the description if it's different
                if (!bank.management_types[managementTypeIndex].descriptions.includes(description)) {
                    bank.management_types[managementTypeIndex].descriptions = description;
                }
            } else {
                // Management type does not exist, create a new one
                const newManagementType = {
                    management_name: management_type.charAt(0).toUpperCase() + management_type.slice(1),
                    descriptions: description,
                    bgColor: color
                };
                bank.management_types.push(newManagementType);
            }

            // Save the updated bank document
            const updatedBank = await bank.save();
            res.status(200).json(updatedBank);
        } else {
            // Bank does not exist, create a new bank with the provided management type and description
            const newManagementType = {
                management_name: management_type.charAt(0).toUpperCase() + management_type.slice(1),
                descriptions: description,
                bgColor: color
            };

            const newBank = new Bank({
                bank_name,
                management_types: [newManagementType]
            });

            const savedBank = await newBank.save();
            res.status(201).json(savedBank);
        }
    } catch (error) {
        console.error('Error saving document', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updatingBankDetails = async (req, res) => {
    const { bank_name, management_type, description , color } = req.body;
    try {
        // Find the bank by name
        const bank = await Bank.findOne({ bank_name });

        if (!bank) {
            return res.status(404).json({ error: 'Bank not found' });
        }

        // Find the management type
        const managementType = bank.management_types.find(mt => mt.management_name === management_type.charAt(0).toUpperCase() + management_type.slice(1));

        if (!managementType) {
            return res.status(404).json({ error: 'Management type not found' });
        }

        // Update the description
        managementType.descriptions = description;
        managementType.bgColor = color;

        // Save the updated bank document
        const updatedBank = await bank.save();

        res.status(200).json(updatedBank);
    } catch (error) {
        console.error('Error updating document', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
exports.getBankingDetails = async (req, res) => {
    try {
        const bankDetails = await Bank.find();
        res.status(200).json(bankDetails);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching bankDetails', details: err });
    }
};
exports.getDescriptionByBankAndManagement = async (req, res) => {
    const { bank_name, management_type } = req.query;

    try {
        // Find the bank by name
        const bank = await Bank.findOne({ bank_name });

        if (!bank) {
            return res.status(404).json({ error: 'Bank not found' });
        }
        // Find the specific management type within the bank
        const managementType = bank.management_types.find(mt => mt.management_name === management_type.charAt(0).toUpperCase() + management_type.slice(1));

        if (!managementType) {
            return res.status(404).json({ error: 'Management type not found' });
        }
        // Return the description
        res.status(200).json({ description: managementType.descriptions, bgColor: managementType.bgColor });
    } catch (error) {
        console.error('Error fetching description', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




// FILE UPLOAD
exports.postBankData = async (req, res) => {

    const filePath = req.file.path;
    const bankInfo = await readerFileService.bankExcelReader(filePath);

    // Process the data
    for (const record of bankInfo) {
        const { bank_name, management_type, description } = record;

        try {
            // Find the bank by name
            const bank = await Bank.findOne({ bank_name });

            if (bank) {
                // Bank exists, check if management type exists
                const managementTypeIndex = bank.management_types.findIndex(mt => mt.management_name === management_type.charAt(0).toUpperCase() + management_type.slice(1));

                if (managementTypeIndex >= 0) {
                    // Management type exists, update the description if it's different
                    if (!bank.management_types[managementTypeIndex].descriptions.includes(description)) {
                        bank.management_types[managementTypeIndex].descriptions = description;
                    }
                } else {
                    // Management type does not exist, create a new one
                    const newManagementType = {
                        management_name: management_type.charAt(0).toUpperCase() + management_type.slice(1),
                        descriptions: description
                    };
                    bank.management_types.push(newManagementType);
                }

                // Save the updated bank document
                const updatedBank = await bank.save();
                res.status(200).json(updatedBank);
            } else {
                // Bank does not exist, create a new bank with the provided management type and description
                const newManagementType = {
                    management_name: management_type.charAt(0).toUpperCase() + management_type.slice(1),
                    descriptions: description
                };

                const newBank = new Bank({
                    bank_name,
                    management_types: [newManagementType]
                });

                const savedBank = await newBank.save();
                console.log(savedBank)
                res.status(201).json(savedBank);
            }

        } catch (error) {
            console.error('Error saving document', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
