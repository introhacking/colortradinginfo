const mongoose = require('mongoose');
const smallStockSchema = new mongoose.Schema({
    stockName: { type: String, required: true },
    monthlyData: { type: [Number], required: true },
},
    {
        timestamps: true // This adds `createdAt` and `updatedAt` fields
    });

const smallCapSchema = mongoose.model('smallStockSchema', smallStockSchema);
module.exports = smallCapSchema;