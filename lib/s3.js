import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import logger from "./logger";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const uploadToS3 = async (file) => {
  const fileStream = fs.createReadStream(file.filepath);

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `images/lnf/${Date.now()}_${file.originalFilename}`,
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const { Location } = await s3.upload(uploadParams).promise(); // Upload to S3
    return Location; // Return the S3 URL of the uploaded image
  } catch (err) {
    logger.error({ 
        message: "Error uploading to S3", 
        stack: err.stack, 
        function: "uploadToS3" 
    });

    throw new Error("Error uploading to S3: " + err.message);
}
};

export { uploadToS3 };
