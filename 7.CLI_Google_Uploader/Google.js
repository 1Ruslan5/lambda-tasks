import inquirer from "inquirer";
import axios from "axios";
import path from "path";
import fs from "fs";
import { google } from 'googleapis';
import { ShortLink } from "./ShortLink.js";
import "dotenv/config";

const short = new ShortLink();

const token_path = path.join(process.cwd(), './token.json');
const credentials_path = path.join(process.cwd(), './credentials.json');

export function send_photo(fileId, access_token) {
        try {
            inquirer.prompt({
                name: "photo",
                message: "Drag and drop a image to consol and press Enter for upload:",
                type: "input"
            }).then(async answear => {
                const { photo: linkToPhoto } = answear;
                if (linkToPhoto !== '') {
                    const formatPhoto = linkToPhoto.split('.').pop();
                    let name = path.basename(linkToPhoto);
                    name = name.slice(-name.length, -formatPhoto.length - 1);
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
                } else {
                    console.log("Please, drag the image to console");
                    send_photo(fileId, access_token);
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    export function change_name(photoObject) {
        inquirer.prompt(
            {
                name: "question",
                message: "Do you want to change name of your photo?",
                type: "confirm",
            }
        ).then(answear => {
            if (answear.question) {
                return new_name(photoObject);
            }
            return sendImage(photoObject);
        })
    };

    export function new_name(photoObject) {
        inquirer.prompt(
            [{
                name: 'names',
                message: 'Enter name without dote and type of image:',
                type: 'input'
            }]
        ).then(answear => {
            if (answear.names.includes('.')) {
                console.log("Your new name contains dote or type of image");
                return new_name(photoObject);
            } else {
                photoObject.name = answear.names;
                return sendImage(photoObject);
            }
        })
    };

    export async function sendImage(photoObject) {
        try {
            const boundary = '----' + Date.now().toString(16);
            const metadata = {
                name: photoObject.name,
                parents: photoObject.parents,
                mimeType: photoObject.mimeType
            };
            const metadataPart = Buffer.from(JSON.stringify(metadata), 'utf8');
            const photoPart = Buffer.from(photoObject.body, 'binary');
            const body = Buffer.concat([
                Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`),
                metadataPart,
                Buffer.from(`\r\n--${boundary}\r\nContent-Type: ${photoObject.mimeType}\r\n\r\n`),
                photoPart,
                Buffer.from(`\r\n--${boundary}--`)
            ]);
            const { data: { id } } = await axios({
                method: 'POST',
                url: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
                headers: {
                    Authorization: `Bearer ${photoObject.access_token}`,
                    'Content-Type': 'multipart/related; boundary=' + boundary,
                    'Content-Length': body.length,
                },
                data: body,
                params: {
                    fields: 'id',
                },
            })
            console.log("The image was sent successfully!")
            return short.shortLink(id, photoObject.access_token);
        } catch (err) {
            console.log(err);
        }
    }



    export async function checkForFile(client) {
        const { credentials: { access_token } } = client;
        const nameFolder = 'NewFolder';
        const { data: { files } } = await axios.get("https://www.googleapis.com/drive/v3/files",
            {
                headers: { Authorization: `Bearer ${access_token}` },
                params: { q: `name='${nameFolder}' and mimeType='application/vnd.google-apps.folder'` }
            }
        )
        const fileId = await createFile(access_token, files);
        return fileId;
    };

    export async function createFile(access_token, answear) {
        try {
            const fileMetadata = {
                name: 'NewFolder',
                mimeType: 'application/vnd.google-apps.folder'
            };
            if (!answear.length) {
                const { data } = await axios.post('https://www.googleapis.com/drive/v3/files', fileMetadata,
                    {
                        headers: {
                            Authorization: `Bearer ${access_token}`,
                            'Content-Type': 'application/json'
                        },
                        params: { fields: 'id' },
                    });
                return data;
            }
            return [answear].id;
        } catch (err) {
            console.log(err)
        }
    };

    export async function saveCredentials(client) {
        const content = await fs.promises.readFile(credentials_path);
        const { client_id, client_secret } = JSON.parse(content).installed;
        const { credentials: { access_token } } = client;
        const { credentials: { refresh_token } } = client;
        const payload = {
            type: 'authorized_user',
            client_id,
            client_secret,
            access_token,
            refresh_token,
        };
        await fs.promises.writeFile(token_path, JSON.stringify(payload));
    };

    export async function checkTokenValidity(access_token) {
        try {
            await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`);
            return false;
        } catch (err) {
            return true;
        }
    };

    export async function loadSavedCredentialsIfExist() {
        try {
            const content = await fs.promises.readFile(token_path);
            let { client_id, client_secret, access_token, refresh_token } = JSON.parse(content);
            const client = new google.auth.OAuth2(client_id, client_secret);
            client.setCredentials({ access_token, refresh_token })
            if (await checkTokenValidity(access_token)) {
                const { token: { res: { data } } } = await client.refreshAccessToken();
                access_token = data.access_token;
                refresh_token = data.refresh_token;
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
        } catch (err) {
            return null;
        }
    }