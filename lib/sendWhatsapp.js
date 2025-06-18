import logger from "./logger";

export async function sendWhatsapp(data) {
  const { template_name, to, header, body, button, meta, otp,message } = data;

  const startTime = Date.now();
  const postdata = {
    messaging_product: "whatsapp",
    to: to,
    type: "template",
    template: {
      name: template_name,
      language: { code: "en" },
    },
  };

  if (header) {
    postdata.template.components = postdata.template.components || [];
    postdata.template.components.push({
      type: "header",
      parameters: header,
    });
  }

  if (body) {
    postdata.template.components = postdata.template.components || [];
    postdata.template.components.push({
      type: "body",
      parameters: body,
    });
  }

  if (button) {
    postdata.template.components = postdata.template.components || [];
    button.forEach((btn) => {
      postdata.template.components.push(btn);
    });
  }

  try {
    // console.log(JSON.stringify(postdata));
    const response = await fetch(
      `https://graph.facebook.com/v13.0/${process.env.WAPHONEID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.WATOKEN,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(postdata),
      }
    );

    const responseData = await response.json();

    const duration = Date.now() - startTime;

    // Logging data (success)
    const logData = {
      action: meta?.action ,
      channel: "whatsapp",
      type: meta?.type ,
      message: message || "WhatsApp message sent successfully",
      status: "success",
      duration,
    };

    await fetch(`${process.env.BASE_URL}/api/admin/email-whatsapp-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    }).catch(err => {
      console.error('Logging error:', err);
    });


    return responseData;
  } catch (error) {

    const duration = Date.now() - startTime;

    // Logging data (failed)
    const logData = {
      action: meta?.action || "WhatsApp Failed",
      channel: "whatsapp",
      type: meta?.type || "General",
      message: error.message || "Error sending WhatsApp message",
      status: "failed",
      duration,
    };

    await fetch(`${process.env.BASE_URL}/api/admin/email-whatsapp-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
    }).catch(err => {
      console.error('Logging error:', err);
    });


    logger.error({
      message: "Error sending WhatsApp message",
      stack: error.stack,
      function: "sendWhatsAppMessage",
    });

    throw error;
  }
}
