const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://d2uj2m1tmcf0dw.cloudfront.net',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id: 'visitor-count' }
    }));

    const currentCount = result.Item ? result.Item.count : 0;
    const newCount = currentCount + 1;

    await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id: 'visitor-count' },
      UpdateExpression: 'SET #count = :count',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':count': newCount },
      ReturnValues: 'UPDATED_NEW'
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ count: newCount, message: 'Visitor count updated successfully' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Failed to update visitor count', details: error.message })
    };
  }
};
