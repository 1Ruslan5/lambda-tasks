import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse } from 'src/utils/repsonseJSON';
import { checkerEmail } from 'src/utils/checkerEmail';
import { checkerPassword } from 'src/utils/checkerPassword';
import { checkerName } from 'src/utils/checkerName';
import dynamoDB from "@services/Dynamodb";
import User from '@models/userType';
import cognito from "@services/Cognito";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, password, name } = JSON.parse(event.body || '');

        if (!email) return jsonResponse(400, JSON.stringify({ message: 'The email is empty' }));
        if (!password) return jsonResponse(400, JSON.stringify({ message: 'The password is empty' }));
        if (!name) return jsonResponse(400, JSON.stringify({ message: 'The name is empty' }));
        if (!checkerEmail(email)) return jsonResponse(400, JSON.stringify({ message: "The email is not valid" }));
        if (!checkerPassword(password)) return jsonResponse(400, JSON.stringify({ message: 'The password is not valid. It must contain at least one capital letter, one lowercase letter, one number, and be a minimum of 8 characters' }));
        if (!checkerName(name)) return jsonResponse(400, JSON.stringify({ message: 'The name is not valid. It must contain at least one capital letter, one lowercase letter and be a minimum size of 3 cheracters' }));

        const findUser = await dynamoDB.findUserUsingEmailAndId(email, name);
        if (findUser) return jsonResponse(400, JSON.stringify({ message: 'Account with the same name or email already exist' }));

        const sendVerify = await cognito.signUp(email, password);
        if (!sendVerify) return jsonResponse(400, JSON.stringify({ message: 'An error occured' }));

        const lastAttempts: number[] = [Date.now()] 

        const user: User = {
            user_id: name,
            email,
            password,
            lastAttempts,
            valid: false,
        };

        const sendUser = await dynamoDB.uploadUser(user);
        if (!sendUser) return jsonResponse(400, JSON.stringify({ message: 'An error occured' }));

        return jsonResponse(200, JSON.stringify({ message: 'User created. Now check your email for verification' }));
    } catch (err) {
        return jsonResponse(500, JSON.stringify({ message: 'An error occured' }));
    }
}