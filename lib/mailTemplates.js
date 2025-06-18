export const generateEmailForBrand = ({ name, email, password, mobile, imageURL }) => {
    return {
      subject: `Welcome to Our Platform, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
          <h1 style="text-align: center; color: #4CAF50; margin-bottom: 20px;">🎉 Welcome, ${name}!</h1>
          <p style="font-size: 16px; color: #333;">
            Congratulations! Your brand has been successfully registered on our platform. Below are your login credentials and important details:
          </p>
  
          <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h3 style="color: #4CAF50; margin-bottom: 10px;">📌 Brand Details</h3>
            <p style="font-size: 16px; color: #333; margin: 5px 0;">
              <strong>Brand Name:</strong> ${name}
            </p>
            <p style="font-size: 16px; color: #333; margin: 5px 0;">
              <strong>Email:</strong> ${email}
            </p>
            <p style="font-size: 16px; color: #333; margin: 5px 0;">
              <strong>Mobile:</strong> ${mobile}
            </p>
            ${
              imageURL
                ? `<div style="margin-top: 10px; text-align: center;">
                    <img src="${imageURL}" alt="Brand Logo" width="100" style="border-radius: 8px; border: 1px solid #ddd;">
                  </div>`
                : ""
            }
          </div>
  
          <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h3 style="color: #4CAF50; margin-bottom: 10px;">🔐 Your Login Credentials</h3>
            <p style="font-size: 16px; color: #333;">
              <strong>Email:</strong> ${email}
            </p>
            <p style="font-size: 16px; color: #333;">
              <strong>Password:</strong> ${password}
            </p>
            <p style="font-size: 14px; color: #d32f2f; font-style: italic;">
              ⚠️ Please do not share your password with anyone.
            </p>
          </div>
  
          <div style="text-align: center; margin-top: 30px;">
            <a href= ${process.env.BRAND_LOGIN_URL} 
               style="display: inline-block; padding: 12px 25px; color: #fff; background-color: #4CAF50; text-decoration: none; border-radius: 5px; font-size: 16px;">
              🔑 Login Now
            </a>
          </div>
  
          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-top: 30px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Best regards,<br>
            <strong>Your Support Team</strong>
          </p>
  
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #888; text-align: center;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      `,
    };
  };
  