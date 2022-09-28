const express = require('express')
const mongoose = require("mongoose");
const _ = require("lodash");  
const app = express()
const cors = require('cors')
const { User } = require('./model.js');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch(err) {
    res.json({error: err.message});
  }
});


app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username
    });
    res.json(_.omit(user.toJSON(), ["__v"]));
  } catch(err) {
    res.json({error: err.message});
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
