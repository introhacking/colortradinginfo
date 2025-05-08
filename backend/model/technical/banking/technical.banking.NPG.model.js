const mongoose = require('mongoose');

const createTechicalBankingSchemaNPG = (headers) => {
  const schemaDefinition = {};
  headers.forEach(header => {
    schemaDefinition[header] = { type: String };
  });

  const TechicalBankingNPGSchema = new mongoose.Schema(schemaDefinition);

  const modelName = 'TechicalBankingNPG';
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  return mongoose.model(modelName, TechicalBankingNPGSchema);
};

module.exports = createTechicalBankingSchemaNPG;