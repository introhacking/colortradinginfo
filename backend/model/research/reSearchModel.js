const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
    stockName: { type: String, required: true, set: v => v.toUpperCase() },
    buy_sell: { type: String, enum: ['buy', 'sell'] },
    trigger_price: { type: Number },
    target_price: { type: Number },
    stop_loss: { type: Number },
    chart: {
        data: Buffer,
        contentType: String
    },
    rationale: { type: String },
},
    { timestamps: true });

const Research = mongoose.model('Research', researchSchema);

module.exports = Research;