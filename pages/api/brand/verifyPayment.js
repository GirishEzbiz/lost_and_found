import crypto from "crypto";
import { db } from "lib/db";
import logger from "lib/logger";

import sendMail from "lib/mailService";
import { withMonitorLogger } from "utils/withMonitorLogger";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const {
      paymentId,
      orderId,
      signature,
      // batchId,
      years,
      grandTotal,
      brand_id,
      from,
      to,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature === signature) {
      // ✅ Fetch QR Codes
      const qrCodes = await getQRCodesByBatchId(brand_id, from, to);

      // ✅ Extend Expiry Dates
      // ✅ CORRECT:
      await extendExpiryDates(from, to, years);


      const payer_type = "brand";
      const payment_method = "online";
      const status = "completed";

      if (
        !payer_type ||
        !brand_id ||
        !grandTotal ||
        !payment_method ||
        !status
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      await db.query(
        `INSERT INTO payments (payer_type, payer_id, amount, txn_id,payment_method, status) 
         VALUES (?, ?, ?,?, ?, ?)`,
        [payer_type, brand_id, grandTotal, paymentId, payment_method, status]
      );

      // ✅ Send Email Notification
      if (qrCodes.length > 0) {
        const BrandEmail = qrCodes[0].brand_email;
        // console.log("Brand Email:", BrandEmail);

        if (BrandEmail) {
          await sendPaymentSuccessEmail(BrandEmail, paymentId, grandTotal);
        } else {
          // console.error("Brand email is missing.");
        }
      }

      return res.status(200).json({ message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  } catch (error) {
    logger.error({
      message: "Payment verification error",
      stack: error.stack,
      function: "paymentVerificationHandler", // Replace with the actual function name
    });
    res.status(500).json({ message: "Internal Server Error" });
    throw error
  }
}

async function getQRCodesByBatchId(brand_id, from, to) {
  const query = `
        SELECT 
          qr_code.id,
          qr_code.serial_number,
          brand_master.name AS brand_name,
          brand_master.id AS brand_id,
          brand_master.email AS brand_email,
          sku_master.name AS sku_name,
          qr_code.expiry_date,
          qr_code.qr_code,
          qr_code.status,
          qr_code.is_activated,
          qr_code.is_lost,
          qr_code.is_found,
          qr_code.is_recovered,
          qr_code.created_at,
          qr_code.registration_date,
          qr_code.template_id,
          users.mobile as user_mobile, users.email as user_email,
          items.item_name
        FROM qr_code
        LEFT JOIN code_mining ON qr_code.template_id = code_mining.id
        LEFT JOIN brand_master ON code_mining.brand_id = brand_master.id
        LEFT JOIN items ON qr_code.qr_code = items.qr_code_id
        LEFT JOIN users ON items.user_id = users.id
        LEFT JOIN sku_master ON code_mining.sku_id = sku_master.id
         WHERE qr_code.brand_id = ?
    AND qr_code.serial_number BETWEEN ? AND ?
      `;

  const [result] = await db.query(query, [brand_id, from, to]);
  return result;
}

async function extendExpiryDates(from, to, years) {
  const numYears = parseInt(years);
  if (isNaN(numYears)) {
    throw new Error(`Invalid number of years: ${years}`);
  }

  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setFullYear(futureDate.getFullYear() + numYears);

  const formattedExpiry = futureDate.toISOString().slice(0, 19).replace("T", " ");

  const updateQuery = `
  UPDATE qr_code 
  SET expiry_date = ? 
  WHERE serial_number BETWEEN ? AND ?
    AND status = 1
    AND expiry_date <= CURDATE() + INTERVAL 14 DAY
`;


  const [result] = await db.query(updateQuery, [
    formattedExpiry,
    from,
    to,
  ]);

  // console.log(`✅ Updated ${result.affectedRows} QR codes from ${from} to ${to}`);
}



// ✅ Function to send email using sendMail service
async function sendPaymentSuccessEmail(toEmail, paymentId, grandTotal) {
  if (!toEmail) {
    console.error("No email provided, skipping email notification.");
    return;
  }

  const emailResponse = await sendMail({
    to: toEmail,
    subject: "Payment Successful",
    text: `Your payment has been successfully processed. Payment ID: ${paymentId}, Amount Paid: ₹${grandTotal}`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          background: #4CAF50;
          color: white;
          padding: 10px;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 20px;
          text-align: left;
          font-size: 16px;
          color: #333;
        }
        .content p {
          margin: 10px 0;
          line-height: 1.6;
        }
        .footer {
          text-align: center;
          padding: 15px;
          font-size: 14px;
          color: #777;
        }
        .button {
          display: inline-block;
          padding: 10px 15px;
          margin-top: 10px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          font-size: 16px;
          border-radius: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Payment Confirmation</h2>
        </div>
        <div class="content">
          <p>Dear Customer,</p>
          <p>Your payment has been successfully processed.</p>
          <p><strong>Payment ID:</strong> ${paymentId}</p>
          <p><strong>Amount Paid:</strong> ₹${grandTotal}</p>
          <p>Thank you for your purchase! If you have any questions, feel free to contact us.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your Company Name. All Rights Reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
    meta: {
      action: "Payment Success",
      type: "Payment Confirmation",
    }
  });
  if (!emailResponse.success) {
    console.error("Email sending failed:", emailResponse.message);
  } else {
    console.log(`Payment success email sent to ${toEmail}`);
  }
}
export default withMonitorLogger(handler)