import { sign } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

export const generateJWT = ( userObj: object, time: string ) => {
    return sign( userObj, process.env.SECRET_KEY, {expiresIn: time} )
}