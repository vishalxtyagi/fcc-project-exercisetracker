const express = require('express')
const mongoose = require("mongoose");
const _ = require("lodash");  
const app = express()
const cors = require('cors')
const { User } = require('./model.js');
const ObjectID = mongoose.Types.ObjectId;
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
    res.json(_.map(users, e => _.pick(e, ['_id', 'username', '__v'])));
  } catch(err) {
    res.json({error: err.message});
  }
});


app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create({
      username: req.body.username
    });
    res.json(_.pick(user.toJSON(), ["_id", "username"]));
  } catch(err) {
    res.json({error: err.message});
  }
});


app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    var objectId = ObjectID(req.params._id);
    var description = req.body.description;
    var duration = parseInt(req.body.duration, 10);
    var date = (req.body.date) ? new Date(req.body.date) : new Date();

    const user = await User.findByIdAndUpdate(objectId, {
      $push: {
        log: {
          description: description,
          duration: duration,
          date: date
        }
      }
    });

    res.json({
      _id: user._id,
      username: user.username,
      date: date.toDateString(),
      duration: duration,
      description: description
    })
  } catch (err) {
    res.json({error: err.message});
  }
});


app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    var objectId = ObjectID(req.params._id);
    var from = (req.query.from) ? new Date(req.query.from) : null;
    var to = (req.query.to) ? new Date(req.query.to) : null;
    var limit = parseInt(req.query.limit, 10);
    
    const user = await User.findById(objectId);
    const logAggregate = await User.aggregate([
      {
        $unwind: {
          path: "$log"
        }
      },
      {
        $match: {
          "log.date": {
              $lt: (to) ? new Date(to) : new Date(),
              $gt: new Date(from)
          }
        }
      },
      {
        $limit: limit || 100
      },
      {
        $project: {
          _id: 0,
          description: "$log.description",
          duration: {
            $toInt: "$log.duration"
          },
          date: "$log.date",
        },
      }
    ]);

    res.json({
      username: user.username,
      count: logAggregate.length,
      _id: user._id,
      log: _.map(logAggregate, function(e) {
        return _.assign(e, {
          date: e.date.toDateString()
        });
      })
    });
  } catch (err) {
    res.json({error: err.message});
  }
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
