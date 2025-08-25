const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },

    // userId should reference a Authlogin model
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Authlogin", required: true },

    // trackingList as an array of objects (stocks or items tracked)
    trackingList: [
        {
            // stockId: { type: String, required: true }, // unique id of stock/item
            stockName: { type: String, required: true, set: v => v.toUpperCase() },
            // cmp: { type: Number }, // Current Market Price (optional)
            addedAt: { type: Date, default: Date.now },
        },
    ],
},
    { timestamps: true }
);

const Tracking = mongoose.model('Tracking', trackingSchema);

module.exports = Tracking;