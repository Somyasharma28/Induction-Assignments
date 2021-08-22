let response;
const AWS = require("aws-sdk");
const USER_TABLE = process.env.UserTable;
const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function createUser(userData) {
  const params = {
    TableName: USER_TABLE,
    Item: { ...userData },
  };

  await dynamoDb.put(params).promise();
}

async function checkUserAlreadyPresent(username, password) {
  const params = {
    TableName: USER_TABLE,
    Key: {
      username: username,
      password: password,
    },
  };

  const { Item } = await dynamoDb.get(params).promise();

  if (Item) return true;
  else return false;
}

exports.lambdaHandler = async (event, context) => {
  try {
    event.body = JSON.parse(event.body);
    const { username, password } = event.body;
    const userExist = await checkUserAlreadyPresent(username, password);

    if (userExist) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: "User already present",
        }),
      };
    } else {
      await createUser(event.body);
      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: "User Created",
          username,
          password,
        }),
      };
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
