let response;
const AWS = require("aws-sdk");
const URL_TABLE = process.env.UrlTable;
const bucket = process.env.imageBucket;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

async function createShortUrl() {
  return Math.random().toString(36).substring(2, 6);
}

async function storeKey(Location, Key, shortUrl) {
  const params = {
    TableName: URL_TABLE,
    Item: {
      shortUrl,
      Location,
      Key,
    },
  };

  await dynamoDb.put(params).promise();
}

async function uploadImage(data, imageName) {
  const binaryData = Buffer.from(data, "base64");
  const currDate = new Date();
  const params = {
    Bucket: bucket,
    Body: binaryData,
    Key: `image/${imageName}-${currDate.getDay()}-${currDate.getMonth()}-${currDate.getFullYear()}`,
    ACL: "public-read",
  };

  const { Location, Key } = await s3.upload(params).promise();

  if (Location) return { Location, Key };
}

exports.lambdaHandler = async (event) => {
  try {
    const data = event.body;
    const imageName = event["queryStringParameters"].imageName;

    if (data && imageName) {
      const { Location, Key } = await uploadImage(data, imageName);
      if (Location && Key) {
        // If image uploaded is successful
        const shorltUrl = await createShortUrl();
        await storeKey(Location, Key, shorltUrl);
        response = {
          statusCode: 200,
          body: JSON.stringify({ message: "Image uplaoded", url: shorltUrl }),
        };
      } else {
        response = {
          statusCode: 400,
          body: JSON.stringify({
            message: "Image not uploaded. Please try again!",
          }),
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
