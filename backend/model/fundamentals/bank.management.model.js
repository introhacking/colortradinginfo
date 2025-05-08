const mongoose = require('mongoose');

const bankMangementTypeSchema = new mongoose.Schema({
  management_name: {
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
},
  {
    timestamps: true // This adds `createdAt` and `updatedAt` fields
  })
const bankManagementSchema = mongoose.model('BankMangementType', bankMangementTypeSchema);

module.exports = bankManagementSchema;
