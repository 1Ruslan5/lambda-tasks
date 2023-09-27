import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import postgreSql from 'src/services/PostgreSQL';
dotenv.config();

class SQS {
    sqs: AWS.SQS;
    queueUrl = process.env.QUEUE_URL;
    isProcessing: boolean = false;

    constructor() {
        this.sqs = new AWS.SQS({ region: 'eu-central-1' })
    }

    sendMessageToSQS = async (messageBody) => {
        const params = {
            QueueUrl: this.queueUrl,
            MessageBody: JSON.stringify(messageBody),
        }

        try {
            await this.sqs.sendMessage(params).promise();
        } catch (err) {
            console.error(err);
        }
    }

    processMessagesFromSQS = async () => {
        while (true) {
            try {
                const messages = await this.sqs.receiveMessage({
                    QueueUrl: this.queueUrl,
                    MaxNumberOfMessages: 10,
                }).promise();

                if (messages.Messages && messages.Messages.length > 0) {
                    this.isProcessing = true;
                    for (const message of messages.Messages) {
                        const body = JSON.parse(message.Body);
                        
                        await postgreSql.insertUser(body);

                        await this.sqs.deleteMessage({
                            QueueUrl: this.queueUrl,
                            ReceiptHandle: message.ReceiptHandle,
                        }).promise();
                    }
                } else {
                    console.log('No messages to process');
                }
            } catch (err) {
                console.error('Error processing messages from SQS:', err);
            }
        }
    }
}

export default new SQS();