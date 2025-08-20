const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(`${process.env.DB_HOST}/${process.env.DB_NAME}`);
//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error('Error connecting to MongoDB', err);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error('❌ MONGO_URI is not defined');
    }

    await mongoose.connect(uri);

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
