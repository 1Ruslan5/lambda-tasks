const express = require('express');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const { Repository } = require('./repository');
require("dotenv").config()

const { URI, PORT, SECRET_KEY } = process.env;
const repository = new Repository(URI);
const app = express();

app.use(express.json());

const jsonAwnswear = (status, info) => {
  const exeption = new Map([
    [400, 'Bad Request'],
    [201, 'Created'],
    [200, 'Ok'],
    [404, 'Not found'],
  ]);
  return { status, exeption: exeption.get(status), info }
}

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
}

const getRandomExpirationTime = () => {
  const minSeconds = 30;
  const maxSeconds = 60;
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  return randomSeconds;
}

app.post('/sign_up', async (req, res) => {
  const { body } = req;
  if (!body.hasOwnProperty('email')) {
    return res.json(jsonAwnswear(400, "Didn't find email"));
  } else if (!body.email) {
    return res.json(jsonAwnswear(400, "Didn't find email"));
  }
  if (!body.hasOwnProperty('password')) {
    return res.json(jsonAwnswear(400, "Didn't find password"));
  } else if (!body.password) {
    return res.json(jsonAwnswear(400, "Didn't find password"));
  }
  const { email } = body;
  const { password } = body;
  if (!validateEmail(email)) {
    return res.json(jsonAwnswear(400, "Email isn't valid"));
  }
  const allUsers = await repository.getAllUsers();
  const user = { email, password }
  const findEmail = allUsers.find(user => email === user.email)
  if (findEmail) {
    return res.json(jsonAwnswear(200, "Email is allready exist"));
  }
  await repository.insertUser(user)
  res.json(jsonAwnswear(201, 'User was registered succesfully'));
});

app.post('/login', async (req, res) => {
  const { query: { email, password } } = req;
  if (!email) {
    return res.json(jsonAwnswear(404, "Didn't find email"));
  }
  if (!password) {
    return res.json(jsonAwnswear(404, "Didn't find password"));
  }
  if (!validateEmail(email)) {
    return res.json(jsonAwnswear(400, "Email isn't valid"));
  }
  const allUsers = await repository.getAllUsers();
  const foundUser = allUsers.find(user => email === user.email && password === user.password);
  if (foundUser) {
    const userObj = { username: email };
    const tokens = await repository.getDataFromToken({ login: { email, password } });
    if (tokens.length) {
      return res.json({ info: jsonAwnswear(200, "Token already exists"), data: { type: 'JWT', token: tokens[0].token, refreshToken: tokens[0].refreshToken } });
    }
    const time = getRandomExpirationTime();
    const token = jwt.sign(userObj, SECRET_KEY, { expiresIn: time });
    const refreshToken = randtoken.uid(256);
    repository.insertTokens({ createdAt: new Date(Date.now() + time * 1000), login: { email, password }, request: 0, token, refreshToken });
    return res.json({ info: jsonAwnswear(201, 'Token was created'), data: { type: 'JWT', token, refreshToken } });
  }
  return res.json(jsonAwnswear(400, "Email or password isn't valid"));
});

app.post('/refresh', async (req, res) => {
  const { headers: { authorization: refreshToken } } = req;
  if (!refreshToken) {
    return res.json(jsonAwnswear(400, "Didn't find header authorization"));
  }
  const [token] = await repository.getDataFromToken({ refreshToken: refreshToken });
  if (!token) {
    return res.json(jsonAwnswear(401, "Refreshtoken isn't valid"));
  }
  const user = { username: token.login.email };
  const time = getRandomExpirationTime();
  const newToken = jwt.sign(user, SECRET_KEY, { expiresIn: time });
  repository.updateToken(
    { refreshToken: refreshToken },
    {
      $set: {
        createdAt: new Date(Date.now() + time * 1000),
        token: newToken
      },
      $unset: { refreshToken: 1 }
    }
  )
  return res.json({ info: jsonAwnswear(201, 'Token was updated'), data: { type: 'JWT', token: newToken } });
});

app.get('/me[0-9]', async (req, res) => {
  const { heades: { authorization: token } } = req;
  if (!token) {
    return res.json(jsonAwnswear(400, "Didn't find header authorization"));
  }
  const [data] = await repository.getDataFromToken({ token: token });
  if (!data) {
    return res.json(jsonAwnswear(401, "Token isn't valid"));
  }
  repository.updateToken(
    { token: token },
    {
      $inc: { request: 1 }
    }
  )
  return res.json({
    request_num: data.request + 1,
    data: {
      email: data.login.email,
      password: data.login.password
    }
  });
})

repository.connect();
app.listen(PORT, () => {
  try {
    console.log(`Server started on port ${PORT}`)
  } catch (err) {
    console.log(err);
  }
})