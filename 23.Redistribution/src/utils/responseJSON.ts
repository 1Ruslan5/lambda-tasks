export const jsonResponse = (statusCode: number, body: string) => {
    return {
        statusCode,
        body
    }
}