import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const { body } = event;
        const { name } = JSON.parse(body || '');
        const response = {
            statusCode: 200,
            body: `Hellow ${name}`
        };
        return response;
    } catch (err) {
        return {
            statusCode: 500,
            body: 'An error occured',
        };
    }
}
