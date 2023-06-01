const express = require('express');
const jwt = require('jsonwebtoken');
const randtoken = require('rand-token');
const db = require('./mongodb.js')

const app = express();
const port = 4000;
const secretKey = 'hb54n-5429j-24hbks';

app.use(express.json());

app.post('/sign_up', async (req, res)=>{
    const body = req.body;
    if(!body.hasOwnProperty('email')){
      return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find email"});
    }else if(body.email === ""){
      return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find email"});
    }
    if(!body.hasOwnProperty('password')){
      return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find password"});
    }else if(body.password === ""){
      return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find password"});
    }

    const email = body.email;
    const password = body.password;
    if(!validateEmail(email)){
      return res.json({status: 400, exeption:"Bad Request", explain: "Email isn't valid"});
    }

    const allUsers = await db.getAllUsers();
    const user = {
      "email": email,
      "password": password,
    }
    for(let i of allUsers){
      if(email === i.email){
        return res.json({status: 201, exeption:'Created', explain: "Email is allready exist!"});
      }
    }
    await db.insertUser(user).then(res.status(200).json({status: 200, descriptions: 'User was registered succesfully!'}));
});

app.post('/login', async (req, res)=>{
  const {email, password} = req.query;
  if(email === ""){
    return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find email"});
  }
  if(password === ""){
    return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find password"});
  }
  if(!validateEmail(email)){
    return res.status(400).json({status: 400, exeption: 'Bad Request', exeption: "Email isn't valid"});
  }
  const allUsers = await db.getAllUsers();
  for(let user of allUsers){
    if(email === user.email){
      if(user.password === password){
        const user = {username: email};
        const tokens = await db.getDataFromToken({login:{email:email, password: password}});
        if(tokens.length > 0){
          return res.json({status: 200, exeption: 'Ok', explain: "Token is allready exist", data:{type: 'JWT', token: tokens[0].token, refreshToken: tokens[0].refreshToken||undefined}});
        }
        const time = getRandomExpirationTime();
        const token = jwt.sign(user, secretKey, {expiresIn: time});
        const refreshToken = randtoken.uid(256);
        db.insertTokens({createdAt: new Date(Date.now()+time*1000), login:{email: email, password: password}, request: 0, token: token, refreshToken: refreshToken});
        return res.json({status: 201, exeption: 'Created', explain: 'Token was created', type: 'JWT', token: token, refreshToken: refreshToken})
      }else{
        return res.json({ status: 400, exeption: 'Not found', explain: "Password isn't valid"});
      }
    }
  }
  return res.json({status: 404, exeption: 'Not found', explain: "Email wasn't found"});
});

app.post('/refresh', async (req, res)=>{
  const refreshToken = req.headers.authorization;
  if(refreshToken === undefined){
    return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find header authorization"});
  }
  const token = await db.getDataFromToken({refreshToken: refreshToken});
  if(token.length === 0){
    return res.json({ status: 401, exeption: 'Unauthorised', explain: "Refreshtoken isn't valid"});
  }
  const user = {username: token[0].login.email};
  const time = getRandomExpirationTime();
  const newToken = jwt.sign(user, secretKey, {expiresIn: time});
  db.updateToken(
    {refreshToken:refreshToken}, 
    {
      $set: {
        createdAt: new Date(Date.now()+time*1000),
        token: newToken
      },
      $unset: {refreshToken:1}
    }
  )
  return res.json({status: 201, exeption: 'Created', explain: 'Token was updated', type: 'JWT', token: newToken});
});

app.get('/me[0-9]', async(req, res)=>{
  const token = req.headers.authorization;
  if(token === undefined){
    return res.status(400).json({status: 400, exeption: 'Bad Request', explain: "Didn't find header authorization"});
  }
  const data = await db.getDataFromToken({token: token});
  if(data.length === 0){
    return res.json({ status: 401, exeption: 'Unauthorised', explain: "Token isn't valid"});
  }
  db.updateToken(
    {token:token}, 
    {
      $inc:{request:1}
    }
  )
  return res.json({
    request_num:data[0].request + 1, 
    data:{
      email:data[0].login.email, 
      password:data[0].login.password
    }
  });
})

db.connect();
app.listen(port, ()=>{
  console.log(`Server started on port ${port}`)
})

function validateEmail(email){
  return String(email)
  .toLowerCase()
  .match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

function getRandomExpirationTime() {
  const minSeconds = 30;
  const maxSeconds = 60;
  const randomSeconds = Math.floor(Math.random() * (maxSeconds - minSeconds + 1)) + minSeconds;
  return randomSeconds;
}
