const ITSchema = require("../../model/IT/it.model");



exports.getITDetails = async (req, res) => {
    try {
        const responseData = await ITSchema.find()
        res.status(200).json(responseData)

    } catch (err) {
        res.status(500).json({ error: 'Error fetching bankDetails', details: err })
    }
}


exports.createITDetails = async (req, res) => {
    const { it_name, it_type, description, bg_color } = req.body;
    let ITName = await ITSchema.findOne({ it_name });
    try {
        if (ITName) {
            // Bank exists, check if management type exists
            const ITTypeIndex = ITName.it_types.findIndex(it => it.name === it_type.charAt(0).toUpperCase() + it_type.slice(1));

            if (ITTypeIndex >= 0) {
                // Management type exists, update the description if it's different
                if (!ITName.it_types[ITTypeIndex].descriptions.includes(description)) {
                    ITName.it_types[ITTypeIndex].descriptions = description;
                }
            } else {
                // Management type does not exist, create a new one
                const newITType = {
                    name: it_type.charAt(0).toUpperCase() + it_type.slice(1),
                    descriptions: description,
                    bgColor: bg_color
                };
                ITName.it_types.push(newITType);
            }

            // Save the updated ITName document
            const updatedBank = await ITName.save();
            res.status(200).json(updatedBank);
        } else {
            // Bank does not exist, create a new bank with the provided management type and description
            const newITType = {
                name: it_type.charAt(0).toUpperCase() + it_type.slice(1),
                descriptions: description,
                bgColor: bg_color
            };

            const newIT = new ITSchema({
                it_name,
                it_types: [newITType]
            });

            const savedBank = await newIT.save();
            res.status(201).json(savedBank);
        }
    } catch (err) {
        // Handle any errors that occur during saving
        res.status(500).json({ message: 'Internal server error', error: err.message });
    }
}
// New endpoint to update a specific cell
exports.updateITCell = async (req, res) => {
    const { it_name, it_type, description, bg_color } = req.body;

    try {
        // Find the bank by name
        const ITName = await ITSchema.findOne({ it_name });

        if (!ITName) {
            return res.status(404).json({ error: 'IT name not found' });
        }

        // Find the management type
        const ITType = ITName.it_types.find(it => it.name === it_type.charAt(0).toUpperCase() + it_type.slice(1));

        if (!ITType) {
            return res.status(404).json({ error: 'IT type not found' });
        }

        // Update the description
        ITType.descriptions = description;
        ITType.bgColor = bg_color

        // Save the updated ITName document
        const updatedIT = await ITName.save();

        res.status(200).json(updatedIT);
    } catch (error) {
        console.error('Error updating document', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getDescriptionByItNameAndItType = async (req, res) => {

    const { it_name, it_type} = req.query
    // const { it_name, it_type } = req.query;
    
    try {
        const ITName = await ITSchema.findOne({ it_name });
        if (!ITName) {
            return res.status(404).json({ error: 'IT name not found' });
        }
        const ITType = ITName.it_types.find(it => it.name === it_type.charAt(0).toUpperCase() + it_type.slice(1));
        if (!ITType) {
            return res.status(404).json({ error: 'IT type not found' });
        }
        // Return the description
        // console.log({ description: ITType.descriptions, bgColor: ITType.bgColor })
        res.status(200).json({ description: ITType.descriptions, bgColor: ITType.bgColor });

    } catch (err) {
        console.error('Error fetching description', err);
        res.status(500).json({ error: 'Internal server error' });

    }

}
