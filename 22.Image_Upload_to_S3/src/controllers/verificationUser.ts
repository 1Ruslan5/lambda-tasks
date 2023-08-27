import { jsonResponse } from "src/utils/repsonseJSON";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { checkerEmail } from "src/utils/checkerEmail";
import dynamodb from "@services/Dynamodb";
import cognito from "@services/Cognito";

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { email, code } = JSON.parse(event.body || '');

        if (!email) return jsonResponse(400, JSON.stringify({ message: 'The email is empty' }));
        if (!code) return jsonResponse(400, JSON.stringify({ message: 'The code is empty' }));
        if (!checkerEmail(email)) return jsonResponse(400, JSON.stringify({ message: 'The email is not valid' }));

        const checkEmail = await cognito.emailExist(email);
        if (!checkEmail) return jsonResponse(400, JSON.stringify({ message: "The email didn't registe" }));

        const checkVerification = await cognito.checkVerification(email);
        if (checkVerification) return jsonResponse(400, JSON.stringify({ message: "Your email has already been verified" }));

        const checkVerify = await cognito.verifyUser(email, code);
        if (!checkVerify) return jsonResponse(400, JSON.stringify({ message: 'The code is not valid' }));

        await dynamodb.updateVerify(email, true);
        return jsonResponse(200, JSON.stringify({ message: 'Successfully verified' }));
    } catch (err) {
        console.log(err);
        return jsonResponse(500, JSON.stringify({ message: 'An error occured' }));
    }
}