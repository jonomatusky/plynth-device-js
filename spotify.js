var request = require('request'); // "Request" library;

const spotifyApiUrl = 'https://api.spotify.com/v1/';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

var base64String = Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64');

async function queryOptions(spotifyToken, safeGuess) {
  return {
    method: 'GET',
    uri: spotifyApiUrl + 'search?q=' + safeGuess + '&type=album',
    json: true,
    auth: {
        'bearer': spotifyToken
    }
  }
}

module.exports = {
  queryOptions: queryOptions,
}