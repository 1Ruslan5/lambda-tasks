import express from "express";
import { router } from './models/requests';
import { Repository } from "./controllers/repository";
import "dotenv/config"

const app: express.Application = express();
const PORT: string | undefined = process.env.PORT;
const repository = new Repository();

app.use(router)

repository.connect();
app.listen(PORT, () => {
    console.log("Typescript express started");
})

