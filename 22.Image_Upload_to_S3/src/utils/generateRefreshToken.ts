import { randomBytes } from 'crypto';

export const generateRefreshToken = () => {
    return randomBytes(32).toString('hex');
}