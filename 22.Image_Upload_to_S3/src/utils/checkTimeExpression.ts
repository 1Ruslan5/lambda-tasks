import jwt from 'jsonwebtoken';

export const checkTimeExpression = (token: string): boolean => {
    const {exp} = jwt.decode(token);
    const expirationTime = new Date(exp * 1000);
    const current_time = new Date();
    return current_time < expirationTime;
}