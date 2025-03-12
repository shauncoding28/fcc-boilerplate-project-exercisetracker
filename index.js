const express = require('express')
const app = express()
const cors = require('cors')
const { ObjectId } = require('bson'); //used to create unique passwords for each user
require('dotenv').config()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//initializes array to store different users
const usersArray = [];


// adds user to database and creates id automatically
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (username) {
    const user = username;
    const userId = new ObjectId().toString();
    const userObject = { username: user, _id: userId, exercises: [], log: [] };
    usersArray.push(userObject);
    res.json(userObject);
  } else {
    res.status(400).send('error: username is required');
  }
});



//adds an exercise to the users exercise array, date is added automatically if none is given
app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  //description and duration are required
  if (!description || !duration) {
    return res.status(400).send('Details required');
  }

  //creates new date object with either given or current date
  const exerciseDate = date ? new Date(date) : new Date();

  //saves the user to a variable user
  const user = usersArray.find(user => user._id === userId);
  if (!user) {
    return res.status(404).send('No user found');
  }

  //creates object to be pushed to exercise array, date converted to a string and the duration to an INT
  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: user._id
  };

  //pushes exercise to log array
  try {
    user.log.push(exercise);
  } catch (error) {
    console.log(error);
    res.status(400).send('Could not add exercise');
  }

  //pushes exercise to exercise array
  try {
    user.exercises.push(exercise);
  } catch (error) {
    console.log(error);
    res.status(400).send('Could not add exercise');
  }

  res.json(exercise);

});



// returns users array
app.get('/api/users', (req, res) => {
  res.json(usersArray);
});



//returns exercise logs based on id with optional to/from/limit
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;

  //finds user by their id
  const user = usersArray.find(user => user._id === userId);
  if (!user) {
    return res.status(404).send('No user found');
  }

  //converts query string dates to date objects
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;


  let filteredLogs = user.log; // initializes filtered logs


  //returns logs between to and from date but not including
  filteredLogs = filteredLogs.filter(log => {
    const logDate = new Date(log.date);

    //above the from date && below the to date
    return (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);
  });

  //limits amount of logs returned
  if (limit) {
    const totalLogs = parseInt(limit);
    filteredLogs = filteredLogs.slice(0, totalLogs);
  }

  const responseObj = {
    username: user.username,
    count: filteredLogs.length,
    _id: user._id,
    log: filteredLogs
  };

  res.json(responseObj);
});


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
