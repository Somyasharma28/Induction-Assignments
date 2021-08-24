let response = {};
const AWS = require("aws-sdk");
const ses = new AWS.SES();
const SENDER_MAIL = process.env.SenderMail;

const responseObject = (statusCode, message) => {
  response = {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

async function validateData(data) {
  const { mailTo, mailSubject, mailBody } = data;
 
  if (!mailTo || ((typeof mailTo) !=="string")) {
    responseObject(400, "Destination mail is not correct");
    return false;
  }

  if (!mailSubject || ((typeof mailSubject) !=="string")) {
    responseObject(400, "Mail Subject is not correct");
    return false;
  }

  if (!mailBody || ((typeof mailBody) !=="string")) {
    responseObject(400, "Mail Body is missing");
    return false;
  }

  return true;
}

async function sendMail(data) {
  const { mailTo, mailSubject, mailBody } = data;

  const params = {
    Destination: {
      ToAddresses: [mailTo]
    },
    Message: {
      Body: {
        Text: {
          Charset: "UTF-8",
          Data: mailBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: mailSubject,
      },
    },
    Source: SENDER_MAIL,
  };

  const res = await ses.sendEmail(params).promise();
  console.log(res);
}

exports.lambdaHandler = async (event, context) => {
  try {
    const data =JSON.parse(event.body);
    if (data !== undefined && data !== null) {
      const valid = await validateData(data);

      if (valid) {
        await sendMail(data);
        responseObject(200, "Mail send successfully");
      }
    } else {
      responseObject(500, "Eroor in event data");
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
