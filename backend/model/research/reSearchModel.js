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
    createdBy: { type: String },
    isTriggered: { type: Boolean, default: null },
    isAtRisk: { type: Boolean, default: null },
    isTargetHit: { type: Boolean, default: null },
    wasActive: { type: Boolean, default: false }

},
    { timestamps: true });

const Research = mongoose.model('Research', researchSchema);

module.exports = Research;