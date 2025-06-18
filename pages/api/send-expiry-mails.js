import dayjs from 'dayjs';
import { db } from 'lib/db';
import sendMail from 'lib/mailService';
import { dateFormat } from 'utils/dateFormat';


export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const today = dayjs().format('YYYY-MM-DD');
        const twoWeeksFromNow = dayjs().add(14, 'day').format('YYYY-MM-DD');

        // Get items that expire within the next 14 days
        const [items] = await db.query(
            `SELECT 
     i.id,
     u.email AS user_email,
     u.full_name AS user_name,
     i.item_name,
     i.image_url,
     q.expiry_date AS expiryDate,
     bm.image AS brand_logo,
     q.qr_code AS qrCode
   FROM items i
   LEFT JOIN users u ON i.user_id = u.id
   LEFT JOIN qr_code q ON i.qr_code_id = q.qr_code
   LEFT JOIN brand_master bm ON q.brand_id = bm.id
   WHERE q.expiry_date BETWEEN ? AND ?`,
            [today, twoWeeksFromNow]
        );



        console.log("items", items);
        for (const item of items) {
            await sendMail({
                to: item.user_email,
                subject: `⚠️ Expiry Alert: ${item.item_name}`,
                html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Protection Expiry Email</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #f0f0f0;">
      <!-- Header Row -->
      <tr style="background-color: #fff7f0;">
        <td style="padding: 10px 20px;">
          <img src="https://qritagya.com/assets/new_qritagya_logo.png" alt="Your Logo" style="height: 40px;" />
        </td>
        <td align="right" style="padding: 10px 20px;">
          <img src=${item.brand_logo} alt="Brand Logo" style="height: 40px;" />
        </td>
      </tr>

      <!-- Subject Row -->
      <tr>
        <td colspan="2" style="padding: 20px; background-color: #fff3e0;">
          <h2 style="color: #e65100; margin: 0;">Your protection is getting expired</h2>
        </td>
      </tr>

      <!-- Greeting Row -->
      <tr>
        <td colspan="2" style="padding: 15px 20px;">
         <p style="margin: 0; font-size: 16px; color: #333;">
  Dear <span style="font-weight: bold; color: #e65100;">${item.user_name}</span>,
</p>

        </td>
      </tr>

      <!-- Message Row -->
      <tr>
        <td colspan="2" style="padding: 10px 20px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">
            This is a reminder that your item's protection has expired.
          </p>
          <p style="margin: 0; font-size: 14px; color: #555;">
            To continue safeguarding your item, please renew your protection today.
          </p>
        </td>
      </tr>

      <!-- CTA Button Row -->
      <tr>
        <td colspan="2" align="center" style="padding: 30px 20px;">
          <a href="https://qritagya.com/dashboard/items/${item.id}" target="_blank"
            style="background-color: #ff6f00; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block;">
            Renew Now →
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr style="background-color: #fff7f0;">
        <td colspan="2" align="center" style="padding: 15px; font-size: 12px; color: #888;">
          &copy; 2025 Qritagya. All rights reserved.
        </td>
      </tr>
    </table>
  </body>
</html>`,
                text: `${item.item_name} is expiring on ${dateFormat(item.expiryDate)}`,
                meta: {
                    action: 'Expiry Alert',
                    type: 'item-expiry'
                }
            });



        }

        return res.status(200).json({ message: 'Emails sent successfully', data: items });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}
