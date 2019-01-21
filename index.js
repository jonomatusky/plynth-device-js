const fs = require('fs');
const child_process = require('child_process');
// const PiCamera = require('pi-camera');
// const myCamera = new PiCamera({
//   mode: 'photo',
//   output: `${ __dirname }/resources/photo.jpg`,
//   width: 640,
//   height: 480,
//   nopreview: true,
// });
const apiChain = require('./apiChain');

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button 
var impagePath = '${ __dirname }/resources/photo.jpg'

//snaps a pic and saves it when the button is pressed
pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton GPIO, specify callback function
  if (err) { //if an error
    console.error('There was an error', err); //output error message to console
  return;
  }

  let filename = 'photo.jpg';
  let args = ['-w', '640', '-h', '480', '-o', filename, '-t', '1'];
  let spawn = child_process.spawn('raspistill', args);

  // check to see that a photo file exists
  

  try {
    if (fs.existsSync(imagePath)) {
      apiResponse = await apiChain(imagePath, req, res);
      console.log(apiResponse);
    }
	  } catch(err) {
	    console.error(err)
  }


  // var apiResponse;
  // var imagePath = false;
  // if (req.file && req.file.filename) {
  //   imagePath = './resources/photo.jpg';
  // } else {
  // }
    
  // if (imagePath) {
  //   try {
  //     apiResponse = await apiChain(imagePath, req, res);
  //   } catch(e) {
  //     apiResponse = {
  //       error: true,
  //       errorMessage: "API requests failed."
  //     }
  //   }
  // }
  
  if (!apiResponse.error) {
    if (req.body.async) {
      res.json({
        error: false,
        googleVisionGuess: apiResponse.gvBestGuess,
        albumId: apiResponse.albumId
      });
    } else {
      res.render('player', {
        googleVisionGuess: apiResponse.gvBestGuess,
        embed: spotify.embed[0] + apiResponse.albumId + spotify.embed[1] 
      });
    }
  } else {
    if (req.body.async) {
      res.json({
        error: true,
        errorMessage: apiResponse.errorMessage
      });
    } else {
      handleError(res, "Error: " + apiResponse.errorMessage);
    }
  }
  if (imagePath) {
    try {
      fs.unlinkSync('/app/public' + imagePath);
    } catch (err) {
      console.log('error deleting ' + imagePath + ': ' + err);
    }
  }
});

function handleError(res, err) {
  console.log("\nError");
  console.log(JSON.stringify(err));
  res.redirect('/error');
}