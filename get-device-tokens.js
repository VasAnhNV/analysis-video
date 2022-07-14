const axios = require('axios');
require('dotenv').config();

const getDeviceTokens = async (userId) => {
  try {
    console.log(`Getting token devices of user id ${userId} ...`);

    const res = await axios.get(`${process.env.LYG_HOST}/token-devices`, { params: { user_id: userId } });

    return res.data.data;
  } catch (error) {
    console.error(error.response.data);
  }

  return {};
};

module.exports = async (userId) => getDeviceTokens(userId);
