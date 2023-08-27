import { jsonResponse } from "src/utils/repsonseJSON";
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import dynamodb from "src/services/Dynamodb";
import cognito from "src/services/Cognito";
import { checkerEmail } from 'src/utils/checkerEmail';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email } = JSON.parse(event.body || '');

        if (!email) return jsonResponse(400, JSON.stringify({ message: 'The email is empty' }));
        if (!checkerEmail(email)) return jsonResponse(400, JSON.stringify({ message: "The email is not valid" }));

        const { Items } = await dynamodb.findUserUsingEmail(email);
        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({ message: 'The user is not found' }));
        if (!Items[0].valid) return jsonResponse(400, JSON.stringify({ message: "The user isn't valid" }));

        const attemptsBorder = await dynamodb.attemptsBorder(email);
        if (!attemptsBorder) return jsonResponse(400, JSON.stringify({ message: "You have exceeded the code sending limit. Please wait 5 minutes before trying again." }));

        await dynamodb.addAttempt(email);

        const initiatePasswordReset = await cognito.initiatePasswordReset(email);
        if (!initiatePasswordReset) return jsonResponse(400, JSON.stringify({ message: 'An error occurred' }));

        return jsonResponse(200, JSON.stringify({ message: 'The reset code has been sent to your email' }));
    } catch (err) {
        console.log(err);
        return jsonResponse(500, JSON.stringify({ message: 'An error occurred' }));
    }
}
