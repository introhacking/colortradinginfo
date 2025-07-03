const mongoose = require('mongoose');

const researchSchema = new mongoose.Schema({
    stock_name: { type: String, required: true },
    buy_sell: { type: String },
    trigger_price: { type: Number },
    target_price: { type: Number },
    stop_loss: { type: Number },
    chart: { type: String },
    rationale: { type: String },
},
    { timestamps: true });

const Research = mongoose.model('Research', researchSchema);

module.exports = Research;