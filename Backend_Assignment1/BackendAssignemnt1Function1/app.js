let response;
const AWS = require("aws-sdk");
const URL_TABLE = process.env.UrlTable;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createShortUrl() {
  return Math.random().toString(36).substring(2, 6);
}

async function checkUrlExist(url){
  let urlExist=undefined;
  const params={
    TableName:URL_TABLE,
    Key:{
      longUrl:url
    }
  };

  const {Item}=await dynamoDb.get(params).promise();

  if(Item){
    urlExist=Item.shortUrl;
  }

  return urlExist;
}

async function addShortUrl(longUrl,shortUrl){
  const params={
    TableName:URL_TABLE,
    Item:{
      longUrl,
      shortUrl
    }
  };

  await dynamoDb.put(params).promise();
}

exports.lambdaHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    if (data && data.url) {
      const { url: longUrl } = data;

      const urlExist = await checkUrlExist(longUrl);
      if (urlExist) {
        // If url exist then send the corresponding shortUrl
        response = {
          statusCode: 409,
          body: JSON.stringify({ message: "Short Url Already exist", url:urlExist }),
        };
      } else {
        //If url not exist then createOne and send
        const shortUrl = await createShortUrl();
        await addShortUrl(longUrl,shortUrl);
        response = {
          statusCode: 201,
          body: JSON.stringify({ message: "Short Url Created", url:shortUrl }),
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
