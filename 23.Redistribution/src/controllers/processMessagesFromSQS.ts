import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { jsonResponse } from 'src/utils/responseJSON';
import sqs from 'src/services/SQS'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try{
        await sqs.processMessagesFromSQS();
        return jsonResponse(200, JSON.stringify({message: 'Ok'}))
    } catch (error) {
        console.log(error);
        return jsonResponse(500, JSON.stringify({ message: 'An error occured' }));
    }
}