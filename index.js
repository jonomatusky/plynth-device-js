const fs = require('fs');
const apiChain = require('./apiChain');
const Raspistill = require('node-raspistill').Raspistill;
const camera = new Raspistill({
  fileName: 'photo',
  encoding: 'jpg',
  outputDir: './resources',
  width: 1000,
  height: 750,
  time: 1000
});
const { exec } = require('child_process');

var stopCommand = `sudo shutdown -h now`;
var imagePath = './resources/photo.jpg';

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var button = new Gpio(17, 'in','rising', {debounceTimeout: 10}); //use GPIO pin 17 as input
var stopButton = new Gpio(4, 'in', 'rising'); //use GPIO 4 as off

//variables for multicolor LED
var redLED = new Gpio(14, 'out'); //use GPIO pin 14, and specify that it is output
var greenLED = new Gpio(15, 'out'); //use GPIO pin 15, and specify that it is output
var blueLED = new Gpio(18, 'out'); //use GPIO pin 18, and specify that it is output

LEDOff(); //turn LED off at program start

var testCameraCommand = 'sudo raspistill -t 1000 -o photo.jpg'; //had problems with later commands, this makes sure camera os working
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

  console.log('Button Pressed');
  LEDGreen(); //changes color to green

  exec(stopCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  });

  //this is the bulk of the program
  camera.takePhoto()
    .then((photo) => {
      console.log('Photo Captured');
      var fileName = 'photo' + Date.now() + '.jpg';
      var uploadCommand = './music-box/dropbox_uploader.sh upload ./resources/photo.jpg ./Player_Photos/' + fileName;
      exec(uploadCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }
      });
      return apiChain(imagePath)
      .then(playMopidy)
    })
});

stopButton.watch((err, value) => {
  if (err) {
    throw err;
  }

  console.log('Shutting Down');

  exec(stopCommand, (err, stdout, stderr) => {
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

async function getAlbumData(imagePath) {
  try {
    apiResponse = await apiChain(imagePath);
    console.log('The album ID is ' + apiResponse.albumId);
  } catch(e) {
    apiResponse = {
      error: true,
      errorMessage: "API requests failed."
    }
  }

  if (!apiResponse.error) {
    var play = playMopidy(apiResponse.albumId);
  } else {
    console.log('Error: ' + apiResponse.errorMessage);
  }
}

async function playMopidy(data) {
  var albumId = data.albumId;
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
