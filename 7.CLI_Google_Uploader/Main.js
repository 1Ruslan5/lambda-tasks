import  inquirer  from "inquirer";
import axios from "axios";
import path from "path";
import fs, { access, readFileSync } from "fs";
import { google } from 'googleapis';
import {authenticate} from "@google-cloud/local-auth";

const scopes = ['https://www.googleapis.com/auth/drive']

const token_path = path.join(process.cwd(), '/7.CLI_Google_Uploader/token.json');
const credentials_path = path.join(process.cwd(), '/7.CLI_Google_Uploader/credentials.json');

main()

function send_photo(fileId, access_token){
    inquirer.prompt({
      name: "photo",
      message: "Drag and drop a image to consol and press Enter for upload:",
      type: "input"
    }).then(async answear =>{
      const linkToPhoto = answear.photo;
      if(linkToPhoto !== ''){
        const formatPhoto = linkToPhoto.split('.').pop();
        let name = path.basename(linkToPhoto);
        name = name.slice(-name.length, -formatPhoto.length-1);
        let photoObject = {
          name: name,
          parents: [fileId],
          mimeType: `image/${formatPhoto}`,
          body: fs.readFileSync(linkToPhoto),
          size: fs.statSync(linkToPhoto).size,
          access_token: access_token,
        }
        console.log(`Name of file: ${name}`);
        console.log(`File path: ${linkToPhoto}`);
        change_name(photoObject);
      }else{
        console.log("Please, drag the image to console");
        send_photo(fileId, access_token);
      }
    })
}

function change_name(photoObject){
    inquirer.prompt(
    {
        name: "question",
        message: "Do you want to change name of your photo?",
        type: "confirm",
    }
    ).then(answear =>{
    if(answear.question){
      return  new_name(photoObject);
    }
      return sendImage(photoObject);
 })
};

function new_name(photoObject){
  inquirer.prompt(
    [{
      name: 'names',
      message: 'Enter name without dote and type of image:',
      type: 'input'
    }]
  ).then( answear => {
    if(answear.names.includes('.')){
      console.log("Your new name contains dote or type of image");
      return new_name(photoObject);
    }else{
      photoObject.name = answear.names;
      return sendImage(photoObject);
    }
  })
};

async function sendImage(photoObject){
  const boundary = '----' + Date.now().toString(16);
  const metadata = {
    name: photoObject.name,
    parents: photoObject.parents,
    mimeType: photoObject.mimeType
  };
  const metadataPart = Buffer.from(JSON.stringify(metadata), 'utf8');
  const photoPart = Buffer.from(photoObject.body, 'binary');
  const body = Buffer.concat([
  Buffer.from('--' + boundary + '\r\n' +
              'Content-Type: application/json; charset=UTF-8\r\n\r\n'),
  metadataPart,
  Buffer.from('\r\n--' + boundary + '\r\n' +
              'Content-Type: ' + photoObject.mimeType + '\r\n\r\n'),
  photoPart,
  Buffer.from('\r\n--' + boundary + '--')
  ]);
  const imagePost = await axios({
  method: 'POST',
  url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
  headers: {
    Authorization: `Bearer ${photoObject.access_token}`,
    'Content-Type': 'multipart/related; boundary=' + boundary,
    'Content-Length': body.length,
  },
  data: body,
  params:{
    fields: 'id',
  },
  }).then(console.log("The image was sent successfully!"));
  return shortLink(imagePost.data.id, photoObject.access_token);
}

function shortLink(fileId, access_token){
  inquirer.prompt({
    name: "question_link",
    message: "Do you want to get the short link?",
    type: "confirm",
  }).then(async answear =>{
    const responseLong = await axios({
      method: 'GET',
      url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      params: {
        fields: 'webViewLink',
        alt: 'json',
      },
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
    if(answear.question_link){
      const apiShortLinkURLToken = "ilDEOcThvl37prCRA6UWKtVL7eoIx9NvKMnvMq6Dxx1tAyddrzUGr6F8v8g8";
      await axios.post(
        "https://api.tinyurl.com/create",
        {
          url: responseLong.data.webViewLink,
        },
        {
          headers: {
            Authorization: `Bearer ${apiShortLinkURLToken}`,
          }
        }
      ).then(response => {
        console.log("Short link to the photo: "+ response.data.data.tiny_url);
      });
    }else{
      console.log("Full link to the photo: "+ responseLong.data.webViewLink);
    }
  })
}

async function main(){
  let client = await loadSavedCredentialsIfExist();
  if(!client){
    client = await authenticate({
      scopes: scopes,
      keyfilePath: credentials_path,
    });
    await saveCredentials(client);
  }
  const fileId = await checkForFile(client);
  send_photo(fileId, client.credentials.access_token)
};

async function createFile(access_token, answear){ 
  const fileMetadata = {
    name: 'NewFolder',
    mimeType: 'application/vnd.google-apps.folder'
  };
  if(answear.length === 0){
    const response = await axios.post(
    'https://www.googleapis.com/drive/v3/files',
    fileMetadata, {
    headers: {
      Authorization: `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    params:{
      fields: 'id',
    },
  });
    return response.data;
  }
  return answear[0].id;
};

async function checkForFile(client){
  const access_token = client.credentials.access_token;
  const nameFolder = 'NewFolder';
  const response = await axios.get(
    "https://www.googleapis.com/drive/v3/files", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      params: {
        q: `name='${nameFolder}' and mimeType='application/vnd.google-apps.folder'`,
      }
    }
  )
  const fileId = await createFile(access_token, response.data.files);
  return fileId;
};

async function saveCredentials(client) {
const content = await fs.promises.readFile(credentials_path);
const {client_id, client_secret} = JSON.parse(content).installed;
const payload = {
  type: 'authorized_user',
  client_id,
  client_secret,
  access_token: client.credentials.access_token,
  refresh_token: client.credentials.refresh_token,
};
await fs.promises.writeFile(token_path, JSON.stringify(payload));
};

async function checkTokenValidity(access_token) {
try {
  await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`);
  return false;
} catch (err) {
  return true;
}};

async function loadSavedCredentialsIfExist(){
  try{
      const content = await fs.promises.readFile(token_path);
      let {client_id,client_secret, access_token, refresh_token} = JSON.parse(content);
      const client = new google.auth.OAuth2(client_id, client_secret);
      client.setCredentials({ access_token, refresh_token })
      if(await checkTokenValidity(access_token)){
        const token = await client.refreshAccessToken();
        access_token = token.res.data.access_token;
        refresh_token = token.res.data.refresh_token;
        client.setCredentials({ access_token, refresh_token })
        const payload = {
          type: 'authorized_user',
          client_id,
          client_secret,
          access_token,
          refresh_token,
        };
        await fs.promises.writeFile(token_path, JSON.stringify(payload));
      }
      return client
  }catch(err){
      return null;
  }
};