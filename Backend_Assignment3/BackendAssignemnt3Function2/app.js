let response;
const AWS = require("aws-sdk");
const DEMO_TABLE = process.env.demoTable;
const snsTopic= process.env.snsTopic;
const sns= new AWS.SNS();
const dynamoDB= new AWS.DynamoDB.DocumentClient();

exports.lambdaHandler = async(event, context) => {
try{
    
 const timestamp= ((new Date().getTime())-(24*60*60*60));
 
 const params={
     TableName:DEMO_TABLE,
     FilterExpression:"#time >=:time",
     ExpressionAttributeValues:{
         ":time":timestamp
     },
     ExpressionAttributeNames:{
         "#time":"timestamp"
     }
 };
 
 const {Items}= await dynamoDB.scan(params).promise();
 
 console.log(Items.length);
 
 const snsParams = {
  Message: `Greetings. Total ${Items.length} user has registered yesterday`,
  Subject: 'Yesterday"s New User Count',
  TopicArn: snsTopic
};

const response= await sns.publish(snsParams).promise();

console.log(response);
    
}catch(err){
    throw err;
}
};