const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const express = require('express');
require('dotenv').config();

const updateAnalysisStatus = require('./update-analysis-status');
// const convertVideo = require('./convert-video-to-mov');
const analysisCsvFile = require('./analysis-csv-file');
const getDeviceTokens = require('./get-device-tokens');
const uploadVideo2S3 = require('./upload-video-to-s3');
const sendHipScoreData = require('./send-hipscore-data');
const sendNotification = require('./send-notification-to-ios');

let watcher = null;
let newPath = '';
let newTmpPath = '';

if (process.env.DUMMY_PATH) {
  watcher = chokidar.watch(`${process.env.DUMMY_PATH}/*`, { ignored: /^\./, persistent: true });
} else {
  watcher = chokidar.watch(`${process.env.MATLAB_PATH}/results/*.csv`, { ignored: /^\./, persistent: true });
}

const removeTmpVideos = async (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

const handle = () => {
  watcher
    .on('add', async (filePath) => {
      console.log('File', filePath, 'has been added');

      const csvData = await analysisCsvFile(filePath);
      const fileName = path.basename(filePath);
      const array = fileName.split('_');
      const userId = array[1];
      const deviceTokens = await getDeviceTokens(userId);
      console.log(deviceTokens);
      const videoUpload = (process.env.DUMMY_PATH) ? filePath : newTmpPath;
      console.log(videoUpload);
      const videoUrl = await uploadVideo2S3(userId, videoUpload);
      await removeTmpVideos(videoUpload);

      const params = {
        user_id: userId,
        video_hipscore_url: videoUrl,
        ...csvData,
      };
      console.log(params);
      const hipScoreData = await sendHipScoreData(params);
      console.log(hipScoreData);
      await sendNotification(deviceTokens, hipScoreData);

      console.log('Finish!');
    })
    .on('change', (filePath) => { console.log('File', filePath, 'has been changed'); })
    .on('unlink', (filePath) => { console.log('File', filePath, 'has been removed'); })
    .on('error', (error) => { console.error('Error happened', error); });
};

handle();

// API
const app = express();

app.post('/videos', (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      res.status(400).json({ message: 'Upload fail!' });
      res.end();
      return;
    }

    console.log('Begin analysis video!');

    if (files.video) {
      updateAnalysisStatus(fields.user_id);

      const now = new Date();
      const oldPath = files.video.filepath;

      if (process.env.DUMMY_PATH) {
        const newDummyPath = `${process.env.DUMMY_PATH}/${now.getTime()}_${fields.user_id}_${files.video.originalFilename}`;
        fs.rename(oldPath, newDummyPath, (error) => {
          if (error) throw error;
          res.status(200).json({ message: 'File uploaded and moved!' });
          res.end();
        });

        return;
      }

      newPath = `${process.env.MATLAB_PATH}/movie/newmovie/${now.getTime()}_${fields.user_id}_${files.video.originalFilename}`;
      newTmpPath = `${process.env.MATLAB_PATH}/tmpmovie/${now.getTime()}_${fields.user_id}_${files.video.originalFilename}`;
      fs.rename(oldPath, newPath, (error) => {
        if (error) throw error;
        fs.copyFileSync(newPath, newTmpPath);
        res.status(200).json({ message: 'File uploaded and moved!' });
        res.end();
      });

      /*
      if (files.video.mimetype === 'video/quicktime') {
        fs.rename(oldPath, newPath, (error) => {
          if (error) throw error;
          res.status(200).json({ message: 'File uploaded and moved!' });
          res.end();
        });
      } else if (files.video.mimetype.includes('video/')) {
        newPath = newPath.replace('.mp4', '.mov').replace('.avi', '.mov');
        newTmpPath = newTmpPath.replace('.mp4', '.mov').replace('.avi', '.mov');
        convertVideo(oldPath, newPath, newTmpPath);
        res.status(200).json({ message: 'File uploaded and moved!' });
        res.end();
      } else {
        res.status(400).json({ message: 'Cannot handle video!' });
        res.end();
      }
      */

      return;
    }

    res.status(400).json({ message: 'Upload fail!' });
    res.end();
  });
});

app.listen(process.env.APP_PORT, () => {
  console.log(`Example app listening on port ${process.env.APP_PORT}`);
});
