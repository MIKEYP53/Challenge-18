const { Schema, model, Types } = require('mongoose');

// Define the reaction schema
const reactionSchema = new Schema({
  reactionId: {
    type: Schema.Types.ObjectId,
    default: () => new Types.ObjectId(), // Automatically generates a new ObjectId
  },
  reactionBody: {
    type: String,
    required: true,
    maxlength: 280, // Max length of 280 characters
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  username: {
    type: String,
    required: true, // Make sure it's required
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default timestamp
    get: (timestamp) => new Date(timestamp).toLocaleString(), // Getter to format the timestamp
  },
},
{
  toJSON: {
    getters: true, // Enable getters
  },
  id: false, // Disables the virtual 'id' field
});

// Define the thought schema
const thoughtSchema = new Schema({
  thoughtText: {
    type: String,
    required: true,
    maxlength: 280,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String, // Add username as String
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reactions: [reactionSchema],
},
{
  toJSON: {
    getters: true,
    virtuals: true, // Enable virtual fields
  },
  id: false, // Disables the virtual 'id' field
});

// Create a virtual called `reactionCount` to count the number of reactions
thoughtSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

// Create the Thought model using the thoughtSchema
const Thought = model('Thought', thoughtSchema);

module.exports = Thought;
