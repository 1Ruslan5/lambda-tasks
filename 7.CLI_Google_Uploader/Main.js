import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { loadSavedCredentialsIfExist, saveCredentials, checkForFile, send_photo } from "./Google.js";
import 'dotenv/config'

const {API_SHORT_LINK, API_SHORT_LINK_TOKEN} = process.env;
console.log(API_SHORT_LINK)
console.log(API_SHORT_LINK_TOKEN)
const scopes = ['https://www.googleapis.com/auth/drive']
const credentials_path = path.join(process.cwd(), './credentials.json');

main()

async function main() {
  let client = await loadSavedCredentialsIfExist();
  if (!client) {
    client = await authenticate({
      scopes: scopes,
      keyfilePath: credentials_path,
    });
    await saveCredentials(client);
  }
  const fileId = await checkForFile(client);
  send_photo(fileId, client.credentials.access_token)
};