let response;
const AWS = require("aws-sdk");
const URL_TABLE = process.env.UrlTable;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function getShortUrl(shortUrl) {
  const params = {
    TableName: URL_TABLE,
    IndexName: "shortUrlIndex",
    KeyConditionExpression: "shortUrl = :shortUrl",
    ExpressionAttributeValues: {
      ":shortUrl": shortUrl,
    },
  };

  const { Items } = await dynamoDb.query(params).promise();

  if (Items.length === 1) {
    return Items[0].longUrl;
  } else return false;
}

exports.lambdaHandler = async (event, context) => {
  try {
    const data = event.pathParameters;
    if (data && data.url) {
      const url = await getShortUrl(data.url);
      if (url) {
        response = {
          statusCode: 307,
          headers: {
            Location: url,
          },
        };
      } else {
        response = {
          statusCode: 400,
          body: JSON.stringify({ message: "Bad Request data" }),
        };
      }
    } else {
      response = {
        statusCode: 400,
        body: JSON.stringify({ message: "Bad Request Body" }),
      };
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
