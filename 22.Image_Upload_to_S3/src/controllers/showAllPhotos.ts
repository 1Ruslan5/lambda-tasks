import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { jsonResponse } from "src/utils/repsonseJSON";
import { checkTimeExpression } from "src/utils/checkTimeExpression";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import dynamodb from 'src/services/Dynamodb';
import s3 from 'src/services/S3bucket';
dotenv.config();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const token = event.queryStringParameters?.token;

        if (!token) return jsonResponse(400, JSON.stringify({ message: 'The token is empty' }));

        const validToken = checkTimeExpression(token);

        if (!validToken) return jsonResponse(400, JSON.stringify({ message: 'The token is expired' }));

        const { user_id: userId } = jwt.verify(token, process.env.SECRET_KEY);
        const { Items } = await dynamodb.findUserUsingId(userId);

        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({ message: 'The user is not found' }));

        const listOfImage = await s3.listImages(userId);

        if (!listOfImage) return jsonResponse(400, JSON.stringify({ message: 'The bucket is empty' }));

        return jsonResponse(200, JSON.stringify({ Links: listOfImage }));
    } catch (err) {
        console.log(err);
        return jsonResponse(500, JSON.stringify({ message: 'An error occured' }));

    }
}