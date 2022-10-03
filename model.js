const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String,
    required: true
  },
  log : [{
    description: {
      type: String,
      required: true
    },
    duration: { 
      type: String,
      required: true
    },
    date: { 
      type: Date,
      default: Date.now
    }
  }]
});

const User = mongoose.model("User", userSchema);

module.exports = { User };