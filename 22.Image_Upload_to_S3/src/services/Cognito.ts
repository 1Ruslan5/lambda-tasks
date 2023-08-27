import * as AWS from "aws-sdk";
import * as crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config();

AWS.config.update({
    region: "eu-central-1",
    credentials: {
        accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
    }
});

class Cognito {
    cognito: AWS.CognitoIdentityServiceProvider;

    clientId: string = process.env.CLIENT_ID;
    clientSecret: string = process.env.CLIENT_SECRET;

    userPoolId: string = process.env.USER_POOL_ID;

    constructor() {
        this.cognito = new AWS.CognitoIdentityServiceProvider();
    }

    signUp = async (email: string, password: string): Promise<boolean> => {
        const params: AWS.CognitoIdentityServiceProvider.SignUpRequest = {
            ClientId: this.clientId,
            SecretHash: this.createSecretHash(email),
            Username: email,
            Password: password,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email
                }
            ]
        };

        try {
            const response = await this.cognito.signUp(params).promise();
            console.log(response);
            return true;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    verifyUser = async (email: string, verificationCode: string): Promise<boolean> => {
        const params: AWS.CognitoIdentityServiceProvider.ConfirmSignUpRequest = {
            ClientId: this.clientId,
            SecretHash: this.createSecretHash(email),
            Username: email,
            ConfirmationCode: verificationCode,
        };

        try {
            const response = await this.cognito.confirmSignUp(params).promise();
            return response.$response && response.$response.error === null;
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    emailExist = async (email: string): Promise<boolean> => {
        const params: AWS.CognitoIdentityServiceProvider.ListUsersRequest = {
            UserPoolId: this.userPoolId,
            Filter: `email = "${email}"`,
            AttributesToGet: [],
            Limit: 1
        };

        try {
            const response = await this.cognito.listUsers(params).promise();
            return response.Users && response.Users.length > 0;
        } catch (err) {
            console.error('Error checking email existence:', err);
            return false;
        }
    }

    resendVerificationCode = async (email: string): Promise<boolean> => {
        const params: AWS.CognitoIdentityServiceProvider.ResendConfirmationCodeRequest = {
            ClientId: this.clientId,
            SecretHash: this.createSecretHash(email),
            Username: email,
        }

        try {
            const response = await this.cognito.resendConfirmationCode(params).promise()
            return response.$response && response.$response.error === null
        } catch (err) {
            console.log('Error resend verification code : ', err);
            return false
        }
    }

    checkVerification = async (email: string): Promise<boolean> => {
        const params: AWS.CognitoIdentityServiceProvider.AdminGetUserRequest = {
            UserPoolId: this.userPoolId,
            Username: email,
        }

        try {
            const response = await this.cognito.adminGetUser(params).promise();
            return response.UserStatus === 'CONFIRMED';
        } catch (err) {
            console.error('Error check verificaton :', err);
            return false
        }
    }

    initiatePasswordReset = async (email: string): Promise<boolean> => {
        try {
            const params = {
                ClientId: this.clientId,
                SecretHash: this.createSecretHash(email),
                Username: email,
            };

            const response = await this.cognito.forgotPassword(params).promise();
            return response.$response && response.$response.error === null
        } catch (err) {
            console.log('Error initiating password reset :', err);
            return false
        }
    }

    submitPasswordReset = async (email: string, resetCode: string, newPassword: string): Promise<boolean> => {
        try {
            const params = {
                ClientId: this.clientId,
                SecretHash: this.createSecretHash(email),
                ConfirmationCode: resetCode,
                Password: newPassword,
                Username: email,
            };

            const response = await this.cognito.confirmForgotPassword(params).promise();
            return response.$response && response.$response.error === null;
        } catch (error) {
            console.error('Error submitting password reset:', error);
            return false;
        }
    }

    createSecretHash = (email: string): string => {
        return crypto.createHmac("SHA256", this.clientSecret).update(email + this.clientId).digest('base64');
    }
}

export default new Cognito();