const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
require('dotenv').config();

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
};
AWS.config.update({ credentials, region: process.env.AWS_DEFAULT_REGION });
const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  signatureVersion: 'v4',
});

const uploadVideo2S3 = (userId, filePath) => {
  console.log('Uploading video to s3 storage ...');

  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const fileKey = process.env.AWS_FILE_NAME.replace('{userId}', userId).replace('{date}', date).replace('{extension}', path.extname(filePath));

  s3.putObject({
    Bucket: process.env.AWS_BUCKET,
    Body: fs.readFileSync(filePath),
    Key: fileKey,
  }).promise()
    .then(() => {
      console.log('Upload to s3 succeeded!');
    })
    .catch((err) => {
      console.error('Upload to s3 failed:', err.code);
    });

  return process.env.AWS_URL + fileKey;
};

module.exports = async (userId, filePath) => uploadVideo2S3(userId, filePath);
