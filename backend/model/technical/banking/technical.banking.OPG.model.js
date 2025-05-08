const mongoose = require('mongoose');

const createTechicalBankingSchemaOPG = (headers) => {
  const schemaDefinition = {};
  headers.forEach(header => {
    schemaDefinition[header] = { type: String };
  });

  const TechicalBankingOPGSchema = new mongoose.Schema(schemaDefinition);
  
  const modelName = 'TechicalBankingOPG';
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }

  return mongoose.model(modelName, TechicalBankingOPGSchema);
};

module.exports = createTechicalBankingSchemaOPG;