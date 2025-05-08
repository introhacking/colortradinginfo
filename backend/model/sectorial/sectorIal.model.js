const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  key: String,
  imgName: String,
  bufferData: Buffer,
  contentType: String,
});

const sectorialSchema = new mongoose.Schema({
  sectorialName: { type: String, required: true },
  month: { type: String },  // e.g., 'August', '2024-08'
  week: { type: Number },   // e.g., 34 (for the 34th week of the year)
  day: { type: Date},      // specific date
  imageData: [imageSchema]
}, 
{ timestamps: true });

const Sectorial = mongoose.model('Sectorial', sectorialSchema);

module.exports = Sectorial;


// const mongoose = require('mongoose');

// const imageSchema = new mongoose.Schema({
//   key: String,
//   imgName:String,
//   bufferData: Buffer,
//   contentType: String,
// });

// const sectorialSchema = new mongoose.Schema({
//   sectorialName: { type: String, required: true },
//   imageData: [imageSchema]
// },
//   { timestamps: true }
// );

// const Sectorial = mongoose.model('Sectorial', sectorialSchema);

// module.exports = Sectorial;
