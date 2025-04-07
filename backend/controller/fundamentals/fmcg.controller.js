const FMCG = require('../../model/fundamentals/fmcg.model');

// Get all FMCG products
exports.getAllFMCGDetails = async (req, res) => {
    try {
        const products = await FMCG.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching FMCG products', error: err });
    }
};

// Get a single FMCG product by ID
exports.getFMCGById = async (req, res) => {
    try {
        const product = await FMCG.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching FMCG product', error: err });
    }
};

// Create a new FMCG product
exports.createFMCG = async (req, res) => {
    const { fmcg_name, fmcg_type, description, bg_color } = req.body;
    try {
        let FMCGName = await FMCG.findOne({ fmcg_name });
        if (FMCGName) {
            // Bank exists, check if management type exists
            const FMCGTypeIndex = FMCGName.parameter_types.findIndex(fmcg => fmcg.parameter_name === fmcg_type.charAt(0).toUpperCase() + fmcg_type.slice(1));

            if (FMCGTypeIndex >= 0) {
                // Management type exists, update the description if it's different
                if (!FMCGName.parameter_types[FMCGTypeIndex].descriptions.includes(description)) {
                    FMCGName.parameter_types[FMCGTypeIndex].descriptions = description;
                }
            } else {
                // Management type does not exist, create a new one
                const newFMCGType = {
                    parameter_name: fmcg_type.charAt(0).toUpperCase() + fmcg_type.slice(1),
                    descriptions: description,
                    bgColor: bg_color
                };
                FMCGName.parameter_types.push(newFMCGType);
            }

            // Save the updated FMCGName document
            const updatedBank = await FMCGName.save();
            res.status(200).json(updatedBank);
        } else {
            // Bank does not exist, create a new bank with the provided management type and description
            const newFMCGType = {
                parameter_name: fmcg_type.charAt(0).toUpperCase() + fmcg_type.slice(1),
                descriptions: description,
                bgColor: bg_color
            };

            const newIT = new FMCG({
                fmcg_name,
                parameter_types: [newFMCGType]
            });

            const savedBank = await newIT.save();
            res.status(201).json(savedBank);
        }
    } catch (err) {
        res.status(500).json({ message: 'Error creating FMCG product', error: err });
    }
};

// Update an existing FMCG product
exports.updateFMCG = async (req, res) => {
    try {
        const updatedProduct = await FMCG.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: 'Error updating FMCG product', error: err });
    }
};

// Delete an FMCG product
exports.deleteFMCG = async (req, res) => {
    try {
        const deletedProduct = await FMCG.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting FMCG product', error: err });
    }
};
