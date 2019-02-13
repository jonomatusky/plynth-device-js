const gcpApiUrl = 'https://vision.googleapis.com/v1/images:annotate?'
const GCP_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY;
const fs = require('fs');
// const b64req = require('request-promise-native').defaults({
//   encoding: 'base64'
// })

// async function getGcpOptions(imageUrl) {
  // let imageData = await b64req({uri: imageUrl})
  // .catch(error => {
  //   console.log("Error");
  //   console.log(error);
  // });

async function getGcpOptions(file) {
  // read binary data
  // convert binary data to base64 encoded string
  var bitmap = fs.readFileSync(file);
  var imageData = Buffer(bitmap).toString('base64');

  // console.log('Google Vision API Key: ' + GCP_API_KEY);
  
  return {
    method: 'POST',
    uri: gcpApiUrl + 'key=' + GCP_API_KEY,
    body: {
      "requests":[
        {
          "image":{
            content: imageData
          },
          "features":[
            {
              "type":"WEB_DETECTION",
              "maxResults":1
            }
          ]
        }
      ]
    },
    json: true // Automatically stringifies the body to JSON
  }
}

module.exports = {
  getGcpOptions: getGcpOptions
}