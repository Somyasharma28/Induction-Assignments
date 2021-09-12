let response;
const AWS = require("aws-sdk");
const DEMO_TABLE = process.env.demoTable;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

function createId() {
  return Math.random().toString(36).substring(2, 6);
}

exports.lambdaHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    if (data && data.name) {
      const id= createId();

      const params={
        TableName:DEMO_TABLE,
        Item:{
          id,
          name:data.name,
          timestamp: new Date().getTime()
        }
      }

      await dynamoDb.put(params).promise();

      response = {
        statusCode: 200,
        body: JSON.stringify({ message: "User created" }),
      };
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
