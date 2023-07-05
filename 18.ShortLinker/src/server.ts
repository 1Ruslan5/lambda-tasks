import express from "express";
import { router } from './models/request';
import { Repository } from "./controllers/Repository";
import "dotenv/config"

const app: express.Application = express();
const PORT: string = process.env.PORT!;
const repository = new Repository();

app.use(router);

repository.connect();
app.listen(PORT, () => {
    console.log("Typescript express started");
})