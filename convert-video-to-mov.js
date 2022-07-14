const fs = require('fs');

let ffmpeg = require('ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const convertVideoToMov = async (oldPath, filePath, tmpFilePath) => {
  console.log('Beginning convert video ...');

  await ffmpeg(oldPath)
    .output(tmpFilePath)
    .on('end', (error) => {
      if (error) throw error;
      fs.rename(tmpFilePath, filePath, (err) => {
        if (err) throw err;
        console.log('Video has been coverted to mov!');
      });
    })
    .on('error', () => {
      console.log('Cannot convert video to mov!');
    })
    .run();
};

module.exports = async (tmpPath, filePath, tmpFilePath) => {
  convertVideoToMov(tmpPath, filePath, tmpFilePath);
};
