const gcpApiUrl = 'https://vision.googleapis.com/v1/images:annotate?'
const GCP_API_KEY = process.env.GOOGLE_CLOUD_VISION_API_KEY;
const fs = require('fs');

async function getGcpOptions(file) {
  var bitmap = fs.readFileSync(file);
  var imageData = Buffer(bitmap).toString('base64');
  
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