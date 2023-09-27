import { JwtPayload } from "jsonwebtoken";

export interface MyJwtPayload extends JwtPayload {
    user_name: string;
    password: string;
    search_phrases: string[];
}