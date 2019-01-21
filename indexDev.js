const fs = require('fs');
const apiChain = require('./apiChain');

var imagePath = './resources/photo.jpg';
console.log('IndexDev starting');

var testResults = googleVisionTest(imagePath);
console.log('Performed googleVisionTest');

async function googleVisionTest(imagePath) {
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
      console.log('The album ID is ' + apiResponse.albumId);
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

  // if (imagePath) {
  //   try {
  //     fs.unlinkSync('/app/public' + imagePath);
  //   } catch (err) {
  //     console.log('error deleting ' + imagePath + ': ' + err);
  //   }
  // }
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