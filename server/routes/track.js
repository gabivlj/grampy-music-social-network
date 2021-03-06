const router = require('express').Router();
const Lastfm = require('../classes/Lastfm');
const Track = require('../models/Track');

const fm = new Lastfm(null);

/**
 * @GET
 * @PUBLIC
 * @DESCRIPTION Get the tracks from the lastFM api or our API
 */
router.get('/tracks', async (req, res) => {
  try {
    const { searchData } = req.query;
    const { tracks } = await fm.searchTracks(searchData);
    const apiTracks = await Track.find({
      // Search api tracks that atleast one of the params includes a string of the searchQuery
      // TODO! maybe sort by matches
      $or: [
        { name: { $regex: searchData, $options: 'i' } },
        { artist: { $regex: searchData, $options: 'i' } },
        { album: { $regex: searchData, $options: 'i' } },
      ],
    });

    return res.json({
      lastfm: tracks.track,
      api: { tracks: apiTracks || [], matches: apiTracks.length },
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json(err);
  }
});

module.exports = router;
