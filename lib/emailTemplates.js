// export const generateContactOwnerEmail = async (
//   itemOwnerName,
//   itemName,
//   itemDetails,
//   finderDetails,
//   googleMapsUrl = "",
//   imageUrl = "",
//   language = "en"
// ) => {

//   console.log("language", language)
//   const { name, email, mobile, city, region_name, country_name } = finderDetails;

//   const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

//   // Helper function to translate text
//   const translateText = async (text, targetLang) => {
//     if (!text || targetLang === "en") return text; // No translation if targetLang is English

//     try {
//       const response = await fetch(
//         `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
//         {
//           method: "POST",
//           body: JSON.stringify({ q: text, target: targetLang }),
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       const data = await response.json();
//       return data.data.translations[0].translatedText;
//     } catch (error) {
//       console.error("Translation error:", error);
//       return text; // fallback if error occurs
//     }
//   };

//   // Translate the strings
//   const translatedHeading = await translateText(" Great News! Your Item Has Been Found", language);
//   const translatedMessage = await translateText("We are delighted to inform you that your item", language);
//   const translatedMessage2 = await translateText("has been located! Below are the details you need to know:", language);
//   const translatedItemDetail = await translateText("Item Details", language);
//   const translatedItemName = await translateText("Item Name", language);
//   const translatedFinderInfo = await translateText("Finder's Information", language);
//   const translatedName = await translateText("Name", language);
//   const translatedEmail = await translateText("Email", language);
//   const translatedMobile = await translateText("Mobile", language);
//   const translatedCity = await translateText("City", language);
//   const translatedRegion = await translateText("Region", language);
//   const translatedCountry = await translateText("Country", language);

//   // Return the email object
//   return {
//     subject: translatedSubject,
//     html: `
//      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Albert Sans', Arial, sans-serif;">
//   <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 0; margin: 0;">
//     <tr>
//       <td align="center">
//         <table width="600" cellpadding="0" cellspacing="0"   border-radius: 10px;">
//   <!-- Header -->
//   <tr>
//     <td style="padding: 20px 30px;">
//       <table width="100%" cellpadding="0" cellspacing="0">
//         <tr>
//           <!-- Left Text -->
//           <td style="font-size: 14px; font-weight: bold; color: #333;">
//            ${translatedHeading}
//           </td>
//           <!-- Right Logo with space -->
//           <td align="right" style="padding-left: 20px;">
//             <img src="https://qritagya.com/assets/new_qritagya_logo.png" alt="Qritagya Logo" style="width: 110px; height: auto;" />
//           </td>
//         </tr>
//       </table>
//     </td>
//   </tr>
// </table>

//             </td>
//           </tr>

//           <!-- Greeting -->
//           <tr>
//             <td style="padding: 0 30px 20px;">
//               <h2 style="color: #222; font-size: 18px; margin: 0;">Dear ${itemOwnerName},</h2>
//               <p style="font-size: 15px; color: #444; line-height: 1.6;">
//                 We are delighted to inform you that your item "<strong>${itemName}</strong>" has been located! Below are the details you need to know:
//               </p>
//             </td>
//           </tr>

//           <!-- Image + Item Info -->
//           <tr>
//             <td style="padding: 0 30px 25px;">
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td width="140" valign="top">
//                     <img src="${imageUrl}" alt="${itemName}" style="width: 130px; height: 130px; border-radius: 10px; object-fit: cover; border: 1px solid #ddd;" />
//                   </td>
//                   <td valign="top" align="right" style="padding-left: 15px;">
//                     <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1f2937;">${itemName}</p>
//                     <p style="margin-top: 12px; font-size: 15px; color: #4b5563; line-height: 1.6;">
//                       ${translatedMessage}
//                     </p>
//                   </td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Buttons -->
//           <tr>
//             <td style="text-align: center; padding: 20px;">
//               ${
//                 mobile
//                   ? `<a href="tel:${mobile}" style="display: inline-block; margin: 10px; padding: 12px 24px; background-color: #ffbf00; color: #000; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 6px;">Contact Finder</a>`
//                   : ""
//               }
//               ${
//                 googleMapsUrl
//                   ? `<a href="${googleMapsUrl}" target="_blank" style="display: inline-block; margin: 10px; padding: 12px 24px; background-color: #5b7c99; color: #fff; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 6px;">View on Map</a>`
//                   : ""
//               }
//             </td>
//           </tr>

//           <!-- Finder Details -->
//           <tr>
//             <td style="padding: 0 30px 15px;">
//               <table width="100%" cellpadding="0" cellspacing="0"  ">
//                 <tr>
//                   <td style="font-size: 20px; font-weight: bold; color: #222; padding-bottom: 10px;">Finder Details</td>
//                 </tr>
//                 <tr>
//                   <td style="padding-bottom: 5px;">${
//                     name || "Not Provided"
//                   }</td>
//                 </tr>
//                 <tr>
//                   <td>${mobile || "Not Provided"}</td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Location Details -->
//           <tr>
//             <td style="padding: 0 30px 30px;">
//               <table width="100%" cellpadding="0" cellspacing="0" ">
//                 <tr>
//                   <td style="font-size: 16px; font-weight: bold; color: #222; padding-bottom: 10px;">Location Details</td>
//                 </tr>
//                 <tr>
//                   <td style="padding-bottom: 5px;">${
//                     city || "Not Provided"
//                   }</td>
//                 </tr>
//                 <tr>
//                   <td>${country_name || "Not Provided"}</td>
//                 </tr>
//               </table>
//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td style="background-color: #1a1a1a; color: #ccc; text-align: center; padding: 30px 20px; font-size: 12px; line-height: 1.6;">
//               <p style="margin: 0 0 15px;">
//                 Please follow the instructions to retrieve your item. <br />
//                 If you need assistance, feel free to contact our support team.
//               </p>
//               <p style="margin: 0 0 15px;">
//                 Best regards,<br />
//                 <strong style="color: #eee;">Your Support Team</strong>
//               </p>
//               <p style="margin: 0; font-size: 11px; color: #999;">
//                 This is an automated message. Please do not reply directly to this email.
//               </p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>
// </body>
//     `,
//   };
// };

export const generateContactOwnerEmail = async (
  itemOwnerName,
  itemName,
  itemDetails,
  finderDetails,
  googleMapsUrl = "",
  imageUrl = "",
  language = "en",
  message
) => {
  const { name, email, mobile, city, region_name, country_name } =
    finderDetails;
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY;
  const translateText = async (text, targetLang) => {
    if (!text || targetLang === "en") return text;
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          method: "POST",
          body: JSON.stringify({ q: text, target: targetLang }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };

  // Translate content
  const translatedSubject = await translateText(
    "Your Item Has Been Found!",
    language
  );
  const translatedHeading = await translateText(
    "Great News! Your Item Has Been Found",
    language
  );
  const translatedMessage = await translateText(
    "We are delighted to inform you that your item",
    language
  );
  const translatedMessage2 = await translateText(
    "has been located! Below are the details you need to know:",
    language
  );
  const translatedItemName = await translateText("Item Name", language);
  const translatedFinderInfo = await translateText(
    "Finder's Information",
    language
  );
  const translatedLocationDetails = await translateText(
    "Location Details",
    language
  );
  const translatedContactFinder = await translateText(
    "Contact Finder",
    language
  );
  const translatedViewOnMap = await translateText("View on Map", language);
  const tranlatedFooter = await translateText(
    ` Please follow the instructions to retrieve your item. ${(<br />)}
                      If you need assistance, feel free to contact our support team.`,
    language
  );
  const translatedFooter2 = await translateText("Your Support Team" , language);
  const translatedFooter3 = await translateText(" This is an automated message. Please do not reply directly to this email.", language);
  const translatedFooter4 = await translateText("Item Best regards", language);
  return {
    subject: translatedSubject,
    html: `
      <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Albert Sans', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
                    <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #fff;  ">
                <!-- Header -->
                <tr>
                  <td style="padding: 20px 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size: 14px; font-weight: bold; color: #333;">
                          ${translatedHeading}
                        </td>
                        <td align="right" style="padding-left: 20px;">
                          <img src="https://qritagya.com/assets/new_qritagya_logo.png" alt="Qritagya Logo" style="width: 110px; height: auto;" />
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
        <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #fff;  ">
                <!-- Header -->
               <!-- Image + Item Info --

                <!-- Greeting -->
                <tr>
                  <td style="padding: 0 30px 20px;">
                    <h2 style="color: #222; font-size: 18px; margin: 0;">Dear ${itemOwnerName},</h2>
                    <p style="font-size: 15px; color: #444; line-height: 1.6;">
                      ${translatedMessage} "<strong>${itemName}</strong>" ${translatedMessage2}
                    </p>
                  </td>
                </tr>

                <!-- Image + Item Info -->
                <tr>
  <td style="padding: 0 30px 25px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <!-- Left side: Image -->
        <td width="140" valign="top">
          <img src="${imageUrl}" alt="${itemName}" style="width: 130px; height: 130px; border-radius: 10px; object-fit: cover; border: 1px solid #ddd;" />
        </td>

        <!-- Right side: Item name + custom message -->
        <td valign="top" align="left" style="padding-left: 15px;">
          <p style="margin: 0; font-size: 20px; font-weight: bold; color: #1f2937;">${itemName}</p>
          <p style="margin-top: 10px; font-size: 15px; color: #4b5563; line-height: 1.6;">${message}</p>
        </td>
      </tr>
    </table>
  </td>
</tr>


                <!-- Buttons -->
                <tr>
                  <td style="text-align: center; padding: 20px;">
                    ${
                      mobile
                        ? `<a href="tel:${mobile}" style="display: inline-block; margin: 10px; padding: 12px 24px; background-color: #ffbf00; color: #000; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 6px;">${translatedContactFinder}</a>`
                        : ""
                    }
                    ${
                      googleMapsUrl
                        ? `<a href="${googleMapsUrl}" target="_blank" style="display: inline-block; margin: 10px; padding: 12px 24px; background-color: #5b7c99; color: #fff; font-weight: bold; font-size: 14px; text-decoration: none; border-radius: 6px;">${translatedViewOnMap}</a>`
                        : ""
                    }
                  </td>
                </tr>

                <!-- Finder Details -->
                <tr>
                  <td style="padding: 0 30px 15px;">
                    <table width="100%">
                      <tr>
                        <td style="font-size: 20px; font-weight: bold; color: #222; padding-bottom: 10px;">${translatedFinderInfo}</td>
                      </tr>
                      <tr><td style="padding-bottom: 5px;">${
                        name || "Not Provided"
                      }</td></tr>
                      <tr><td>${mobile || "Not Provided"}</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Location Details -->
                <tr>
                  <td style="padding: 0 30px 30px;">
                    <table width="100%">
                      <tr>
                        <td style="font-size: 16px; font-weight: bold; color: #222; padding-bottom: 10px;">${translatedLocationDetails}</td>
                      </tr>
                      <tr><td style="padding-bottom: 5px;">${
                        city || "Not Provided"
                      }</td></tr>
                      <tr><td>${country_name || "Not Provided"}</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #1a1a1a; color: #ccc; text-align: center; padding: 30px 20px; font-size: 12px; line-height: 1.6;">
                    <p style="margin: 0 0 15px;">
                     ${tranlatedFooter}
                    </p>
                    <p style="margin: 0 0 15px;">
                       ${translatedFooter4}
                      <strong style="color: #eee;">${translatedFooter2}</strong>
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #999;">
                      ${translatedFooter3}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    `,
  };
};
