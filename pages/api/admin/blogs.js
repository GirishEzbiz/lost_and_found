import { checkDbConnection, db } from "lib/db";
import formidable from "formidable";

import { uploadToS3 } from "lib/s3";
import { withMonitorLogger } from "utils/withMonitorLogger";
// Disable Next.js default body parsing
export const config = {
    api: {
        bodyParser: false,
    },
};


const parseForm = (req) => {
    const form = formidable({ multiples: false });

    return new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
        });
    });
};

const getBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const offset = (page - 1) * limit;


        const searchQuery = search
            ? `WHERE title LIKE ? OR content LIKE ?`
            : "";
        const searchParams = search
            ? [`%${search}%`, `%${search}%`]
            : [];

        // Get total count
        const [countRows] = await db.query(
            `SELECT COUNT(*) as total FROM articles ${searchQuery}`,
            searchParams
        );
        const total = countRows[0].total;

        // Get paginated blogs
        const [rows] = await db.query(
            `SELECT * FROM articles ${searchQuery} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
            [...searchParams, Number(limit), Number(offset)]
        );

        return res.status(200).json({ data: rows, total });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Error fetching blogs" });
        throw error
    }
};

const addBlogs = async (req, res) => {
    try {
        const { fields, files } = await parseForm(req);

        console.log("fields =>", fields);
        console.log("files =>", files);


        const {
            title,
            slug,
            meta_description,
            meta_keywords,
            content,
            category,
            tags,
            seo_title,
            seo_description,
            seo_keywords,
            status,
            is_featured,
            is_active,
        } = fields;

        const image = files.image;

        const imageURL = await uploadToS3(image); // Get S3 URL


        const [result] = await db.query(
            `INSERT INTO articles 
        (title, slug, meta_description, meta_keywords, content, category, tags,
        seo_title, seo_description, seo_keywords, status, is_featured, is_active, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title,
                slug,
                meta_description,
                meta_keywords,
                content,
                category,
                tags,
                seo_title,
                seo_description,
                seo_keywords,
                status,
                Number(is_featured),
                Number(is_active),
                imageURL,
            ]
        );

        return res.status(201).json({
            id: result.insertId,
            message: "Blog created successfully",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error parsing form data" });
        throw err
    }
};

const updateBlogs = async (req, res) => {
    try {
        const { fields, files } = await parseForm(req);
        const blogId = req.query.id;

        if (!blogId) {
            return res.status(400).json({ message: "Missing blog ID in query" });
        }

        const {
            title,
            slug,
            meta_description,
            meta_keywords,
            content,
            category,
            tags,
            seo_title,
            seo_description,
            seo_keywords,
            status,
            is_featured,
            is_active,
        } = fields;

        let imageURL = null;
        const image = files.image;

        if (image) {
            imageURL = await uploadToS3(image); // returns URL
        }

        const query = `
            UPDATE articles SET
                title = ?,
                slug = ?,
                meta_description = ?,
                meta_keywords = ?,
                content = ?,
                category = ?,
                tags = ?,
                seo_title = ?,
                seo_description = ?,
                seo_keywords = ?,
                status = ?,
                is_featured = ?,
                is_active = ?
                ${imageURL ? `, image_url = ?` : ""}
            WHERE id = ?
        `;

        const values = [
            title,
            slug,
            meta_description,
            meta_keywords,
            content,
            category,
            tags,
            seo_title,
            seo_description,
            seo_keywords,
            status,
            Number(is_featured),
            Number(is_active),
        ];

        if (imageURL) values.push(imageURL);
        values.push(blogId); // push ID last

        const [result] = await db.query(query, values);

        return res.status(200).json({
            message: "Blog updated successfully",
        });

    } catch (err) {
        console.error("Error updating blog:", err);
        res.status(500).json({ message: "Error updating blog" });
        throw err
    }
};


const deleteBlogs = async (req, res) => {
    try {
        const blogId = req.query.id;

        if (!blogId) {
            return res.status(400).json({ message: "Blog ID is required" });
        }

        const [result] = await db.query("DELETE FROM articles WHERE id = ?", [blogId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Blog not found" });
        }

        return res.status(200).json({ message: "Blog deleted successfully" });
    } catch (err) {
        console.error("Error deleting blog:", err);
        res.status(500).json({ message: "Error deleting blog" });
        throw err
    }
};


async function handler(req, res) {
    let isDbConnected = await checkDbConnection();

    if (!isDbConnected) {
        return res.status(500).json({ message: "Database connection failed" });
    }

    if (req.method === 'GET') {
        await getBlogs(req, res);
    } else if (req.method === 'POST') {
        await addBlogs(req, res);
    } else if (req.method === 'PUT') {
        await updateBlogs(req, res);
    } else if (req.method === 'DELETE') {
        await deleteBlogs(req, res);
    } else {
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

export default withMonitorLogger(handler)