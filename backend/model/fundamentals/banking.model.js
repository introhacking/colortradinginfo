// const bankMangementTypeSchema = require('./bank.management.model').schema;
const { mongoose } = require('mongoose');

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
const bankingSchema = new mongoose.Schema({
  bank_name: {
    type: String,
    required: true,
    // unique: true
  },
  management_types: [bankMangementTypeSchema]

});

const Bank = mongoose.model('Banking', bankingSchema);

module.exports = Bank;
