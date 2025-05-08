const mongoose = require('mongoose');

const cellSchema = new mongoose.Schema({
    parameter_name: {
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
const fmcgParameterTypesSchema = new mongoose.Schema({
    fmcg_name: {
        type: String,
        required: true,
    },
    parameter_types: [cellSchema]
})

const FMCG = mongoose.model('FMCG', fmcgParameterTypesSchema);

module.exports = FMCG;
