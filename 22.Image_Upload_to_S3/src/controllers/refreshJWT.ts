import { jsonResponse } from 'src/utils/repsonseJSON';
import { APIGatewayProxyResult, APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda';
import dynamodb from '@services/Dynamodb';
import * as dotenv from 'dotenv';
import { generateJWT } from 'src/utils/generateJWT';
dotenv.config();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { refreshToken } = JSON.parse(event.body || '');

        if (!refreshToken) return jsonResponse(400, JSON.stringify({message: 'The refresh token is empty'}));

        const { Items } = await dynamodb.findUserUsingRefreshToken(refreshToken);

        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({message: 'The user is not login'}));

        const [{ user_id }] = Items;
        const jwtoken = generateJWT({ user_id }, { expiresIn: '1h' })

        return jsonResponse(200, JSON.stringify({ token: jwtoken }))
    } catch (err) {
        console.log(err)
        return jsonResponse(500, JSON.stringify({message: 'An error occurred'}))
    }
}