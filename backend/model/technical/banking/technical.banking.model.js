// const mongoose = require('mongoose');

// const createTechicalBankingSchema = (headers) => {
//   const schemaDefinition = {};
//   headers.forEach(header => {
//     schemaDefinition[header] = { type: String };
//   });

//   const TechicalBankingSchema = new mongoose.Schema(schemaDefinition);
//   return mongoose.model('TechicalBanking', TechicalBankingSchema);
// };

// module.exports = createTechicalBankingSchema;


const mongoose = require('mongoose');

const createTechicalBankingSchema = (headers) => {
  const schemaDefinition = {};
  headers.forEach(header => {
    schemaDefinition[header] = { type: String };
  });

  const TechicalBankingSchema = new mongoose.Schema(schemaDefinition);

  // Check if the model is already defined to prevent OverwriteModelError
  const modelName = 'TechicalBanking';
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  return mongoose.model(modelName, TechicalBankingSchema);
};

module.exports = createTechicalBankingSchema;
