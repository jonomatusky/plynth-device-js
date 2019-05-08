const fs = require('fs');
const apiChain = require('./apiChain');
const Raspistill = require('node-raspistill').Raspistill;
const musicbox = require('./musicbox')
const camera = new Raspistill({
  fileName: 'photo',
  encoding: 'jpg',
  outputDir: './resources',
  width: 1000,
  height: 750,
  time: 2000
});
const { exec } = require('child_process');

var stopCommand = `mpc stop`;
var offCommand = `sudo shutdown -h now`;
var imagePath = './resources/photo.jpg';

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var button = new Gpio(16, 'in','both', {debounceTimeout: 10}); //use GPIO pin 17 as input
var offButton = new Gpio(3, 'in', 'falling'); //use GPIO 3 as off

//variables for multicolor LED
var redLED = new Gpio(17, 'out'); //use GPIO pin 14, and specify that it is output
var greenLED = new Gpio(27, 'out'); //use GPIO pin 15, and specify that it is output
var blueLED = new Gpio(22, 'out'); //use GPIO pin 18, and specify that it is output

LEDOff(); //turn LED off at program start
console.log('Running')

//had problems with later commands, this makes sure camera is working
var testCameraCommand = 'sudo raspistill -t 1000 -o photo.jpg -ex auto'; 
exec(testCameraCommand, (err, stdout, stderr) => {
  if (err) {
    console.error(`exec error: ${err}`);
    return;
  }
});

button.watch((err, value) => {
  if (err) {
    throw err;
  } 
  if (value === 1) { 
    console.log('Album On');
    LEDGreen(); //changes color to green
    camera.takePhoto()
    .then((photo) => {
      console.log('Photo Captured');
      var fileName = 'photo' + Date.now() + '.jpg';
      var uploadCommand = '../Dropbox-Uploader/dropbox_uploader.sh upload ./resources/photo.jpg ./Plynth/Plynthv1-2' + fileName;
      exec(uploadCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }
      });

      // return apiChain(imagePath)
      return musicbox(imagePath)
      .then(playMopidy)
    })
  } else {
    console.log('Album Off');
    exec(stopCommand, (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`);
        return;
      }
    });
    LEDOff();
  }
});

offButton.watch((err, value) => {
  if (err) {
    throw err;
  }

  console.log('Shutting Down');

  exec(offCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  });
});

function LEDOn() { 
  redLED.writeSync(1);
  greenLED.writeSync(1); 
  blueLED.writeSync(1);
}

function LEDOff() {
  redLED.writeSync(0);
  greenLED.writeSync(0);
  blueLED.writeSync(0);
}

function LEDGreen() {
  redLED.writeSync(0);
  greenLED.writeSync(1);
  blueLED.writeSync(0);
}

// async function getAlbumData(imagePath) {
//   try {
//     apiResponse = await apiChain(imagePath);
//     console.log('The album ID is ' + apiResponse.albumId);
//   } catch(e) {
//     apiResponse = {
//       error: true,
//       errorMessage: "API requests failed."
//     }
//   }

//   if (!apiResponse.error) {
//     var play = playMopidy(apiResponse.albumId);
//   } else {
//     console.log('Error: ' + apiResponse.errorMessage);
//   }
// }

async function playMopidy(data) {
  // var albumId = data.albumId;
  const albumId = data.spotifyId
  console.log('Now playing album');
  LEDOn();
  let command = `mpc clear; mpc add spotify:album:` + albumId + `; mpc play`;
  // console.log(command);
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  });
}
