const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const COUNTER_KEY = { id: 'visitor-count' };
const VISIT_WINDOW_SECONDS = 24 * 60 * 60; // the same visitor is counted once per day

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': 'https://hunterulrich.dev',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

const respond = (statusCode, body) => ({ statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) });

async function getCount() {
  const result = await docClient.send(new GetCommand({ TableName: TABLE_NAME, Key: COUNTER_KEY }));
  return result.Item ? result.Item.count : 0;
}

exports.handler = async (event) => {
  try {
    // ?peek=1 returns the count without counting a visit (used by the deploy check)
    if (event.queryStringParameters && event.queryStringParameters.peek === '1') {
      return respond(200, { count: await getCount() });
    }

    // Only store a hash of the IP, never the IP itself. DynamoDB TTL deletes it after a day.
    const ip = (event.requestContext && event.requestContext.identity && event.requestContext.identity.sourceIp) || 'unknown';
    const visitorId = 'visitor#' + crypto.createHash('sha256').update(ip).digest('hex');
    const now = Math.floor(Date.now() / 1000);

    try {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { id: visitorId, ttl: now + VISIT_WINDOW_SECONDS },
        // TTL cleanup can lag, so also treat an expired record as a new visit
        ConditionExpression: 'attribute_not_exists(id) OR #ttl < :now',
        ExpressionAttributeNames: { '#ttl': 'ttl' },
        ExpressionAttributeValues: { ':now': now }
      }));
    } catch (err) {
      if (err.name === 'ConditionalCheckFailedException') {
        // Already counted this visitor today
        return respond(200, { count: await getCount() });
      }
      throw err;
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: COUNTER_KEY,
      UpdateExpression: 'ADD #count :one',
      ExpressionAttributeNames: { '#count': 'count' },
      ExpressionAttributeValues: { ':one': 1 },
      ReturnValues: 'UPDATED_NEW'
    }));

    return respond(200, { count: result.Attributes.count });

  } catch (error) {
    console.error('Error:', error);
    return respond(500, { error: 'Failed to update visitor count' });
  }
};
