import { Request, Response } from "express";
import { isJSDocLinkLike } from "typescript";
import { Repository } from "./Repository";

const repository = new Repository();

const generateRandomCode = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};

function shortit(req: Request, res: Response, linkNotInput: object, port: any) {
    const { body: { link } } = req;
    if (!link) {
        return res.status(404).json(linkNotInput)
    }
    const shortLink = generateRandomCode(8);
    const linkUser = `${req.protocol}://${req.hostname}:${port}/${shortLink}`;
    let linkObject = { link, shortLink, createdAt: new Date(Date.now() + 3600 * 1000) }
    repository.setLink(linkObject);
    return res.status(200).json({ shortLink: linkUser });
}

async function getLink(req: Request, res: Response, linkNotFound: object) {
    const { params: { '0': shortLink } } = req;
    const link = await repository.getLongLink(shortLink);
    if (!link) {
        return res.status(404).json(linkNotFound);
    }
    return res.redirect(link.link);
}

export { shortit, getLink } 