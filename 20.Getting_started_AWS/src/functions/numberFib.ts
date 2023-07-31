import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const fiboNumber = (n: number): number[] => {
    const array = [n,n];
    let sum = n;
    for (let i = 0; i < 8; i++) {
        sum += array[i];
        array.push(sum);
    }
    return array;
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        let b = '';
        fiboNumber(1).forEach(a => b += a + ' ')
        const response = {
            statusCode: 200,
            body: b
        };
        return response;
    } catch (err) {
        return {
            statusCode: 500,
            body: 'An error occured',
        };
    }
}