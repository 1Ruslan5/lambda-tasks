import { jsonResponse } from "src/utils/repsonseJSON";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda"
import { checkerEmail } from "src/utils/checkerEmail";
import cognito from "@services/Cognito"
import dynamodb from "@services/Dynamodb"

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email } = JSON.parse(event.body || '');

        if (!email) return jsonResponse(400, JSON.stringify({ message: 'The email is empty' }));
        if (!checkerEmail(email)) return jsonResponse(400, JSON.stringify({ message: 'The email is not valid' }));

        const emailExist = await cognito.emailExist(email);
        if (!emailExist) return jsonResponse(400, JSON.stringify({ message: "The email didn't registe" }));

        const checkVerification = await cognito.checkVerification(email);
        if (checkVerification) return jsonResponse(400, JSON.stringify({ message: "Your email has already been verified" }));

        const attemptsBorder = await dynamodb.attemptsBorder(email);
        if (!attemptsBorder) return jsonResponse(400, JSON.stringify({ message: "You have exceeded the code sending limit. Please wait 5 minutes before trying again." }));

        await dynamodb.addAttempt(email);

        const sendCode = await cognito.resendVerificationCode(email);
        if (!sendCode) return jsonResponse(400, JSON.stringify({ message: "Failed to Send Verification Code: Please try again later" }))

        return jsonResponse(200, JSON.stringify({ message: 'Your code was sent to your email' }));
    } catch (err) {
        console.error(err);
        return jsonResponse(500, JSON.stringify({ message: 'An error occured' }))
    }
};