/**
 * SEE commentSection.js
 */
const mongoose = require('mongoose');

const { Schema } = mongoose;
const CommentSchema = new Schema({
  text: { type: String, required: true },
  username: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  likes: [{ user: { type: Schema.Types.ObjectId, ref: 'users' } }],
  dislikes: [{ user: { type: Schema.Types.ObjectId, ref: 'users' } }],
  date: {
    type: Date,
    default: Date.now(),
  },
});

const CommentSectionSchema = new Schema({
  comments: [CommentSchema],
  referencedObjectId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('comment_sections', CommentSectionSchema);
