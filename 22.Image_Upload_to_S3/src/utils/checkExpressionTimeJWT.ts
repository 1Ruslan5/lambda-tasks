import jwt from 'jsonwebtoken';

export const checkEpressionTimeJWT = (token: string) => {
    const { userId } = jwt.verify(token, process.env.SECRET_KEY);
}