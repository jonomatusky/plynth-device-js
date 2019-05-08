const musicboxURL = 'http://musicbox.plynth.com/api/scans'
const fs = require('fs');
const request = require('request-promise-native')

const musicbox = async (imagePath) => {

    var options = {
        method: 'POST',
        uri: musicboxURL,
        formData: {
            file: {
                value: fs.createReadStream(imagePath),
                options: {
                    filename: 'test.jpg',
                    contentType: 'image/jpg'
                }
            }
        },
        headers: {
            /* 'content-type': 'multipart/form-data' */ // Is set automatically
        },
        json: true // Automatically parses the JSON string in the response
    };

    console.log('Asking Music Box')

    const response = await request(options)

    const album = response.album

    return album
}

module.exports = musicbox