const axios = require('axios');
require('dotenv').config();

const firebaseParams = {
  topicName: 'LYG',
  title: 'くるあ',
  body: '動画解析が完了しました。',
};

const NOTIFICATION_TYPE = {
  ANALYSIS_VIDEO: 0,
};

const execute = async (url, data) => {
  try {
    // console.log(url);
    await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FIREBASE_FCM_KEY}`,
      },
    });
  } catch (error) {
    console.error(error.response.status, error.response.data);
  }
};

const subscribeTopic = async (deviceTokens, topicName) => {
  const data = {
    to: `/topics/${topicName}`,
    registration_tokens: deviceTokens,
  };

  await execute(process.env.FIREBASE_SUBCRIBE_TOPIC_URL, data);
};

const unsubscribeTopic = async (deviceTokens, topicName) => {
  const data = {
    to: `/topics/${topicName}`,
    registration_tokens: deviceTokens,
  };

  await execute(process.env.FIREBASE_UNSUBCRIBE_TOPIC_URL, data);
};

const sendNotification = async (params, hipscoreData) => {
  const data = {
    to: `/topics/${params.topicName}`,
    notification: {
      title: params.title ?? 'LYG',
      body: params.body ?? 'Hello my friend',
    },
    data: {
      type: NOTIFICATION_TYPE.ANALYSIS_VIDEO,
      data: hipscoreData,
    },
  };

  await execute(process.env.FIREBASE_SEND_NOTIFICATION_URL, data);
};

module.exports = async (deviceTokens, hipscoreData) => {
  console.log('Sending notification to Mobile ...');

  await subscribeTopic(deviceTokens, firebaseParams.topicName);
  await sendNotification(firebaseParams, hipscoreData);
  await unsubscribeTopic(deviceTokens, firebaseParams.topicName);
};
