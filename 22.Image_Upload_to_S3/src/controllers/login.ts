import dynamodb from "@services/Dynamodb";
import { jsonResponse } from "src/utils/repsonseJSON";
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { checkerPassword } from "src/utils/checkerPassword";
import { checkerEmail } from "src/utils/checkerEmail";
import { generateRefreshToken } from "src/utils/generateRefreshToken";
import { generateJWT } from "src/utils/generateJWT";
import * as dotenv from 'dotenv';
dotenv.config();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, password } = JSON.parse(event.body || '');

        if (!email) return jsonResponse(400, JSON.stringify({ message: 'The email is empty' }));
        if (!password) return jsonResponse(400, JSON.stringify({ message: 'The password is empty' }));
        if (!checkerEmail(email)) return jsonResponse(400, JSON.stringify({ message: 'The name is not valid. It must contain at least one capital letter, one lowercase letter and be a minimum size of 3 cheracters' }));
        if (!checkerPassword(password)) return jsonResponse(400, JSON.stringify({ message: 'The password is not valid. It must contain at least one capital letter, one lowercase letter, one number, and be a minimum of 8 characters' }))

        const { Items } = await dynamodb.findUserUsingEmail(email);
        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({ message: 'The email is not sign up' }))

        const verification = await dynamodb.checkVerification(email);
        if (!verification) return jsonResponse(400, JSON.stringify({ message: 'The email has not been verified' }))

        const [{ email: emailFromDB, password: passwordFromDB, user_id }] = Items;

        if (email !== emailFromDB || password !== passwordFromDB) return jsonResponse(400, JSON.stringify({ message: 'The email or password is not correct' }))

        const jwtoken = generateJWT({ user_id }, { expiresIn: '1h' });
        const refreshToken = generateRefreshToken();

        const updateRefreshToken = await dynamodb.updateRefreshToken(user_id, refreshToken);

        if (!updateRefreshToken) return jsonResponse(500, JSON.stringify({ message: 'An error occured' }))

        return jsonResponse(200, JSON.stringify({ message: 'Successfully login', token: jwtoken, refreshToken: refreshToken }))
    } catch (err) {
        console.log(err)
        return jsonResponse(500, JSON.stringify({message: 'An error occured'}))
    }
}