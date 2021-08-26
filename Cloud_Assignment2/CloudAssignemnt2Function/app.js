const AWS = require("aws-sdk");
const ses = new AWS.SES();
const SENDER_MAIL = process.env.SenderMail;

async function validateData(data) {
  const { mailTo, mailSubject, mailBody } = data;

  if (!mailTo || typeof mailTo !== "string") {
    throw new Error("Destination mail is not correct");
  }

  if (!mailSubject || typeof mailSubject !== "string") {
    throw new Error("Mail Subject is not correct");
  }

  if (!mailBody || typeof mailBody !== "string") {
    throw new Error("Mail Body is missing");
  }

  return true;
}

async function sendMail(data) {
  const { mailTo, mailSubject, mailBody } = data;

  const params = {
    Destination: {
      ToAddresses: [mailTo],
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
    const data = JSON.parse(event.Records[0]["Sns"]["Message"]);
    console.log("[INFO] Event Data ", data);
    if (data !== undefined && data !== null) {
      const valid = await validateData(data);

      if (valid) {
        await sendMail(data);
        console.log(
          "Mail send successfully for MessageId ",
          event.Records[0]["Sns"]["MessageId"]
        );
      }
    } else {
      throw new Error("Error in event data");
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};
