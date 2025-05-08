require('dotenv').config()
const express = require('express')
const app = express()
const fs = require('fs');
const cors = require('cors')
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');
const csvRoutes = require('./router/fromURL/fromURLrouter');



// Connect to MongoDB
connectDB();
const cookieParser = require("cookie-parser");
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start cron job
require('./cron/fetchJob');


const largeCapRoute = require('./router/sentimentalRouter/largeCap.router');
app.use('/api/v1', largeCapRoute)

const midCapRoute = require('./router/sentimentalRouter/midCap.router');
app.use('/api/v1', midCapRoute)

const smallCapRoute = require('./router/sentimentalRouter/smallCap.router');
app.use('/api/v1', smallCapRoute)

// Routes
const userRoutes = require('./router/fundamentalRouter/fundamentals.router');
app.use('/api/v1', userRoutes);

const bankManagementRoutes = require('./router/fundamentalRouter/bank.management.router');
app.use('/api/v1', bankManagementRoutes);
// IT Route
const ITRoutes = require('./router/itRouter/itRouter.router');
app.use('/api/v1', ITRoutes)

// Use FMCG routes
const FMCGRoute = require('./router/fundamentalRouter/fmcg.router')
app.use('/api/v1', FMCGRoute);
// Use Technical banking routes
const technicalBankingRoute = require('./router/technicalRouter/banking/technical.banking.router')
app.use('/api/v1', technicalBankingRoute);

// Use Technical banking routes of OPG
const technicalBankingRouteOPG = require('./router/technicalRouter/banking/technical.banking.OPG.router')
app.use('/api/v1', technicalBankingRouteOPG);

// Use Technical banking routes of OPG
const technicalBankingRouteNPG = require('./router/technicalRouter/banking/technical.banking.NPG.router')
app.use('/api/v1', technicalBankingRouteNPG);

// Use Delivery routes
const deliveryRoute = require('./router/deliveryRouter/deliveryRoute')
app.use('/api/v1', deliveryRoute);

// Use Sector routes
const sectorRoute = require('./router/sectorialRouter/sectorial.router')
app.use('/api/v1', sectorRoute);

// Use URL Routes
app.use('/api/v1/csv', csvRoutes);

const getDataFromURL2 = require('./router/fromURL/fromURLrouter')
// Use URL2 Routes
app.use('/api/v1', getDataFromURL2);


// Use Video router
const videoRoute = require('./router/videoUploadRouter/videoUpload.router');
app.use('/api/v1', videoRoute);

const { exportData } = require('./controller/controller');
app.use('/api/v1/export-data', exportData)

// [ SCRUBBING CAPS ROUTER ]
const scrubbingRoute = require('./router/capScrubbingRouter/capScrubbingRoute');
app.use('/api/v1', scrubbingRoute)

// [ CARD DELIVERY ]
const cardDeliveryRoutes = require('./router/cardDeliveryRouter/cardDeliveryRouter');
app.use('/api/v1', cardDeliveryRoutes)


app.get('/api/v1/csv-files', (req, res) => {
    const folderPath = path.join(__dirname, 'uploads/csvfilefolder');
    fs.readdir(folderPath, (err, files) => {
        if (err) return res.status(500).json({ error: 'Cannot read directory' });
        const csvFiles = files.filter(f => f.endsWith('.csv'));
        res.json({ files: csvFiles });
    });
});

// app.get('/api/v1/csv-files/small-cap', (req, res) => {
//     const folderPath = path.join(__dirname, 'uploads/scrubbing/SMALLCAP');
//     fs.readdir(folderPath, (err, files) => {
//         if (err) return res.status(500).json({ error: 'Cannot read directory' });
//         const csvFiles = files.filter(f => f.endsWith('.csv'));
//         res.json({ files: csvFiles });
//     });
// });
// app.get('/api/v1/csv-files/mid-cap', (req, res) => {
//     const folderPath = path.join(__dirname, 'uploads/scrubbing/MIDCAP');
//     fs.readdir(folderPath, (err, files) => {
//         if (err) return res.status(500).json({ error: 'Cannot read directory' });
//         const csvFiles = files.filter(f => f.endsWith('.csv'));
//         res.json({ files: csvFiles });
//     });
// });

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    setTimeout(() => {
    }, 1500);
});