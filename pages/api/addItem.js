import formidable from "formidable";
import { db } from "../../lib/db";
import { authenticate } from "../../lib/auth";
import { uploadToS3 } from "lib/s3";
import sendMail from "lib/mailService";
import { withMonitorLogger } from "utils/withMonitorLogger";

// Disable Next.js built-in body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === "POST") {
    const { id } = authenticate(req, res); // Authenticate user and get ID
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(500).json({ error: "Failed to parse form data." });
      }

      const {
        itemName,

        category_id,
        categoryMsg, // ✅ Category ID received
        description,
        latitude,
        longitude,
        qrCode,
      } = fields;




      const image = files.image;

      if (
        !itemName ||
        !category_id ||
        !description ||
        !qrCode ||
        !image ||
        !id
      ) {
        return res.status(400).json({ error: "Missing required fields." });
      }

      try {

        let [category] = await db.query(`SELECT ic.name FROM item_category ic WHERE ic.id = ?`, [category_id])

        console.log("category data", category)

        let [brand] = await db.query(
          `SELECT bm.image AS brand_logo, bm.name AS brand_name
   FROM qr_code
   LEFT JOIN brand_master bm ON qr_code.brand_id = bm.id
   WHERE qr_code.qr_code = ?`,
          [qrCode]
        );


        console.log("brand data", brand)
        // Upload image to S3
        const imageURL = await uploadToS3(image);

        // Insert item details into the database
        const query = `
      INSERT INTO items (item_name, qr_code_id, category_id, message, description, latitude, longitude, image_url, user_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [
          itemName,
          qrCode,
          category_id, // ✅ Store category ID
          categoryMsg,
          description,
          latitude || "NA",
          longitude || "NA",
          imageURL,
          id,
        ]);

        const user_id = id;
        const item_id = result.insertId;
        const title = `An item has been added.`;
        const message = `Exciting update! Your item "${itemName}" has been successfully added. Please check your email or WhatsApp for more details.`;

        const queryALert = `INSERT INTO notifications (user_id, item_id,title, message) VALUES (?, ?, ?, ?)`;

        const alerts = await db.query(queryALert, [
          user_id,
          item_id,
          title,
          message,
        ]);

        const isActivated = 1; // Set to 1 (activated)
        const registrationDate = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", " "); // Current timestamp (YYYY-MM-DD HH:MM:SS)

        const qrUpdateQuery = `UPDATE qr_code SET is_activated = ?, registration_date = ? WHERE qr_code = ?`;

        await db.query(qrUpdateQuery, [isActivated, registrationDate, qrCode]);

        const quer = "SELECT * FROM users WHERE id = ? ";
        const [rows] = await db.query(quer, [id]);
        const user = rows[0];

        const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard/items`;

        const htmlTemplate = `

        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Item Added</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #eee; border-radius: 8px;">
            <!-- Heading Row -->
            

            <!-- Logo and Brand Image Row -->
            <tr>
              <td style="padding: 20px;">
                <table width="100%">
                  <tr>
                    <td align="left" width="50%">
                      <img src="https://qritagya.com/assets/new_qritagya_logo.png" alt="Logo" style="max-width: 100px;" />
                    </td>
                    <td align="right" width="50%">
                      <img src="${brand[0].brand_logo}" alt="Brand" style="max-width: 100px;" />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Success Message + Button Row -->
            <tr>
              <td style="padding: 0 20px 10px;">
                <table width="100%">
  <tr>
    <td align="center" style="font-size: 18px; color: black; font-weight: bold;">
      Your Item is Successfully Added!
    </td>
  </tr>
</table>

              </td>
            </tr>

            <!-- Greeting Row -->
            <tr>
              <td align="left" style="padding: 0 20px 5px;">
                <p style="font-size: 16px; margin: 0;">Dear <strong style="color: #FFA726;">${user.full_name}</strong>,</p>
              </td>
            </tr>

            <!-- Message Content Row -->
            <tr>
              <td align="left" style="padding: 0 20px 20px;">
                <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0;">
                  We are pleased to inform you that your item has been successfully added to your profile. <br />
                  You can now track and manage your item securely.
                </p>
              </td>
            </tr>

            <!-- Item Details Heading -->
            <tr>
              <td style="background-color: #f6f6f6; padding: 10px 20px;">
                <h4 style="margin: 0; color: #333333;">Item Details</h4>
              </td>
            </tr>

            <!-- Item Image and Info Row -->
            <!-- Item Image and Info Row -->
<tr>
  <td style="padding: 20px;">
    <table width="100%">
      <tr>
        <td width="50%" valign="top">
          <img src="${imageURL}" alt="Item" style="max-width: 100%; border-radius: 8px; border: 1px solid #ccc;" />
        </td>
        <td width="50%" valign="top" style="padding-left: 20px; font-size: 14px; color: #333;">
          <p style="margin: 0 0 8px 0; font-size: 18px; color: #333;">${itemName}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #999999;">
            Category:
            <span style="color: #666666; font-style: italic;"> ${category[0].name}</span>
          </p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #555;">${description}</p>
          <p style="  margin-top: 20px;">
            <a href="${dashboardUrl}" style="background-color: #FFA726; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">View Details →</a>
          </p>

          <!-- Button aligned to right within this column -->
          
        </td>
      </tr>
    </table>
  </td>
</tr>


            <!-- Steps Heading -->
           

            <!-- Step Text Row Only -->
 <tr>
  <td style="padding: 20px;">
    <p style="font-size: 14px; color: #555555; margin: 0 0 8px 0;">
      To ensure your item is easily identified and protected, please follow the setup instructions 
    </p>
    <a href="https://qritagya.com/followthesteps" style="font-size: 14px; color: #FFA726; text-decoration: underline; font-weight: normal;">
      Follow the steps →
    </a>
  </td>
</tr>



            <!-- Footer -->
            <tr>
              <td align="center" style="background-color: #f1f1f1; padding: 15px; font-size: 12px; color: #888;">
                &copy; 2025 Qritigya. All rights reserved.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
        `;

        // Send OTP via email (assuming a mailService is available)
        const mailResponse = await sendMail({
          to: user.email,
          subject: "✅ Item  Successfully Added!",
          text: `Your item ${itemName} has been successfully added to our system. You can manage it anytime from your dashboard.`,
          html: htmlTemplate,
          meta: {
            action: "Item Added",
            type: "Aknowledgment",
          },
        });

        if (!mailResponse.success) {
          throw new Error(mailResponse.message);
        }

        return res.status(201).json({
          message: "Item added successfully",
          itemId: result.insertId,
        });
      } catch (error) {
        console.error("error adding item", error);
        res.status(500).json({ message: "Error adding item" });
        throw error
      }
    });
  } else {
    // Handle unsupported methods
    return res.status(405).json({ error: "Method not allowed" });
  }
};

export default withMonitorLogger(handler)
