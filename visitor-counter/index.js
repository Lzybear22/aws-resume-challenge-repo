const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    try {
        // Get current visitor count
        const getParams = {
            TableName: TABLE_NAME,
            Key: {
                id: 'visitor-count'
            }
        };
        
        let currentCount = 0;
        
        try {
            const result = await docClient.send(new GetCommand(getParams));
            currentCount = result.Item ? result.Item.count : 0;
        } catch (error) {
            console.log('Item not found, starting with 0');
        }
        
        // Increment the count
        const newCount = currentCount + 1;
        
        // Update the count in DynamoDB
        const updateParams = {
            TableName: TABLE_NAME,
            Key: {
                id: 'visitor-count'
            },
            UpdateExpression: 'SET #count = :count',
            ExpressionAttributeNames: {
                '#count': 'count'
            },
            ExpressionAttributeValues: {
                ':count': newCount
            },
            ReturnValues: 'UPDATED_NEW'
        };
        
        await docClient.send(new UpdateCommand(updateParams));
        
        // Return the new count
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
            },
            body: JSON.stringify({
                count: newCount,
                message: 'Visitor count updated successfully'
            })
        };
        
    } catch (error) {
        console.error('Error:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Failed to update visitor count',
                details: error.message
            })
        };
    }
};
