import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { jsonResponse } from 'src/utils/responseJSON';
import { generateJWT } from 'src/utils/generateJWT';
import * as dotenv from 'dotenv';

dotenv.config();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { user_name, password, search_phrases } = event.queryStringParameters || {};

        if(!user_name) return jsonResponse(400, JSON.stringify({message: 'The user_name is empty'}))
        if(!password) return jsonResponse(400, JSON.stringify({message: 'The password is empty'}))
        if(!search_phrases) return jsonResponse(400, JSON.stringify({message: 'The search_phrases is empty'}))

        const jwtoken = generateJWT({ user_name, password, search_phrases }, '10m');

        return jsonResponse(200, JSON.stringify({token: jwtoken}));
    }catch (error){
        console.log(error);
        return jsonResponse(500, JSON.stringify({message: 'An error occured'}));
    }
 }