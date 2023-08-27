import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { jsonResponse } from "src/utils/repsonseJSON";
import { checkTimeExpression } from "src/utils/checkTimeExpression";
import jwt from "jsonwebtoken";
import * as dotenv from 'dotenv';
import dynamodb from 'src/services/Dynamodb';
import s3 from 'src/services/S3bucket';
dotenv.config();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
        const {token, name} = JSON.parse(event.body || '');

        if(!token) return jsonResponse(400, JSON.stringify({message: 'The token is empty'}));
        if(!name) return jsonResponse(400, JSON.stringify({message: 'The name is empty'}));

        const validToken = checkTimeExpression(token);

        if (!validToken) return jsonResponse(400, JSON.stringify({ message: 'The token is expired' }));

        const { user_id: userId } = jwt.verify(token, process.env.SECRET_KEY);
        const { Items } = await dynamodb.findUserUsingId(userId);

        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({ message: 'The user is not found' }));

        const imageExist = await s3.checkFileExists(name, userId);

        if (!imageExist) return jsonResponse(400, JSON.stringify({ message: 'The image is not found' }));

        const deleteImage = await s3.deleteImage(name, userId);

        if (!deleteImage) return jsonResponse(400, JSON.stringify({ message: 'The image is not deleted' }));

        return jsonResponse(200, JSON.stringify({message: 'Image deleted'}))
    }catch(err){
        console.log(err);
        return jsonResponse(500, JSON.stringify({message: 'An error occured'}))
    }
}