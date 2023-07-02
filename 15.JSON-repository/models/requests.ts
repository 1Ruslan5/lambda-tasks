import express, { Request, Response } from 'express';
import { Repository } from '../controllers/repository';
import { jsonAwnswear } from '../views/answer';

const router: express.Router = express.Router();
const repository: Repository = new Repository();


router.use(express.json());

router.post('/*', async (req: Request, res: Response) => {
    const { body, params: { '0': key } } = req;
    if (!key) {
        return res.status(404).json(jsonAwnswear(404, "Route didn't found"));
    }
    if (!body || !Object.keys(body).length || (Array.isArray(body) && !body.length)) {
        return res.status(404).json(jsonAwnswear(404, "Body didn't found"));
    }
    const result = await repository.getJSON({ key });
    if (result) {
        return res.status(400).json(jsonAwnswear(400, "Route is already exist"))
    }
    const dbBody: Object = { key, body };
    repository.insertJSON(dbBody);
    return res.status(201).json(jsonAwnswear(201, "Data was saved"))
});

router.get('/*', async (req: Request, res: Response) => {
    const { params: { '0': key } } = req;
    if (!key) {
        return res.status(404).json(jsonAwnswear(400, "Route didn't found"));
    }
    const { body } = await repository.getJSON({ key });
    return res.status(200).json(body)
});

export { router }