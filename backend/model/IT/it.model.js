const mongoose = require('mongoose')

const CellSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    descriptions: {
        type: String,
        // required: true
    },
    bgColor: {
        type: String,
    },
}, {
    timestamps: true // This adds `createdAt` and `updatedAt` fields
});

const itTypesSchema = new mongoose.Schema({
    it_name: {
        type: String,
        required: true,
    },
    it_types: [CellSchema]
})
const itTypesSchemaModal = mongoose.model('ITFundament', itTypesSchema);
module.exports = itTypesSchemaModal