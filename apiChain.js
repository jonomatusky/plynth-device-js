var rp = require('request-promise-native');
const Mopidy = require('mopidy');
// var mopidy = new Mopidy({
//     webSocketUrl: "ws://localhost:6680/mopidy/ws/",
//     callingConvention: "by-position-or-by-name"
// });
const { exec } = require('child_process');
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// var Spotify = require ('spotify-web');

// const projectUrl = 'https://' + process.env.PROJECT_DOMAIN + '.glitch.me';
const googleVision = require('./googleVision');
const spotify = require('./spotify');
const censoredWords = require('./censoredWords');

// let spotifyToken = await spotify.getToken();

// data is a variable that gets passed through the whole chain
// imagePath is the url of the image on the server
async function askGoogleVision(data, imagePath) {
  return new Promise(async function(resolve, reject) {
    console.log("Asking Google Vision");
    let gcpVisionOptions = await googleVision.getGcpOptions(imagePath);
    let gvGuess = await rp(gcpVisionOptions);
    if (gvGuess) {
      data.gvGuess = gvGuess;
      resolve(data);
    } else {
      reject(Error("No response from Google Vision"));
    }
  });
}

// Gets the "best guess" from the Google Vision response object
// Splits the string into an array to check for words we want to remove
// censoredWords.js has a list of words that should be removed (like 'cd')
function checkGoogleVisionGuess(data) {
  const gvGuess = data.gvGuess;
  // console.log("Google Vision Guess: " + JSON.stringify(gvGuess));
  let guess = gvGuess.responses[0].webDetection.bestGuessLabels[0].label;
  console.log("Google Vision Guess: " + guess);
  data.gvBestGuess = guess;

  if (!guess) {
    throw('No guess from google ¯\_(ツ)_/¯ ');
    return;
  }
  
  let guessArray = guess.split(" ");
  let safeArray = []
  for (var i in guessArray) {
    let safe = true;
    if (censoredWords.censoredWords.indexOf(guessArray[i]) > -1) {
      safe = false; 
    }
    if (safe) {
      safeArray.push(guessArray[i]); 
    }
  }
  data.safeArray = safeArray;
  return data;   
}


// Before asking spotify remove anything in the Google Vision
// guess before a hyphen (-) character. The Google Vision API was
// was putting record label info in, which was confusing the
// Spotify API.
// Then query spotify API using spotifyApiRequest.
// It is a separate function because if the Spotify API returns 0
// albums the app will ask it again with 1 fewer word.
async function askSpotifyApi(data) {
  const safeGuessArray = data.safeArray;
  let albumId = false;
  let spotifyData = {};
  let splitSafeGuessArray = splitGuessAtHyphen(safeGuessArray);
  for (var i = splitSafeGuessArray.length; i > 0; i--) {
    spotifyData = await spotifyApiRequest(splitSafeGuessArray.slice(0, i));
    // console.log(spotifyData);
    if (spotifyData.albums && spotifyData.albums.items && spotifyData.albums.items[0]) {
      albumId = spotifyData.albums.items[0].id;
      console.log('Album found, Album ID is: ' + albumId);
    }
    if (albumId) {
      break;
    }
  }
  
  if (!albumId) {
    console.log('Spotify Error -- Out of words to guess');
    throw('No items: ' + splitSafeGuessArray + '(' + safeGuessArray + ')');
  }
  data.albumId = albumId;
  return data;
}

// askSpotifyApi uses this funciton to actually query the API.
async function spotifyApiRequest(splitSafeGuessArray) {
  let safeGuess = splitSafeGuessArray.join(" ");
  console.log('Now querying Spotify for: ' + safeGuess);
  // console.log('Asking for Token');
  // console.log('Client ID: ' + SPOTIFY_CLIENT_ID);
  // request.post(authOptions, function(error, response, body) {
  //   if (!error && response.statusCode === 200) {
  //     console.log('Spotify Token Received');
  //     var spotifyToken = body.access_token;
  //     // use the access token to access the Spotify Web API
  //     console.log('Token: ' + spotifyToken);
  //     return spotifyToken;
  //   }
  // });
  var base64String = Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');
  
  var tokenOptions = {
    method: 'post',
    uri: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + base64String      
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  }

  let tokenData = await rp(tokenOptions);
  let spotifyToken = await tokenData.access_token;
  // console.log('Spotify Token is ' + spotifyToken);
  let spotifyQueryOptions = await spotify.queryOptions(spotifyToken, safeGuess);
  let spotifyData = await rp(spotifyQueryOptions);
  if (spotifyData.albums.items.length === 0) {
    console.log("No Items");
    return false;
  } else {
    // console.log("Spotify Response :" + JSON.stringify(spotifyData));
    return spotifyData;
  }
}

// This function throws away everything before a hyphen (-) character
// from the Google Vision guess. This is because on a few example
// queries it was adding things like the record label name along with the
// artist which was confusing the spotify API.
function splitGuessAtHyphen(safeGuessArray) {
  let splitArray = safeGuessArray;
  if (safeGuessArray.length > 0) {
    let hyphenIndex = safeGuessArray.indexOf('-');  
    if (hyphenIndex > -1) {
      splitArray = safeGuessArray.slice(hyphenIndex + 1, safeGuessArray.length);
    }
  }
  return splitArray;
}

function apiChain(imagePath) {
  // console.log("apiChain started");
  let data = {};
  
  return askGoogleVision(data, imagePath)
  .then(checkGoogleVisionGuess)
  .then(askSpotifyApi)
  .then((data) => {
    data.error = false;
    return data;
  })
    .catch(function (err) {
    console.log(err);
    data.error = true;
    data.errorMessage = err;
    return data;
  });
  // .then((data) => {
  //   data.error = false;
  //   return data;
  // })
  // .catch(function (err) {
  //   console.log(err);
  //   data.error = true;
  //   data.errorMessage = err;
  //   return data;
  // });
}

module.exports = apiChain;