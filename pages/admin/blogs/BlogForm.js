import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { Editor } from "@tinymce/tinymce-react";

const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
];

const BlogForm = ({ blogId }) => {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [metaKeywords, setMetaKeywords] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState("");
    const [tags, setTags] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [seoKeywords, setSeoKeywords] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [status, setStatus] = useState("draft");
    const [isFeatured, setIsFeatured] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState(null); // For preview in <img>


    const fetchBlogData = async () => {
        if (!blogId) return;
        try {
            const res = await fetch(`/api/admin/blogs?id=${blogId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch blog data.");
            }
            const d = await res.json();
            const data = d.data[0]; // Assuming the API returns an array of blogs
            console.log(data);
            setTitle(data.title || "");
            setSlug(data.slug || "");
            setMetaDescription(data.meta_description || "");
            setMetaKeywords(data.meta_keywords || "");
            setContent(data.content || "");
            setCategory(data.category || "");
            setImagePreview(data.image_url || null); // Assuming the image URL is returned
            setTags(data.tags);
            setSeoTitle(data.seo_title);
            setSeoDescription(data.seo_description);
            setSeoKeywords(data.seo_keywords);
            setStatus(data.status);
            setIsFeatured(data.is_featured === 1);
            setIsActive(data.is_active === 1);
        } catch (err) {
            setError(err.message || "Failed to fetch blog data.");
        }
    };
    useEffect(() => {
        if (blogId) {
            fetchBlogData();
        }
    }, [blogId]);

    const generateSlug = (text) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
            .replace(/\s+/g, "-"); // Replace spaces with -

    // Inside useEffect: auto-generate slug when title changes
    useEffect(() => {

        setSlug(generateSlug(title));

    }, [title]);
    console.log("slug", slug);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("slug", slug);
        formData.append("meta_description", metaDescription);
        formData.append("meta_keywords", metaKeywords);
        formData.append("content", content);
        formData.append("category", category);
        formData.append("tags", tags);
        formData.append("seo_title", seoTitle);
        formData.append("seo_description", seoDescription);
        formData.append("seo_keywords", seoKeywords);
        formData.append("status", status);
        formData.append("is_featured", isFeatured ? 1 : 0);
        formData.append("is_active", isActive ? 1 : 0);
        if (imageFile) {
            formData.append("image", imageFile); // ✅ Image goes here
        }

        try {
            const endpoint = blogId ? `/api/admin/blogs?id=${blogId}` : "/api/admin/blogs";
            const method = blogId ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method,
                body: formData, // ✅ Send FormData, not JSON
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to save blog.");
            }

            router.push("/admin/blogs");
        } catch (err) {
            setError(err.message || "Failed to save blog.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file)); // Generate local preview
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    {/* <Form.Group className="mb-3">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </Form.Group> */}
                    <Form.Group className="mb-3">
                        <Form.Label>Image</Form.Label>



                        <Form.Control
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setImageFile(file);
                                    setImagePreview(URL.createObjectURL(file));
                                }
                            }}
                        />
                    </Form.Group>
                    {imagePreview && (
                        <div style={{ marginBottom: "10px" }}>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ maxWidth: "200px", height: "200px", borderRadius: "8px" }}
                            />
                        </div>
                    )}
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>Content</Form.Label>
                {/* <Form.Control
                    as="textarea"
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                /> */}
                <Editor
                    apiKey="ie7yp6nve5r1iv3viajs7i1uz5pfq1mf6mr2g6szz158f0go"
                    value={content}
                    onEditorChange={(newContent) => setContent(newContent)}  // Handle changes in the editor
                    init={{
                        height: 300,
                        menubar: false,
                        plugins: "image code link lists",
                        toolbar:
                            "bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist | forecolor image | code",
                    }}
                />
            </Form.Group>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meta Description</Form.Label>
                        <Form.Control
                            type="text"
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Meta Keywords</Form.Label>
                        <Form.Control
                            type="text"
                            value={metaKeywords}
                            onChange={(e) => setMetaKeywords(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tags</Form.Label>
                        <Form.Control
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Category</Form.Label>
                        <Form.Control
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>SEO Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={seoTitle}
                            onChange={(e) => setSeoTitle(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>SEO Description</Form.Label>
                        <Form.Control
                            type="text"
                            value={seoDescription}
                            onChange={(e) => setSeoDescription(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Form.Group className="mb-3">
                <Form.Label>SEO Keywords</Form.Label>
                <Form.Control
                    type="text"
                    value={seoKeywords}
                    onChange={(e) => setSeoKeywords(e.target.value)}
                />
            </Form.Group>



            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Check
                        type="checkbox"
                        label="Featured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="mb-3"
                    />
                </Col>
                <Col md={4}>
                    <Form.Check
                        type="checkbox"
                        label="Active"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="mb-3"
                    />
                </Col>
            </Row>

            <Button type="submit" variant="primary" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Save Blog"}
            </Button>
        </Form>
    );
};

export default BlogForm;
