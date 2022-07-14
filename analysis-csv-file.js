const csv = require('csvtojson');

const analysisCsv = async (csvFilePath = '') => {
  if (csvFilePath.includes(process.env.MATLAB_PATH)) {
    const csvArray = await csv({
      noheader: true,
      output: 'csv',
    }).fromFile(csvFilePath);

    if (csvArray.length === 2) {
      const abductionDegree = csvArray[0];
      const bendingDegree = csvArray[1];

      return {
        left: {
          abduction: abductionDegree[0],
          bending: bendingDegree[0],
        },
        right: {
          abduction: abductionDegree[1],
          bending: bendingDegree[1],
        },
      };
    }
  }

  const getRandomArbitrary = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

  return {
    left: {
      abduction: getRandomArbitrary(45, 180),
      bending: getRandomArbitrary(90, 180),
    },
    right: {
      abduction: getRandomArbitrary(45, 180),
      bending: getRandomArbitrary(90, 180),
    },
  };
};

module.exports = async (csvFilePath) => analysisCsv(csvFilePath);
