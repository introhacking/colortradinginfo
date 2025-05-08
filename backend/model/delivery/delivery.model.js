const mongoose = require('mongoose');
const deliveryStockSchema = new mongoose.Schema({
    stockName: { type: String, required: true },
    volumnDeliveryData: { type: [Number] },
},
    {
        timestamps: true // This adds `createdAt` and `updatedAt` fields
    });

const volumnDeliverySchema = mongoose.model('deliverySchema', deliveryStockSchema);
module.exports = volumnDeliverySchema;