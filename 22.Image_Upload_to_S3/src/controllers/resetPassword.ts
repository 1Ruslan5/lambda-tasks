import { jsonResponse } from "src/utils/repsonseJSON";
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import dynamodb from "src/services/Dynamodb";
import cognito from "src/services/Cognito";
import { checkerEmail } from 'src/utils/checkerEmail';
import { checkerPassword } from 'src/utils/checkerPassword';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, code, newPassword } = JSON.parse(event.body || '');

        if (!email) return jsonResponse(400, JSON.stringify({ message: 'The email is empty' }));
        if (!code) return jsonResponse(400, JSON.stringify({ message: 'The token is empty' }));
        if (!newPassword) return jsonResponse(400, JSON.stringify({ message: 'The new password is empty' }));
        if (!checkerEmail(email)) return jsonResponse(400, JSON.stringify({ message: "The email is not valid" }));
        if (!checkerPassword(newPassword)) return jsonResponse(400, JSON.stringify({ message: "The password is not valid. It must contain at least one capital letter, one lowercase letter, one number, and be a minimum of 8 characters" }));

        const { Items } = await dynamodb.findUserUsingEmail(email);
        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({ message: 'The user is not found' }));
        if (Items[0].password === newPassword) return jsonResponse(400, JSON.stringify({ message: 'The password is the same as the previous one' })); 

        const submitPasswordReset = await cognito.submitPasswordReset(email, code, newPassword);
        if (!submitPasswordReset) return jsonResponse(400, JSON.stringify({ message: 'Code is unvalid' }));

        const changePassword = await dynamodb.changePassword(email, newPassword);
        if(!changePassword) return jsonResponse(400, JSON.stringify({ message: 'An error occurred' }));

        return jsonResponse(200, JSON.stringify({ message: 'The password has been change' }));
    } catch (err) {
        console.log(err);
        return jsonResponse(500, JSON.stringify({ message: 'An error occurred' }));
    }
}
