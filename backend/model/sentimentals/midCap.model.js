const mongoose = require('mongoose');
const midStockSchema = new mongoose.Schema({
    stockName: { type: String, required: true },
    monthlyData: { type: [Number], required: true },

}, {
    timestamps: true // This adds `createdAt` and `updatedAt` fields
});

const midCapSchema = mongoose.model('midStockSchema', midStockSchema);
module.exports = midCapSchema;