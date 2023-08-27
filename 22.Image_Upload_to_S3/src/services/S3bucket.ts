import * as AWS from 'aws-sdk';

AWS.config.update({
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1'
});

class S3bucketService {
    s3: AWS.S3;
    bucketName: string = process.env.BUCKET_NAME;

    constructor() {
        this.s3 = new AWS.S3();
    }

    checkFileExists = async (name: string, userId: string): Promise<boolean> => {
        try {
            await this.s3.headObject({
                Bucket: this.bucketName,
                Key: `${userId}/images/${name}`,
            }).promise();
            return true;
        } catch (error) {
            if (error.code === 'NotFound') {
                return false;
            } else {
                console.log('Error:', error);
                return false;
            }
        }
    }


    generatePresignedPostData = (name: string, userId: string, contentType: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: this.bucketName,
                Fields: {
                    key: `${userId}/images/${name}`,
                    'Content-Type': contentType,
                },
                Expires: 3600,
            };

            this.s3.createPresignedPost(params, (error, presignedPostData) => {
                if (error) {
                    console.log(error);
                    reject(null);
                } else {
                    resolve(presignedPostData);
                }
            });
        });
    }


    deleteImage = async (imageName: string, userId: string,): Promise<boolean> => {
        try {
            const params = {
                Bucket: this.bucketName,
                Key: `${userId}/images/${imageName}`,
            };

            await this.s3.deleteObject(params).promise();

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    listImages = async (userId: string): Promise<String[] | null> => {
        try {
            const params = {
                Bucket: this.bucketName,
                Prefix: `${userId}/images/`,
            };

            const response = await this.s3.listObjectsV2(params).promise();

            if (!response.Contents) {
                return null;
            }

            const imageUrls = response.Contents.map((object) => {
                const imageUrl = this.s3.getSignedUrl('getObject', {
                    Bucket: this.bucketName,
                    Key: object.Key!,
                });
                return `${object.Key?.split('/').pop()}: ${imageUrl}`;
            });

            return imageUrls;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

export default new S3bucketService();