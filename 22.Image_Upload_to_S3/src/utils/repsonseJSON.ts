export const jsonResponse = (statusCode: number, message: string) => {
    return {
        statusCode,
        body: message
    }
}