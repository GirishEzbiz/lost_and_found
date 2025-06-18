import { withMonitorLogger } from "utils/withMonitorLogger";
import { streamDB } from "../../../lib/dbStream";
import { format } from "@fast-csv/format";

 function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }




    try {
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="user_registrations.csv"`
        );
        res.setHeader("Content-Type", "text/csv");

        const csvStream = format({
            headers: ["name", "email", "mobile", "registration_date"],
        });
        csvStream.pipe(res);

        const qrStream = streamDB
            .query(
                `SELECT DISTINCT users.id, users.full_name, users.email, users.mobile, users.status,users.created_at FROM users
       INNER JOIN items ON users.id = items.user_id
       INNER JOIN qr_code ON items.qr_code_id = qr_code.qr_code
       INNER JOIN code_mining ON qr_code.template_id = code_mining.id
   ORDER BY users.id DESC`,

            )
            .stream();


        qrStream.on("data", (row) => {
            csvStream.write({
                name: row.full_name,
                email: row.email,
                mobile: row.mobile,
                registration_date: row.created_at,
            });
        });

        qrStream.on("end", () => {
            csvStream.end();
        });

        qrStream.on("error", (streamErr) => {
            console.error("QR Stream Error:", streamErr);
            res.status(500).end("Streaming Error");
        });
    } catch (err) {
        console.error("CSV Download Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
        throw err
    }
}
export default withMonitorLogger(handler)