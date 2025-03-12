const express = require('express')
const app = express()
const cors = require('cors')
const { ObjectId } = require('bson');
require('dotenv').config()


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const usersArray = [];

app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (username) {
    const user = username;
    const userId = new ObjectId().toString();
    const userObject = { username: user, _id: userId, exercises: [] };
    usersArray.push(userObject);
    res.json(userObject);
  } else {
    res.status(400).send('error: username is required');
  }
});


app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res.status(400).send('Details required');
  }

  const exerciseDate = date ? new Date(date) : new Date();

  const user = usersArray.find(user => user._id === userId);
  if (!user) {
    return res.status(404).send('No user found');
  }

  const exercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: user._id
  };

  try {
    user.exercises.push(exercise);
  } catch (error) {
    console.log(error);
    res.status(400).send('Could not add exercise');
  }

  res.json(exercise);

})


app.get('/api/users', (req, res) => {
  res.json(usersArray);
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
