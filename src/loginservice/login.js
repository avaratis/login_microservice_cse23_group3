// start of login function

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Users database
const users = [
  {
    username: 'user1',
    password: 'password1',
    email: 'user1@example.com'
  },
  {
    username: 'user2',
    password: 'password2',
    email: 'user2@example.com'
  }
];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check if user exists in the database
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    res.status(200).send(`Welcome, ${user.username}!`);
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.listen(port, () => console.log(`Login microservice listening at http://localhost:${port}`));