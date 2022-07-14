const axios = require('axios');
require('dotenv').config();

const sendHipScoreData = async (params) => {
  try {
    console.log('Sending hipscore data to BE ...');

    const res = await axios.post(`${process.env.LYG_HOST}/handle-hipscore-data`, params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.data;
  } catch (error) {
    console.error(error.response.data);
    return null;
  }
};

module.exports = async (params) => sendHipScoreData(params);
