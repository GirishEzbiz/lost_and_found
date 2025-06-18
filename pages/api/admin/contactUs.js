import { withMonitorLogger } from "utils/withMonitorLogger";
import { db } from "../../../lib/db";

const createContactSubmission = async (req, res) => {
  try {
    const { name, submission_date, no_of_assets, organization, mobile } =
      req.body;

    // Validation
    if (
      !name ||
      !submission_date ||
      !no_of_assets ||
      !organization ||
      !mobile
    ) {
      return res.status(400).json({
        code: "ERR_MISSING_FIELDS",
        message:
          "Missing required fields. Please provide name, submission_date, no_of_assets, organization, and mobile.",
      });
    }

    const indate = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [result] = await db.query(
      `INSERT INTO contact_submissions 
       (name, submission_date, no_of_assets, organization, mobile)
       VALUES (?, ?, ?, ?, ?)`,
      [name, submission_date, no_of_assets, organization, mobile]
    );

    return res.status(201).json({
      code: "SUCCESS_CONTACT_SUBMITTED",
      message: "Contact submission saved successfully",
      contactId: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error inserting contact submission:", error);

     res.status(500).json({
      code: "ERR_DATABASE",
      message: "Database error while saving contact submission.",
      details: error.message,
    });
    throw error
  }
};

export default withMonitorLogger(createContactSubmission)