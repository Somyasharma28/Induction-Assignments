let response;
const AWS = require("aws-sdk");
const URL_TABLE = process.env.UrlTable;
const bucket = process.env.imageBucket;
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const Jimp = require("jimp");

async function getImageKey(shortUrl) {
  const params = {
    TableName: URL_TABLE,
    Key: {
      shortUrl: shortUrl,
    },
  };

  const { Item } = await dynamoDb.get(params).promise();

  if (Item) {
    return Item.Location;
  } else return false;
}

async function resizeImage(location, height, width) {
 
 await Jimp.read(location)
  .then(img=>{
    console.log(img);
   img.resize(height, width).getBufferAsync(Jimp.MIME_JPEG);
   console.log("here");
   return img.bitmap.data;
  })
  .catch(err=>{
    console.log(err);
  })
  

}

async function storeResizedImage(resizedImage, imageKey) {
  const params = {
    Bucket: bucket,
    Body: resizedImage,
    Key: imageKey,
    ACL: "public-read",
  };

  const { Location, Key } = await s3.upload(params).promise();

  if (Location && Key) return true;
}

exports.lambdaHandler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const url = event.pathParameters.url;
    const { height, width } = data;
    console.log(url, height, width);
    if (!(height && width && url)) throw new Error("Data is missing");

    const location = await getImageKey(url);

    console.log(location);

    if (!location) {
      response = {
        statusCode: 400,
        body: JSON.stringify({ message: "Image not found" }),
      };

      return response;
    }

    const resizedImage = await resizeImage(location, height, width);

    console.log(resizedImage);

    // const resized=await storeResizedImage(resizedImage,imageKey);

    // if(resized){
    //   response={
    //     statusCode:200,
    //     body:JSON.stringify({message:"Image resizing successful"})
    //   }

    // }else{
    //   response={
    //     statusCode:400,
    //     body:JSON.stringify({message:"Error in resizing image"})
    //   }
    // }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response;
};
