import { db, checkDbConnection } from "../../../lib/db";
import sendMail from "lib/mailService";
import { generateContactOwnerEmail } from "../../../lib/emailTemplates";
import formidable from "formidable";
import fs from "fs";
import { uploadToS3 } from "lib/s3";
import { encrypt } from "lib/encryption";
import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";

export const config = {
  api: {
    bodyParser: false, // Required for formidable
  },
};

const createContactOwner = async (req, res) => {
  const form = new formidable.IncomingForm({
    keepExtensions: true, // Preserve file extensions
    multiples: false, // Handle single file upload
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form data:", err);
      return res.status(500).json({ message: "Error parsing form data" });
    }

    try {
      // Extract fields from the request
      const {
        name,
        email = null,
        mobile,
        item_id,
        city = null,
        region_name = null,
        country_name = null,
        user_id,
        unique_user_id,
        messageA,
        latitude,
        longitude,
        language = null,
      } = fields;

      if (!name || !mobile || !item_id) {
        return res.status(400).json({
          message:
            "Missing required fields: name, mobile, and item_id are mandatory.",
        });
      }

      // Handle file upload (if provided)
      let imageUrl = null;
      if (files.image) {
        const filePath = files.image;
        const uploadResult = await uploadToS3(
          filePath,
          `finder-images/${Date.now()}-${filePath.originalFilename}`
        );

        if (uploadResult) {
          imageUrl = uploadResult;
        } else {
          return res
            .status(500)
            .json({ message: `Image upload failed: ${uploadResult.error}` });
        }
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      // Insert the finder details into the database
      const query = `
        INSERT INTO tbl_finder 
        (name,unique_user_id, email, mobile, item_id, city, region_name, message, country_name, latitude, longitude, image, indate,lnf_otp,language) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const indate = new Date();
      const [result] = await db.query(query, [
        name,
        unique_user_id,
        email,
        mobile,
        item_id,
        city,
        region_name,
        messageA,
        country_name,
        latitude,
        longitude,
        imageUrl,
        indate,
        otp,
        language,
      ]);

      const contactOwnerId = result.insertId;

      // Upadte Scan Report -------------------------------------
      const userRole = "Finder";
      const updateScanQuery = `
  UPDATE qr_scans 
  SET 
    scanner_name = ?,
    mobile = ?,
    user_role= ?
  WHERE unique_user_id = ?
`;
      console.log("unique_user_id", unique_user_id);
      await db.query(updateScanQuery, [name, mobile, userRole, unique_user_id]);
      // WhatsApp OTP send to finder phone----------------------------------------
      const payload = {
        to: `91${mobile}`,
        template_name: process.env.WA_TEMPLATE,
        body: [{ type: "text", text: `${otp}` }],
        button: [
          {
            type: "button",
            sub_type: "url", // Ensure it's set as a URL button
            index: 0,
            parameters: [
              {
                type: "text",
                text: `aa`, // Shorten the URL to ≤ 15 characters
              },
            ],
          },
        ],
        meta: {
          action: "Finder Verification",
          type: "OTP",
        },
        otp: otp,
        message: `Your OTP is ${otp} `,
      };

      // Fetch item details
      const itemQuery = `SELECT * FROM items WHERE id = ?`;
      const [itemDetails] = await db.query(itemQuery, [item_id]);

      if (itemDetails.length === 0) {
        return res.status(404).json({ message: "Item not found." });
      }

      const itemName = itemDetails[0].item_name;
      const title = `A missing item has been found.`;
      const message = `Good news! Your item "${itemName}" has been found.`;

      const queryAlert = `
        INSERT INTO notifications (user_id, item_id, title, message) 
        VALUES (?, ?, ?, ?)
      `;
      await db.query(queryAlert, [user_id, item_id, title, message]);

      const encryptedContactOwnerId = encrypt(contactOwnerId.toString());
      const responsewa = await sendWhatsapp(payload);
      return res.status(201).json({
        message: "Verify OTP Sent to your whatsapp no",
        contactOwner: {
          id: encryptedContactOwnerId,
          name,
          email,
          mobile,
          item_id,
          city,
          region_name,
          country_name,
          imageUrl,
          indate,
        },
      });
    } catch (error) {
      console.log("error faild to contact owner", error);

      res
        .status(500)
        .json({ message: `An unexpected error occurred: ${error.message}` });
      throw error;
    }
  });
};

async function handler(req, res) {
  // console.log("wsgsdgsd");

  const isDbConnected = await checkDbConnection();

  if (!isDbConnected) {
    return res.status(500).json({ message: "Database connection failed" });
  }

  return createContactOwner(req, res);
}
export default withMonitorLogger(handler);
