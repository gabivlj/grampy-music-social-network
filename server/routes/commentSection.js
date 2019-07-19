/**
 * @@@@ UPDATE: Ok so I think we are definitely using this.
 */
const express = require('express');

const router = express.Router();
const passport = require('passport');
const CommentLib = require('../classes/Comment');
const Comment = require('../models/Comment');

/**
 * @GET
 * @PUBLIC
 * @DESCRIPTION Returns all the comments sorted by date
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { current = 0, limit = 50, userId } = req.query;
  try {
    let commentSection = await Comment.find({ objectId: id }).sort({
      date: -1,
    });

    if (!commentSection) {
      return res.status(404).json({ error: 'Comment section not found.' });
    }
    // NOTE (GABI): Prob. slice with the Mongodb .project() ?
    // @https://stackoverflow.com/questions/46348860/nodejs-mongodb-perform-slice-operation-on-an-array-field
    commentSection = commentSection.slice(current, limit);
    const comments = [];
    for (const comment of commentSection) {
      const commentP = {
        text: comment.text,
        username: comment.username,
        user: comment.user,
        __v: comment.__v,
        likes: parseInt(comment.likes.length, 10),
        dislikes: parseInt(comment.dislikes.length, 10),
        _id: comment._id,
      };
      const copy = CommentLib.setHasLikedOrDislikedProperty(comment, userId);
      commentP.liked = copy.liked;
      commentP.disliked = copy.disliked;
      comments.push(commentP);
    }

    res.json({ comments });
  } catch (err) {
    console.log(err);
    return res
      .status(404)
      .json({ error: 'Comment section not found.', log: err });
  }
});

/**
 * @POST
 * @PRIVATE
 * @DESCRIPTION Posts a comment to the comment database. (This is the good one)
 */
router.post(
  '/:objectId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { text, username, userId = req.user.id } = req.body;
    const { objectId } = req.params;
    const comment = new Comment({
      text,
      username,
      objectId,
      likes: [],
      dislikes: [],
      user: userId,
    });
    await comment.save();
    return res.json({ comment });
  }
);

/**
 * @POST
 * @PRIVATE
 * @DESCRIPTION Posts a like to the specified id comment.
 */
router.post(
  '/like/:comment_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { comment_id } = req.params;
    const { id } = req.user;
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found ' });
    }
    const returnedComment = CommentLib.addOpinionToSingleComment(
      comment,
      id,
      'likes',
      'dislikes'
    );
    const finalComment = {
      text: returnedComment.text,
      username: returnedComment.username,
      user: returnedComment.user,
      __v: returnedComment.__v,
      likes: parseInt(returnedComment.likes.length, 10),
      dislikes: parseInt(returnedComment.dislikes.length, 10),
      _id: returnedComment._id,
    };
    const copy = CommentLib.setHasLikedOrDislikedProperty(returnedComment, id);
    finalComment.liked = copy.liked;
    finalComment.disliked = copy.disliked;
    returnedComment.save();
    res.json({ comment: finalComment });
  }
);

/**
 * @POST
 * @PRIVATE
 * @DESCRIPTION Posts a dislike to the specified id comment.
 */
router.post(
  '/dislike/:comment_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { comment_id } = req.params;
    const { id } = req.user;
    const comment = await Comment.findById(comment_id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found ' });
    }
    const returnedComment = CommentLib.addOpinionToSingleComment(
      comment,
      id,
      'dislikes',
      'likes'
    );
    const finalComment = {
      text: returnedComment.text,
      username: returnedComment.username,
      user: returnedComment.user,
      __v: returnedComment.__v,
      likes: parseInt(returnedComment.likes.length, 10),
      dislikes: parseInt(returnedComment.dislikes.length, 10),
      _id: returnedComment._id,
    };

    const copy = CommentLib.setHasLikedOrDislikedProperty(returnedComment, id);
    finalComment.liked = copy.liked;
    finalComment.disliked = copy.disliked;
    returnedComment.save();
    res.json({ comment: finalComment });
  }
);

module.exports = router;