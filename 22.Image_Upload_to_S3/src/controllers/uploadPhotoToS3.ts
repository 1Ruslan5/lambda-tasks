import { jsonResponse } from "src/utils/repsonseJSON";
import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import jwt from "jsonwebtoken";
import dynamodb from "src/services/Dynamodb";
import { checkTimeExpression } from "src/utils/checkTimeExpression";
import { parse } from 'aws-multipart-parser';
import ImageObject from "src/models/imageType";
import s3 from "src/services/S3bucket";
import FormData from 'form-data';
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const data = parse(event, true);

        const token = data['token'].toString();
        const photo = data['photo'] as ImageObject;
        console.log(photo);
        if (!token) return jsonResponse(400, JSON.stringify({ message: 'The token is empty' }));
        if (!photo) return jsonResponse(400, JSON.stringify({ message: 'The photo is empty' }));

        const validToken = checkTimeExpression(token);

        if (!validToken) return jsonResponse(400, JSON.stringify({ message: 'The token is expired' }));

        const { user_id: userId } = jwt.verify(token, process.env.SECRET_KEY);
        const { Items } = await dynamodb.findUserUsingId(userId);

        if (Items.length <= 0) return jsonResponse(400, JSON.stringify({ message: 'The user is not found' }));
        if (!photo.contentType.includes('image/')) return jsonResponse(400, JSON.stringify({ message: 'The photo is not an image' }));

        const validName = await s3.checkFileExists(photo.filename, userId);

        if (validName) return jsonResponse(400, JSON.stringify({ message: 'The photo with this name is already exists' }));

        const presignedPostData = await s3.generatePresignedPostData(photo.filename, userId, photo.contentType);

        if (!presignedPostData) return jsonResponse(400, JSON.stringify({ message: 'The photo is not uploaded' }));

        const formData = new FormData();

        for (const field in presignedPostData.fields) {
            formData.append(field, presignedPostData.fields[field]);
        }

          
        formData.append('file', photo.content, photo.filename);

        await axios.post(presignedPostData.url, formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Length': formData.getLengthSync(),
            },
        });


        return jsonResponse(200, JSON.stringify({ message: 'Photo uploaded successfully' }));
    } catch (err) {
        console.log(err);
        return jsonResponse(500, JSON.stringify({ message: 'An error occurred' }));
    }
}
