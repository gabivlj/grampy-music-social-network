const router = require('express').Router();
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const handleError = require('../lib/handleError');
const LastFm = require('../classes/Lastfm');

/**
 * @GET
 * @PUBLIC
 * @description Testing purposes
 */
router.get('/', (req, res) => {});

/**
 * @GET
 * @PUBLIC
 * @description Get all data for the profile.
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const profile = {};
  const [error, user] = await handleError(User.findById({ _id: id }));
  if (error) {
    console.log(error);
    return res.status(404).json({ error: 'Error finding the profile ' });
  }
  const playlists = Playlist.find({ user: user.username });
  profile.user = user.username;
  // Find real ratings...
  profile.ratedAlbums = user.ratedAlbums;

  const lastFm = new LastFm();
  const albums = lastFm.getUsersArtist(user.username);
  const [errorPromise, [playlistsFinal, albumsFinal]] = handleError(
    await Promise.all([playlists, albums])
  );
  if (errorPromise) {
    console.log(errorPromise);
    return res.status(404).json({ error: 'Error providind profile' });
  }
  profile.playlists = playlistsFinal;
  profile.albums = albumsFinal;
  res.json({ profile });
});

/**
 * @GET
 * @PUBLIC
 * @description Gets all the playlists from an user.
 */
router.get('/playlists/:username', async (req, res) => {
  const { username } = req.params;
  const [errors, playlists] = await handleError(
    Playlist.find({ user: username })
  );
  if (errors) {
    return res.status(404).json({ error: 'No playlists!' });
  }
  return res.json({ playlists });
});

module.exports = router;
