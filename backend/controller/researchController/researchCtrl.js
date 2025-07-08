const researchModel = require('../../model/research/reSearchModel')
const yahooFinance = require('yahoo-finance2').default;


// exports.getResearchDetails = async (req, res) => {
//     try {
//         const researchDetails = await researchModel.find();
//         res.status(200).json(researchDetails);
//     } catch (err) {
//         res.status(500).json({ error: 'Error fetching researchModel', details: err });
//     }
// };


exports.getResearchDetails = async (req, res) => {
    try {
        const researchDetails = await researchModel.find();

        // Use Promise.all to fetch all quotes concurrently
        const enrichedDetails = await Promise.all(
            researchDetails.map(async (item) => {
                const symbol = item.stockName;

                try {
                    const quote = await yahooFinance.quote(`${symbol}.NS`);
                    const currentPrice = quote?.regularMarketPrice || null;
                    const regularMarketChange = quote?.regularMarketChange || null;
                    const regularMarketDayLow = quote?.regularMarketDayLow || null;

                    return {
                        ...item._doc, // spread existing item
                        currentMarketPrice: currentPrice,
                        regularMarketChange: regularMarketChange,
                        regularMarketDayLow: regularMarketDayLow

                    };
                } catch (err) {
                    console.error(`Error fetching quote for ${symbol}:`, err.message);
                    return {
                        ...item._doc,
                        currentMarketPrice: null,
                        regularMarketChange: regularMarketChange,
                        regularMarketDayLow: regularMarketDayLow,
                        quoteError: `Could not fetch quote for ${symbol}`
                    };
                }
            })
        );

        res.status(200).json(enrichedDetails);
    } catch (err) {
        console.error('Database fetch error:', err.message);
        res.status(500).json({ error: 'Error fetching research data', details: err.message });
    }
};


// [ POST ]
exports.postResearchItem = async (req, res) => {
    try {
        const { stockName, buy_sell, trigger_price, target_price, stop_loss, rationale } = req.body;

        if (!stockName) {
            return res.status(400).json({ error: 'Stock Name is required' });
        }

        const chartData = req.file
            ? {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
            : null;

        const newItem = new researchModel({
            stockName,
            buy_sell,
            trigger_price,
            target_price,
            stop_loss,
            chart: chartData,
            rationale
        });
        await newItem.save();
        res.status(201).json({
            message: 'Research item saved successfully',
            // item: newItem
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save item' });
    }
};

// [ GET/:_id ]
exports.getDataBasedUponId = async (req, res) => {
    try {
        const item = await researchModel.findById(req.params._id);
        if (!item) {
            return res.status(404).send({ message: 'No data found' });
        }
        res.send(item);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving' });
    }
};

// [ UPDATE:/_id ]
exports.updateResearchById = async (req, resp) => {
    const { stockName, ...rest } = req.body;
    try {
        const updateData = {
            ...rest,
        };

        // If a file is uploaded, set chart
        if (req.file) {
            updateData.chart = {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            };
        }

        const updatedResearch = await researchModel.findOneAndUpdate(
            { stockName },
            { $set: updateData },
            { new: true, upsert: true }
        );
        resp.status(200).json({ message: `${stockName} Data updated successfully` });
    } catch (err) {
        resp.status(500).json({ err: 'Internal server error' });
    }

}

// [ DELETE/:_id ]
exports.deleteResearchById = async (req, resp) => {
    const id = req.params._id
    try {
        const document = await researchModel.findById(id);
        if (!document) {
            return resp.status(404).json({ err: 'Document not found' });
        }
        const deleteStatus = await researchModel.deleteOne({ _id: id })
        resp.status(200).json('Deleted successfully');
    } catch (err) {
        resp.status(500).json({ err: 'Internal server error' });
    }
}