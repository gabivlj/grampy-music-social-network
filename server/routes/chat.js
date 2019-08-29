const router = require('express').Router();
const passport = require('passport');
const handleError = require('../lib/handleError');
const Chat = require('../models/Chat');
const dontCareWaitingForSave = require('../lib/dontCareWaitingForSave');
const getProfiles = require('../lib/getProfiles');
const User = require('../models/User');

/**
 * @description Route for getting all the chats of an user.
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.user;
    const [err, chats] = await handleError(
      Chat.find({
        [`users.${id}.id`]: id
      }).sort({ lastTalked: -1 })
    );
    const users = [];
    chats.forEach(chat => {
      // get other user
      const keys = Object.keys(chat.users);
      keys.forEach(user => {
        if (user !== id) {
          users.push(user);
        }
      });
    });
    const profiles = await getProfiles(users);
    let chatsResponse = [];

    if (profiles) {
      chatsResponse = chats.map((chat, index) => ({
        _id: chat._id,
        users: chat.users,
        messages: chat.messages,
        images: profiles.filter(
          profile => String(profile._id) === String(users[index])
        )[0].images,
        otherUser: users[index]
      }));
    }
    if (err) {
      return res.status(404).json({ error: 'Error retrieving chats.' });
    }
    return res.json({ chats: chatsResponse });
  }
);

/**
 * @description Route for adding a message to a chat, if it doesn't exists, it creates it.
 */
router.post(
  '/new',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { user } = req;
    const { text, from, to } = req.body;
    const userIdFrom = from._id;
    const userIdTo = to._id;
    // todo: check if both of the users follow each other.
    const [err, chat] = await handleError(
      Chat.findOne({
        [`users.${userIdFrom}.id`]: userIdFrom,
        [`users.${userIdTo}.id`]: userIdTo
      })
    );
    if (err) {
      return res.status(404).json({ error: 'Error posting message.' });
    }
    if (
      user.followedAccounts.indexOf(userIdTo) < 0 ||
      user.followers.indexOf(userIdTo) < 0
    ) {
      return res
        .status(400)
        .json({ error: 'Error, you are not friends with the other!' });
    }
    if (!chat) {
      const Ch = new Chat({
        users: {
          [userIdFrom]: {
            id: userIdFrom,
            username: from.username,
            notification: false
          },
          [userIdTo]: {
            id: userIdTo,
            username: to.username,
            notification: true
          }
        },
        messages: [{ text, user: userIdFrom, username: from.username }],
        lastTalked: Date.now()
      });
      const newChat = await Ch.save();
      return res.json({ chat: newChat });
    }
    const msgs = [
      ...chat.messages,
      { text, user: userIdFrom, username: from.username }
    ];
    chat.users[userIdTo].notification = true;
    chat.messages = msgs;
    chat.lastTalked = Date.now();
    dontCareWaitingForSave(chat, true);
    return res.json({ chat });
  }
);

// todo
router.post(
  '/deleteNotification',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {}
);

router.get(
  '/get/notification',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {}
);

/**
 * @description Route for getting the chat between 2 users. Returns null and a message if it doesn't exist.
 */
router.get(
  '/:otherUserId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.user;
    const { otherUserId } = req.params;
    const [err, chat] = await handleError(
      Chat.findOne({
        [`users.${id}.id`]: id,
        [`users.${otherUserId}.id`]: otherUserId
      })
    );
    if (err) {
      console.log(err);
      return res.status(404).json({ error: 'Error finding chat.' });
    }
    if (!chat) {
      return res.status(201).json({
        chat: null,
        message: 'Empty chat, send a message to start chatting!'
      });
    }
    return res.json({ chat });
  }
);

/**
 * @description Route for getting the chat. Returns chat: null and a message if it doesn't exist.
 */
router.get(
  '/get/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.user;
    const [err, chat] = await handleError(
      Chat.findOne({
        [`users.${id}.id`]: id,
        _id: req.params.id
      })
    );
    if (err) {
      console.log(err);
      return res.status(404).json({ error: 'Error finding chat.' });
    }
    if (!chat) {
      return res.status(201).json({
        chat: null,
        message: 'Empty chat, send a message to start chatting!'
      });
    }
    return res.json({ chat });
  }
);

module.exports = router;
