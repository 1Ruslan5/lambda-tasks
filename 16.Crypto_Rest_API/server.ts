import express from "express";
import { router } from './models/requests';
import { Repository } from "./controllers/Repository";
import { dataFromDB } from "./controllers/api";
import { schedule } from "node-cron";
import * as dotenv from 'dotenv';
import { connect } from "ngrok";

dotenv.config({ path: '.env' });

const app: express.Application = express();
const { PORT, NGROK_TOKEN, HOST_NAME } = process.env;
const repository = new Repository();

const server = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server started on port: ${PORT}, name of the host: ${HOST_NAME}`);
    });
    const url = await connect({
      addr: PORT,
      authtoken: NGROK_TOKEN,
    });
    repository.connect();
    schedule('*/5 * * * *', async () => {
      dataFromDB()
    });
  } catch (err) {
    console.log(err);
  }
}
app.use(router)

server()