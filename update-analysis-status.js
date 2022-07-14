const axios = require('axios');
require('dotenv').config();

const updateAnalysisStatus = async (userId) => {
  try {
    console.log(`Updating analysis status of user id ${userId} ...`);
    await axios.put(`${process.env.LYG_HOST}/update-analysis-status-processing/${userId}`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = async (userId) => updateAnalysisStatus(userId);
