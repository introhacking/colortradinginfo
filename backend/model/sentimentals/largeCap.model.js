const mongoose = require('mongoose');
const largeStockSchema = new mongoose.Schema({
    stockName: { type: String, required: true },
    monthlyData: { type: [Number], required: true },
},
    {
        timestamps: true // This adds `createdAt` and `updatedAt` fields
    });

const largerCapSchema = mongoose.model('largeStockSchema', largeStockSchema);
module.exports = largerCapSchema;