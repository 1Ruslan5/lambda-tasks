import { sign } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export const generateJWT = ( userObj: object, time: object ) => {
    return sign( userObj, process.env.SECRET_KEY, time )
}