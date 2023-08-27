import * as dotenv from 'dotenv';
import User from '../models/userType';
import * as AWS from 'aws-sdk';

dotenv.config();

AWS.config.update({
  region: 'eu-central-1',
  credentials: {
    accessKeyId: process.env.CUSTOM_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.CUSTOM_AWS_SECRET_ACCESS_KEY,
  },
});

class Repository {
  dynamodb;

  constructor() {
    this.dynamodb = new AWS.DynamoDB.DocumentClient();
  }

  uploadUser = async (user: User) => {
    try {
      await this.dynamodb
        .put({
          TableName: process.env.TABLE_NAME,
          Item: user,
        }).promise();

      return true;
    } catch (error) {
      console.error('Upload error:', error);
      return false;
    }
  };

  findUserUsingEmailAndId = async (email: string, user_id: string): Promise<boolean> => {
    try {
      const result = await this.dynamodb.scan({
        TableName: process.env.TABLE_NAME,
        FilterExpression: 'email = :email or user_id = :user_id',
        ExpressionAttributeValues: {
          ':email': email,
          ':user_id': user_id,
        },
      }).promise();

      console.log(result);

      return result.Items.length > 0;
    } catch (error) {
      console.error('Find user uisng email and id error:', error);
      return false;
    }
  };

  findUserUsingEmail = async (email: string): Promise<AWS.DynamoDB.QueryOutput | null> => {
    try {
      const response = await this.dynamodb.query({
        TableName: process.env.TABLE_NAME,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      }).promise();

      return response;
    } catch (error) {
      console.error('Find user using email and id error:', error);
      return null;
    }
  };

  findUserUsingId = async (user_id: string): Promise<AWS.DynamoDB.QueryOutput | null> => {
    try {
      const response = await this.dynamodb.query({
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': user_id
        }
      }).promise();

      return response;
    } catch (error) {
      console.error('Find user using email and id error:', error);
      return null;
    }
  }

  findUserUsingRefreshToken = async (refreshToken: string): Promise<AWS.DynamoDB.QueryOutput | null> => {
    try {
      const response = await this.dynamodb.query({
        TableName: process.env.TABLE_NAME,
        IndexName: 'refresh_token-index',
        KeyConditionExpression: 'refresh_token = :refreshToken',
        ExpressionAttributeValues: {
          ':refreshToken': refreshToken
        }
      }).promise();

      return response;
    } catch (error) {
      console.error('Find user using email and id error:', error);
      return null;
    }
  }

  updateVerify = async (email: string, value: boolean): Promise<void> => {
    try {
      const queryResult = await this.findUserUsingEmail(email);

      if (queryResult.Items && queryResult.Items.length > 0) {
        const [item] = queryResult.Items;

        await this.dynamodb.update({
          TableName: process.env.TABLE_NAME,
          Key: {
            user_id: item.user_id
          },
          UpdateExpression: 'SET valid = :val',
          ExpressionAttributeValues: {
            ':val': value
          }
        }).promise();

        console.log(`Email verification status updated for user_id: ${item.user_id}`);
      } else {
        console.log(`No item found with email: ${email}`);
      }
    } catch (err) {
      console.error('Error updating email verification status:', err);
      throw err;
    }
  }

  checkVerification = async (email: string): Promise<boolean> => {
    try {
      const queryResult = await this.findUserUsingEmail(email);

      if (queryResult.Items.length > 0) {
        const [item] = queryResult.Items;

        const isValid = item.valid;

        return isValid ? true : false
      }
      console.log(`No item found with email: ${email}`);
      return false;
    } catch (err) {
      console.error('Error checking email verification status:', err);
      throw err;
    }
  }

  updateRefreshToken = async (user_id: any, refreshToken: string): Promise<boolean> => {
    try {
      await this.dynamodb.update({
        TableName: process.env.TABLE_NAME,
        Key: {
          user_id
        },
        UpdateExpression: 'SET refresh_token = :refreshToken',
        ExpressionAttributeValues: {
          ':refreshToken': refreshToken,
        }
      }).promise();

      return true;
    } catch (err) {
      console.error('Error updating email verification status:', err);
      return false;
    }
  }

  changePassword = async (email: string, newPassword: string): Promise<boolean> => {
    try {
      const queryResult = await this.findUserUsingEmail(email);

      if (queryResult.Items.length > 0) {
        const [item] = queryResult.Items;
        await this.dynamodb.update({
          TableName: process.env.TABLE_NAME,
          Key: {
            user_id: item.user_id
          },
          UpdateExpression: 'SET password = :newPassword',
          ExpressionAttributeValues: {
            ':newPassword': newPassword,
          },
        }).promise();
      }

      return true;
    } catch (err) {
      console.error('Error changing password:', err);
      return false;
    }
  }

  attemptsBorder = async (email: string): Promise<boolean> => {
    const data = await this.findUserUsingEmail(email);
    const now = Date.now();

    const lastAttemptsAttr = data.Items[0].lastAttempts;
    const lastAttempts: number[] = Array.isArray(lastAttemptsAttr) ? lastAttemptsAttr as number[] : [];

    const recentAttempts = lastAttempts.filter(attempt => now - attempt <= 300000);

    return recentAttempts.length <= 5;
  }

  addAttempt = async (email: string): Promise<void> => {
    const data = await this.findUserUsingEmail(email);
    const now = Date.now();

    const lastAttemptsAttr = data.Items[0].lastAttempts;
    const lastAttempts: number[] = Array.isArray(lastAttemptsAttr) ? lastAttemptsAttr as number[] : [];

    lastAttempts.push(now);
    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: { user_id: data.Items[0].user_id },
      UpdateExpression: "SET lastAttempts = :lastAttempts",
      ExpressionAttributeValues: { ":lastAttempts": lastAttempts }
    };
    await this.dynamodb.update(updateParams).promise();
  }
}

export default new Repository();