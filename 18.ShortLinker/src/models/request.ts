import express from "express";
import { getLink, shortit } from "../controllers/functions";
import { linkNotFound, linkNotInput } from "../views/exeption";
import * as dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT!;

const router: express.Application = express();

router.use(express.json());

router.post('/shortit', (req, res) => shortit(req, res, linkNotInput, port));

router.get('/*', (req, res) => getLink(req, res, linkNotFound));

export { router }