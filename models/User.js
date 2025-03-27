const { Schema, model } = require('mongoose');

// Define the User schema
const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // Match a valid email address using Mongoose's match validation
      match: [/.+@.+\..+/, 'Must match a valid email address'],
    },
    thoughts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Thought',
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true, // Enable virtuals to be included in JSON responses
    },
    id: false, // Disable default virtual id
  }
);

// Create a virtual property `friendCount` to retrieve the number of friends
userSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

// Create the User model
const User = model('User', userSchema);

module.exports = User;
