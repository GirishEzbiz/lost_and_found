export const emailOtpTemplate = async (name, otp, language = "en") => {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

  // ✅ Fixed Helper: Properly handles Google Translate API format
  const translateText = async (text, targetLang) => {
    if (!text || targetLang === "en") return text;

    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({ q: [text], target: targetLang }),
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      return data?.data?.translations?.[0]?.translatedText || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text; // fallback if error
    }
  };

  // ✅ Translations
  const translatedSubject = await translateText("Your Qritagya Verification Code", language);
  const heading = await translateText("Use This Code to Continue", language);
  const subheading = await translateText("Use the OTP below to continue your secure session.", language);
  const validityText = await translateText("This code is valid for 10 minutes.", language);
  const disclaimer = await translateText("Never share this code with anyone.", language);
  const helpTitle = await translateText("Need Help?", language);
  const helpLine = await translateText("Reach us at", language);
  const copyright = await translateText("© 2025 Qritagya. All rights reserved.", language);

  // ✅ Return Template
  return {
    subject: translatedSubject,
    html: `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${translatedSubject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: 'Roboto', sans-serif; font-size: 14px; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%; background-color: transparent;">
      <tr>
        <td></td>
        <td align="center" style="max-width: 600px; margin: 0 auto;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; padding: 30px; border-radius: 7px; box-shadow: 0 3px 15px rgba(30,32,37,0.06);">
              <tr>
                <td style="text-align: center; padding-bottom: 20px;">
                  <img src="https://qritagya.com/assets/new_qritagya_logo.png" alt="Qritagya Logo" style="width: 110px; height: auto;" />
                </td>
              </tr>
              <tr>
                <td style="text-align: center; font-size: 24px; font-weight: 500; padding-bottom: 10px;">
                  ${heading}
                </td>
              </tr>
              <tr>
                <td style="text-align: center; color: #878a99; font-size: 15px; padding-bottom: 20px;">
                  ${subheading}
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding: 20px 0;">
                  <div style="font-size: 30px; font-weight: 600; color: #405189; letter-spacing: 5px;">
                    ${otp}
                  </div>
                  <p style="color: #878a99; margin-top: 10px;">${validityText}</p>
                </td>
              </tr>
              <tr>
                <td style="text-align: center; padding-top: 20px;">
                  <p style="font-size: 14px; color: #666; margin: 0;">${disclaimer}</p>
                </td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 25px;">
              <h4 style="font-weight: 500; margin-bottom: 5px;">${helpTitle}</h4>
              <p style="color: #878a99; font-size: 14px; margin: 0;">
                ${helpLine}
                <a href="mailto:info@qritagya.com" style="font-weight: 500; color: #405189;"> info@qritagya.com</a>
              </p>
              <p style="font-size: 13px; color: #98a6ad; margin: 5px 0 0;">
                ${copyright}
              </p>
            </div>
          </div>
        </td>
        <td></td>
      </tr>
    </table>
  </body>
</html>
    `,
  };
};
