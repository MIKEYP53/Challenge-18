const router = require('express').Router();
const Thought = require('../../models/Thought');
const User = require('../../models/User');
const mongoose = require('mongoose');

// GET all thoughts
router.get('/', async (req, res) => {
  try {
    const thoughts = await Thought.find().select('-userId');
    res.json(thoughts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET a single thought by its _id
router.get('/:id', async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id).select('-__v');

    if (!thought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }

    res.json(thought);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST to create a new thought and push the thought's _id to the associated user's thoughts array
router.post('/', async (req, res) => {
  try {
    const { thoughtText, userId } = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the thought
    const thought = await Thought.create({
      thoughtText,
      userId: userId,
      username: user.username,
    });

    // Update the user's thoughts array
    await User.findByIdAndUpdate(userId, { $push: { thoughts: thought._id } });

    // Send the response with selected fields
    res.json(await Thought.findById(thought._id).select('-userId')); // Exclude userId
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT to update a thought by its _id
router.put('/:id', async (req, res) => {
  try {
    const thought = await Thought.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!thought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }

    res.json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE to remove a thought by its _id
router.delete('/:id', async (req, res) => {
  try {
    const thought = await Thought.findByIdAndDelete(req.params.id);

    if (!thought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }

    // Optionally, remove the thought from the user's thoughts array
    await User.updateMany(
      { thoughts: req.params.id },
      { $pull: { thoughts: req.params.id } }
    );

    res.json({ message: 'Thought deleted!' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// /api/thoughts/:thoughtId/reactions

// POST to create a reaction
router.post('/:thoughtId/reactions', async (req, res) => {
  try {
    const { userId, reactionBody } = req.body;

    // Find the user to get the username
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const thought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      {
        $push: {
          reactions: {
            reactionBody,
            userId,
            username: user.username, // Add username
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!thought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }

    res.json(thought);
  } catch (err) {
    res.status(400).json(err);
  }
});


router.delete('/:thoughtId/reactions/:reactionId', async (req, res) => {
  try {
    const thought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      {
        $pull: {
          reactions: {
            reactionId: new mongoose.Types.ObjectId(req.params.reactionId), // Convert to ObjectId
          },
        },
      },
      { new: true }
    );

    if (!thought) {
      return res.status(404).json({ message: 'No thought found with this id!' });
    }

    res.json(thought);
  } catch (err) {
    console.error('Error deleting reaction:', err);
    res.status(500).json(err);
  }
});

module.exports = router;