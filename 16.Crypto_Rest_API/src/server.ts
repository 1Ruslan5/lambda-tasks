import 'express';
import { router } from './models/requests';
import { dataFromDB } from './controllers/autoinsert';
import { schedule } from "node-cron";
import * as dotenv from 'dotenv';
import { connect } from "ngrok";
import express from "express";

dotenv.config();

const app: express.Application = express();
const { PORT, NGROK_TOKEN, HOSTNAME } = process.env;
const port = PORT || 3000;
const hostname = HOSTNAME || 'localhost';

const server = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on http://${hostname}:${port}`);
    });
    const url = await connect({
      addr: port,
      authtoken: NGROK_TOKEN,
    });
  } catch (err) {
    console.log(err);
  }
}
app.use(router)

server()
schedule('*/5 * * * *', async () => {
  dataFromDB()
});