let response;
const AWS = require("aws-sdk");
const URL_TABLE = process.env.UrlTable;
const bucket=process.env.imageBucket;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3= new AWS.S3();

async function getImageKey(shortUrl) {
  const params = {
    TableName: URL_TABLE,
    Key:{
      "shortUrl":shortUrl
    } 
  };

  const { Item } = await dynamoDb.get(params).promise();
  
  if (Item) {
    return Item.Key;
  } else return false;
}

async function getImage(imageKey){

  const params={
    Bucket:bucket,
    Key:imageKey
  };

  const {Body}=await s3.getObject(params).promise();

  return Body;
}

exports.lambdaHandler = async (event) => {
  try {
    const data = event.pathParameters;
    if (data && data.url) {

      const imageKey = await getImageKey(data.url);

      if (imageKey) {

        const image= await getImage(imageKey);
       
        response = {
          statusCode: 200,
          body:image.toString('base64'),
          "isBase64Encoded": true
        };
      } else {
        response = {
          statusCode: 400,
          body: JSON.stringify({ message: "No image found" }),
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
