import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse } from 'src/utils/responseJSON';
import { checkTimeExpression } from 'src/utils/checkTimeExpression';
import jwt from "jsonwebtoken";
import { MyJwtPayload } from 'src/models/jwtPayload';
import { readFileSync } from "fs";
import sqs from 'src/services/SQS';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {

        const { token } = JSON.parse(event.body || '');

        if (!token) return jsonResponse(400, JSON.stringify({ message: 'The token is empty' }));

        const validToken = checkTimeExpression(token);
        if (!validToken) return jsonResponse(400, JSON.stringify({ message: 'The token is expired' }));

        const { user_name, password, search_phrases } = jwt.verify(token, process.env.SECRET_KEY) as MyJwtPayload;

        let shop_id = null;

        const shops = JSON.parse(readFileSync("src/files/shops.json", 'utf8'));

        const phrases = {};

        shops.forEach(shop => {
            phrases[shop.id] = shop.frases;
        });

        for (const shop of shops) {
            if (shop.frases.some(phrase => search_phrases.includes(phrase))) {
                shop_id = shop.id;
                break;
            }
        }

        if (!shop_id) return jsonResponse(404, JSON.stringify({ message: 'No matching shop found' }))

        await sqs.sendMessageToSQS({ user_name, password, search_phrases, shop_id })

        return jsonResponse(200, JSON.stringify({ message: 'The token is valid' }));
    } catch (error) {
        console.log(error);
        return jsonResponse(500, JSON.stringify({ message: 'An error occured' }));
    }
}