import { db } from "lib/db";
import { generateContactOwnerEmail } from "lib/emailTemplates";
import { decrypt } from "lib/encryption";
import logger from "lib/logger";
import sendMail from "lib/mailService";
import { sendWhatsapp } from "lib/sendWhatsapp";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { ref, otp, unique_user_id } = req.body;

    if (!ref || !otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid input: ref and otp are required",
      });
    }

    let decryptedId;
    try {
      decryptedId = decrypt(ref);
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid ref value" });
    }

    const [rows] = await db.query(
      "SELECT * FROM tbl_finder WHERE id = ? AND lnf_otp = ? LIMIT 1",
      [decryptedId, otp]
    );

    if (rows.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid or expired OTP" });
    }

    const [itemDetails] = await db.query("SELECT * FROM items WHERE id = ?", [
      rows[0].item_id,
    ]);

    if (itemDetails.length === 0) {
      return res.status(404).json({ message: "Item not found." });
    }

    const itemName = itemDetails[0].item_name;
    const user_id = itemDetails[0].user_id;
    const item_id = itemDetails[0].id;

    await db.query(
      `INSERT INTO notifications (user_id, item_id, title, message) VALUES (?, ?, ?, ?)`,
      [
        user_id,
        item_id,
        "A missing item has been found.",
        `Good news! Your item "${itemName}" has been found. Please check your email or WhatsApp for details about the finder.`,
      ]
    );

    const [lostResult] = await db.query(
      `SELECT COUNT(*) AS lost_count FROM qr_code_history 
       WHERE qr_code_id = ? AND status_type = 'lost' 
       AND change_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)`,
      [itemDetails[0].qr_code_id]
    );

    if (lostResult[0].lost_count === 0) {
      await db.query(
        `INSERT INTO qr_code_history (qr_code_id, status_type, status_value, change_date) 
         VALUES (?, 'lost', 1, NOW())`,
        [itemDetails[0].qr_code_id]
      );
    }

    await db.query(
      `UPDATE qr_code SET is_found = ?, is_lost = ?, found_date = NOW() WHERE qr_code = ?`,
      [1, 1, itemDetails[0].qr_code_id]
    );

    await db.query(
      `INSERT INTO qr_code_history (qr_code_id, status_type, status_value, change_date) 
       VALUES (?, 'found', 1, NOW())`,
      [itemDetails[0].qr_code_id]
    );

    // --- Prepare delivery status flags
    let emailStatus = 0;
    let emailTime = null;
    let whatsappStatus = 0;
    let whatsappTime = null;
    let finderWhatsappStatus = 0;

    const [ownerResult] = await db.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);

    let googleMapsUrl = `https://www.google.com/maps?q=${rows[0].latitude},${rows[0].longitude}`;

    if (ownerResult.length > 0) {
      const owner = ownerResult[0];
      const itemOwnerName = owner.full_name;

      const emailContent = await generateContactOwnerEmail(
        itemOwnerName,
        itemName,
        itemDetails[0],
        {
          name: rows[0].name,
          email: "na",
          mobile: rows[0].mobile,
          city: rows[0].city,
          region_name: rows[0].region_name,
          country_name: rows[0].region_name,
        },
        googleMapsUrl,
        rows[0].image,
        owner.language,
        rows[0].message
      );

      const allEmails = [
        owner.email,
        owner.email_1,
        owner.email_2,
        owner.email_3,
      ].filter((e) => e && e !== "na");

      if (allEmails.length > 0) {
        const mailResponse = await sendMail({
          to: allEmails.join(","),
          subject: emailContent.subject,
          html: emailContent.html,
          meta: {
            action: "Contact Owner",
            type: "Contact Owner",
          },
        });

        if (mailResponse?.success) {
          emailStatus = 1;
          emailTime = new Date();
        }
      }

      const allMobiles = [
        owner.mobile,
        owner.mobile_1,
        owner.mobile_2,
        owner.mobile_3,
      ].filter((m) => m && m !== "na");

      if (allMobiles.length > 0) {
        whatsappStatus = 1;
        whatsappTime = new Date();

        for (const mobile of allMobiles) {
          const payloadWhatsapp = {
            template_name: "lnf_item_found_v1",
            to: mobile,
            header: [{ type: "image", image: { link: rows[0].image } }],
            body: [
              {
                type: "text",
                text: itemOwnerName,
                parameter_name: "customer_name",
              },
              { type: "text", text: itemName, parameter_name: "item_name" },
              {
                type: "text",
                text: rows[0].name,
                parameter_name: "finder_name",
              },
              { type: "text", text: "N/A", parameter_name: "finder_email" },
              {
                type: "text",
                text: rows[0].mobile,
                parameter_name: "finder_mobile",
              },
              {
                type: "text",
                text: rows[0].city,
                parameter_name: "finder_city",
              },
              {
                type: "text",
                text: rows[0].region_name,
                parameter_name: "finder_region",
              },
              {
                type: "text",
                text: rows[0].country_name,
                parameter_name: "finder_country",
              },
            ],
            button: [
              {
                type: "button",
                sub_type: "url",
                index: 0,
                parameters: [
                  {
                    type: "text",
                    text: `${rows[0].latitude},${rows[0].longitude}`,
                  },
                ],
              },
            ],
            meta: {
              action: "Notified Owner",
              type: "Contact Owner",
            },
            message: `Good news! Your item "${itemName}" has been found. Please check your email or WhatsApp for details about the finder.`,
          };

          try {
            await sendWhatsapp(payloadWhatsapp);
          } catch (err) {
            console.error(`❌ WhatsApp to ${mobile} failed:`, err.message);
          }
        }
      }

      // --- Send THANK YOU to finder
      const thankYouPayload = {
        template_name: "lnf_founder_thanks",
        to: rows[0].mobile,
        body: [
          { type: "text", text: rows[0].name, parameter_name: "name" },
          { type: "text", text: itemName, parameter_name: "item_name" },
        ],
        meta: {
          action: "Finder Thanks",
          type: "Finder Thanks",
        },
        message: `Thank you for reporting the found item "${itemName}".`,
      };

      try {
        await sendWhatsapp(thankYouPayload);
        finderWhatsappStatus = 1;
      } catch (error) {
        console.error(`❌ Error sending thank-you to finder:`, error.message);
      }
    }

    // --- Update qr_scans
    if (unique_user_id) {
      try {
        await db.query(
          `UPDATE qr_scans SET 
            owner_email_status = ?, 
            owner_email_time = ?, 
            owner_whatsapp_status = ?, 
            owner_whatsapp_time = ?, 
            finder_whatsapp_status = ?
          WHERE unique_user_id = ?`,
          [
            emailStatus,
            emailTime,
            whatsappStatus,
            whatsappTime,
            finderWhatsappStatus,
            unique_user_id,
          ]
        );
      } catch (err) {
        console.error("❌ Failed to update qr_scans:", err.message);
      }
    }

    return res.status(200).json({
      success: true,
      mapurl: googleMapsUrl,
      message: "OTP verified successfully!",
      data: rows[0],
    });
  } catch (error) {
    logger.error({
      message: "Error Verify OTP",
      stack: error.stack,
      function: "verifyOtpHandler",
    });
    return res
      .status(500)
      .json({ success: false, error: "An internal server error occurred" });
  }
}

export default withMonitorLogger(handler);
