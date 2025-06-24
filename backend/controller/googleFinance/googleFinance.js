const yahooFinance = require('yahoo-finance2').default;

exports.getNSEPrice = async (req, res) => {
    const { symbol } = req.query;

    try {
        if (!symbol) {
            return res.status(400).json({ error: "Symbol is required" });
        }

        // Quote
        const quote = await yahooFinance.quote(`${symbol}.NS`);
        // Chart: last 5 days
        // const history = await yahooFinance.chart(`${symbol}.NS`, {
        //     range: '5d',
        //     interval: '1d'
        // });

        // const sparklineData = history?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];

        return res.status(200).json({
            ...quote,
            // sparklineData
        });

    } catch (error) {
        console.error(`Error fetching price for ${symbol}:`, error.message);
        return res.status(500).json({ error: "Unable to fetch stock data" });
    }
};

// getNSEPrice('RELIANCE'); // example for RELIANCE.NS
