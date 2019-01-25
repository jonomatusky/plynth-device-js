const fs = require('fs');
const apiChain = require('./apiChain');
const Raspistill = require('node-raspistill').Raspistill;
const camera = new Raspistill({
  fileName: 'photo',
  encoding: 'jpg',
  outputDir: './resources',
  width: 1000,
  height: 750,
  time: 10
});
var imagePath = './resources/photo.jpg';
console.log('Index starting');
const { exec } = require('child_process');

var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var button = new Gpio(17, 'in','rising', {debounceTimeout: 10}); //use GPIO pin 17 as input, and 'both' button 

button.watch((err, value) => {
  if (err) {
    throw err;
  }

  console.log('Button Pressed');

  let stopCommand = `mpc stop`;
  console.log(stopCommand);
  exec(stopCommand, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`${stdout}`);
  });

  camera.takePhoto()
    .then((photo) => {
      console.log('took photo');
      var fileName = 'photo' + Date.now() + '.jpg';
      var uploadCommand = './dropbox_uploader.sh upload ./resources/photo.jpg ./Player_Photos/' + fileName;
      exec(uploadCommand, (err, stdout, stderr) => {
        if (err) {
          console.error(`exec error: ${err}`);
          return;
        }
        console.log(`${stdout}`);
      });
      return apiChain(imagePath)
      .then(playMopidy)
    })
});


async function getAlbumData(imagePath) {
  console.log('Performing googleVisionTest');
  // if (fs.existsSync(imagePath)) {
  //   console.log('File exists');
  try {
    apiResponse = await apiChain(imagePath);
    console.log('The album ID is ' + apiResponse.albumId);
  } catch(e) {
    apiResponse = {
      error: true,
      errorMessage: "API requests failed."
    }
  // } catch(err) {
  // console.log('File does not exist');
  // console.error(err)
  }

  if (!apiResponse.error) {
      // if (req.body.async) {
      //   res.json({
      //     error: false,
      //     googleVisionGuess: apiResponse.gvBestGuess,
      //     albumId: apiResponse.albumId
      //   });
      //   console.log('The album ID is ' + apiResponse.albumId);
      // } else {
      // res.render('player', {
      //   googleVisionGuess: apiResponse.gvBestGuess,
      //   embed: spotify.embed[0] + apiResponse.albumId + spotify.embed[1] 
      // });
      console.log('Now playing Mopidy');
      var play = playMopidy(apiResponse.albumId);
    // }
  } else {
    // if (req.body.async) {
    //   res.json({
    //     error: true,
    //     errorMessage: apiResponse.errorMessage
    //   });
    // } else {
      console.log('Error: ' + apiResponse.errorMessage);
    // }
  }
}

async function playMopidy(data) {
  var albumId = data.albumId;
  // console.log('Now playing ' + albumId.safeGuess);
  let command = `mpc clear; mpc add spotify:album:` + albumId + `; mpc play`;
  console.log(command);
  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
    console.log(`${stdout}`);
  });
}

//   // if (imagePath) {
//   //   try {
//   //     fs.unlinkSync('/app/public' + imagePath);
//   //   } catch (err) {
//   //     console.log('error deleting ' + imagePath + ': ' + err);
//   //   }
//   // }
// }



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
  
  // if (!apiResponse.error) {
  //   if (req.body.async) {
  //     res.json({
  //       error: false,
  //       googleVisionGuess: apiResponse.gvBestGuess,
  //       albumId: apiResponse.albumId
  //     });
  //   } else {
  //     res.render('player', {
  //       googleVisionGuess: apiResponse.gvBestGuess,
  //       embed: spotify.embed[0] + apiResponse.albumId + spotify.embed[1] 
  //     });
  //   }
  // } else {
  //   if (req.body.async) {
  //     res.json({
  //       error: true,
  //       errorMessage: apiResponse.errorMessage
  //     });
  //   } else {
  //     handleError(res, "Error: " + apiResponse.errorMessage);
  //   }
  // }
  // if (imagePath) {
  //   try {
  //     fs.unlinkSync('/app/public' + imagePath);
  //   } catch (err) {
  //     console.log('error deleting ' + imagePath + ': ' + err);
  //   }
  // }
// });

// function handleError(res, err) {
//   console.log("\nError");
//   console.log(JSON.stringify(err));
//   res.redirect('/error');
// }

