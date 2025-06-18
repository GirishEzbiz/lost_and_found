import React, { useState, useEffect } from "react";
import {
    Badge,
    Button,
    Card,
    Col,
    Container,
    Row,
    Spinner,
    Table,
} from "react-bootstrap";
import ToastNotification from "pages/components/ToastNotification";
import axios from "axios";
import Link from "next/link";
import Swal from "sweetalert2";
import { Pagination } from "react-bootstrap";
import Cookies from "js-cookie";
import GetPermission from "utils/getpermissions";


const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");
    const [search, setSearch] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = Cookies.get("Page-limit") || 10;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const [permissions, setPermissions] = useState({
        canAdd: false,
        canEdit: false,
        canDelete: false,
    });

    useEffect(() => {
        setPermissions({
            canAdd: GetPermission("add-blog"),
            canEdit: GetPermission("edit-blog"),
            canDelete: GetPermission("delete-blog"),
        });
    }, []);

    console.log(permissions);




    const paginatedBlogs = filteredBlogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const fetchBlogs = async () => {
        setLoading(true);
        try {

            const response = await axios.get(`/api/admin/blogs`, {
                params: {

                    page: currentPage,
                    limit: itemsPerPage,
                    search,
                },
            });
            setBlogs(response.data.data || []);
            setFilteredBlogs(response.data.data || []);
            setTotalCount(response.data.total || 0);
        } catch (error) {
            console.log("error fetching blogs", error);
            setToastMessage("Failed to load blogs.");
            setToastVariant("danger");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchBlogs();

    }, [currentPage, search]);

    useEffect(() => {
        const filtered = blogs.filter((blog) => {
            const lowercasedSearch = search.toLowerCase();
            return (
                blog.title?.toLowerCase().includes(lowercasedSearch) ||
                blog.content?.toLowerCase().includes(lowercasedSearch) ||
                blog.author?.toLowerCase().includes(lowercasedSearch)
            );
        });
        setFilteredBlogs(filtered);
    }, [search, blogs]);

    const handleDeleteClick = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
            customClass: {
                popup: "swal2-small",
            },
        }).then((result) => {
            if (result.isConfirmed) {
                deleteBlog(id);
            }
        });
    };

    const deleteBlog = async (id) => {
        try {
            const response = await fetch(`/api/admin/blogs?id=${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                const data = await response.json();
                setToastMessage("Blog deleted successfully!");
                setToastVariant("success");
                setShowToast(true);

                setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
            } else {
                const errorData = await response.json();
                console.error(errorData.message);
                setToastMessage("Error deleting blog. Please try again.");
                setToastVariant("danger");
                setShowToast(true);
            }
        } catch (error) {
            console.log("error deleting blog", error);
            setToastMessage("Error deleting blog. Please try again.");
            setToastVariant("danger");
            setShowToast(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Container fluid className="p-2" style={{ width: "95%" }}>
                <Row className="align-items-center my-2">
                    <Col>
                        <h3>Blog Management</h3>
                    </Col>
                </Row>

                <Card className="shadow-sm">
                    <Card.Header>
                        <Row className="align-items-center justify-content-between">
                            <Col md={8}>
                                <input
                                    placeholder="Search for Title, Content, or Author"
                                    className="form-control w-50"
                                    type="search"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </Col>
                            <Col md="auto" className="d-flex gap-2">
                                {
                                    permissions.canAdd && (
                                        <Link href="/admin/blogs/create">
                                            <Button variant="primary" className="btn-md">
                                                + Add Blog
                                            </Button>
                                        </Link>
                                    )
                                }

                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="d-flex justify-content-center my-5">
                                <Spinner animation="border" variant="primary" />
                            </div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className="text-center my-5">
                                <h5 className="text-muted">No blogs found.</h5>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                <p className="ps-2">Showing {filteredBlogs.length} out of {totalCount}</p>

                                <table className="text-nowrap table-centered mt-0 table">
                                    <thead
                                        className="table-light"
                                        style={{
                                            position: "sticky",
                                            top: 0,
                                            zIndex: 10,
                                            background: "white",
                                        }}
                                    >
                                        <tr>
                                            <th>ID</th>
                                            <th>Image</th>
                                            <th>Title</th>
                                            {/* <th>Author</th> */}
                                            <th>Status</th>
                                            <th>Category</th>
                                            {(permissions.canEdit || permissions.canDelete) && (
                                                <th>Actions</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBlogs.map((blog) => (
                                            <tr key={blog.id}>
                                                <td>{blog.id}</td>
                                                <td>

                                                    <img
                                                        src={blog.image_url}
                                                        alt={blog.title}
                                                        className="img-fluid rounded-circle"
                                                        style={{ width: "50px", height: "50px" }}
                                                    />
                                                </td>
                                                <td>{blog.title}</td>
                                                {/* <td>{blog.author}</td> */}
                                                <td>
                                                    {blog.status === 1 ? (
                                                        <Badge pill bg="success">Published</Badge>
                                                    ) : (
                                                        <Badge pill bg="danger">Draft</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge pill bg="light" text="dark">
                                                        {blog.category || "-"}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    {permissions.canEdit && (
                                                        <Link
                                                            href={`/admin/blogs/edit/${blog.id}`}
                                                            passHref
                                                            className="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
                                                        >
                                                            <span>
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="24"
                                                                    height="24"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    className="icon-xs"
                                                                >
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                </svg>
                                                            </span>
                                                        </Link>
                                                    )}
                                                    {permissions.canDelete && (
                                                        <div
                                                            className="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
                                                            onClick={() => handleDeleteClick(blog.id)}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                className="icon-xs"
                                                            >
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                                            </svg>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card.Body>

                    <div className="justify-content-between align-items-center row p-3">
                        <div className="col-md-5 col-sm-12">
                        </div>
                        <div className="col-md-7 col-sm-12">
                            <Pagination className="justify-content-end mb-0">
                                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

                                {Array.from({ length: totalPages }, (_, index) => index + 1)
                                    .filter(
                                        (page) =>
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 2 && page <= currentPage + 2)
                                    )
                                    .map((page, index, arr) => {
                                        const prev = arr[index - 1];
                                        const items = [];

                                        if (prev && page - prev > 1) {
                                            items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} disabled />);
                                        }

                                        items.push(
                                            <Pagination.Item
                                                key={`page-${page}`}
                                                active={page === currentPage}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Pagination.Item>
                                        );

                                        return items;
                                    })
                                    .flat()
                                }

                                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    </div>
                </Card>

                <ToastNotification
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    message={toastMessage}
                    variant={toastVariant}
                />
            </Container>
        </>
    );
};

export default Blogs;

