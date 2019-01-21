const fs = require('fs');
const apiChain = require('./apiChain');

var imagePath = '${ __dirname }/resources/photo.jpg'

function googleVisionTest(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      apiResponse = apiChain(filePath, req, res);
      return apiResponse
    }
	  } catch(err) {
	    console.error(err)
  }
}

var testResults = googleVisionTest(imagePath);

console.log(testResults);

function handleError(res, err) {
  console.log("\nError");
  console.log(JSON.stringify(err));
  res.redirect('/error');
}