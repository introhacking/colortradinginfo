require('dotenv').config()
const express = require('express')
const http = require('http');
const app = express()
const fs = require('fs');
const cors = require('cors')
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');
const csvRoutes = require('./router/fromURL/fromURLrouter');
const userMiddlewareVerification = require('./middleware/userMiddlewareVerification');
// WebSocket Setup
const { Server } = require('socket.io');
const server = http.createServer(app);


// Connect to MongoDB
connectDB();
const cookieParser = require("cookie-parser");

// WebSocket Setup
const io = new Server(server, {
    path: "/socket.io", // Default
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
        credentials: true
    }
});

// Export io to use in cron file

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
    });
});


app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
module.exports.io = io;

app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start cron job
require('./cron/fetchJob');

// [ LOGIN ]
const loginRoute = require('./router/authRouter/authRoute');
app.use('/api/v1', loginRoute)

// [ GOOGLE FINANCE ]
const googleFinanceRoute = require('./router/googleFinanceRouter/googleFinanceRouter');
app.use('/api/v1', googleFinanceRoute)

app.use(userMiddlewareVerification);

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

// [ SCRAPING CAPS ROUTER ]
const scrapingRoute = require('./router/capScrubbingRouter/capScrubbingRoute');
app.use('/api/v1', scrapingRoute)

// [ CARD DELIVERY ]
const cardDeliveryRoutes = require('./router/cardDeliveryRouter/cardDeliveryRouter');
app.use('/api/v1', cardDeliveryRoutes)


// [ GET ALL LISTS FOLDER ]
app.get('/api/v1/csv-files', (req, res) => {
    const folderPath = path.join(__dirname, 'uploads/csvfilefolder');
    fs.readdir(folderPath, (err, files) => {
        if (err) return res.status(500).json({ error: 'Cannot read directory' });
        const csvFiles = files.filter(f => f.endsWith('.csv'));
        res.json({ files: csvFiles });
    });
});

// [ SCRUBBING CAPS ROUTER ]
const masterRoute = require('./router/masterScreenRouter/masterRouter');
app.use('/api/v1', masterRoute)

// [ GOOGLE FINANCE ]
const ResearchRoute = require('./router/researchRouter/research');
app.use('/api/v1', ResearchRoute)

// [ GOOGLE FINANCE ]
const { fetchAndSortLiveNSEData } = require('./controller/googleFinance/googleFinance');
const { everyMinuteResearchJob, trackingListsJobEveryMin } = require('./cron/fetchJob');

// [ TRACKING ]
const TrackingRoute = require('./router/trackingRouter/trackingRouter');
const { getUserTrackingList } = require('./controller/tracking/tracking.Ctrl');
app.use('/api/v1', TrackingRoute)

// const { getNSELiveData } = require('./controller/googleFinance/googleFinance');

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
// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);


//     // Push updates every 60 seconds
//     setInterval(async () => {
//         const data = await fetchAndSortLiveNSEData();
//         io.emit('liveStockData', data);
//     }, 60000);

//     // Push updates every 60 seconds
//     // setInterval(async () => {
//     //     const data = await fetchGoogleSheets();
//     //     io.emit('live-sheet-update', data);
//     // }, 1000);
// });

if (process.env.NODE_ENV !== 'ci') {
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);

        setInterval(async () => {
            const data = await fetchAndSortLiveNSEData();
            // await getUserTrackingList()
            io.emit('liveStockData', data);
        }, 60000);
    });
    everyMinuteResearchJob();
    // trackingListsJobEveryMin();
}
