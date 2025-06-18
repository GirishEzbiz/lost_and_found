import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Spinner,
  Alert,
  Form,
  Card,
  Col,
  Container,
  Row,
  Pagination,
  Dropdown,
} from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import Link from "next/link";
import { getAdminDetail } from "lib/getAdminDetail";
import GetPermission from "utils/getpermissions";

const BrandUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    status: 1,
    permission: [],
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState(null);
  const [user, setUser] = useState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const router = useRouter();
  const brandId = router.query.id;
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = Cookies.get("Page-limit" || 10); // Show 50 items per page

  const [totalCount, setTotalCount] = useState(0);

  const [permissions, setPermissions] = useState({
    canAdd: false,

    canEdit: false,

  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-brandUser"),

      canEdit: GetPermission("edit-brandUser"),
    });
  }, []);


  useEffect(() => {
    if (router.query.id) {
      fetchUsers();
    }
  }, [router.query.id, currentPage, itemPerPage]);


  useEffect(() => {
    const userD = getAdminDetail();

    setUser(userD);
  }, []);


  useEffect(() => {
    if (router.query.id) {
      fetchUsers();
    }
  }, [router.query.id]);

  const fetchUsers = async () => {
    if (!brandId) return;
    try {
      const res = await axios.get(`/api/admin/brandUsers`, {
        params: {
          brandId, page: currentPage,
          limit: itemPerPage,
        },
      });
      setUsers(res.data.data || []);
      setTotalCount(res.data.totalCount || 0);

    } catch (err) {
      console.log("Error fetching brand users", err);
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      errors.email = "Invalid email format.";
    if (!isEditMode && !formData.password.trim())
      errors.password = "Password is required.";
    if (!formData.mobile.trim()) errors.mobile = "Mobile is required.";
    else if (!/^\d{10}$/.test(formData.mobile))
      errors.mobile = "Mobile must be 10 digits.";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});
    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      created_by: user?.id,
      brandId,
      status: Number(formData.status),
    };

    if (isEditMode && formData.password === "") {
      delete payload.password;
    }



    try {
      setLoading(true);
      if (isEditMode && editingUserId) {
        await axios.put("/api/admin/brandUsers", { id: editingUserId, ...payload });
      } else {
        await axios.post("/api/admin/brandUsers", payload);
      }
      fetchUsers();
      setShowModal(false);
      resetForm();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save user";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", mobile: "", status: 1 });
    setIsEditMode(false);
    setEditingUserId(null);
    setValidationErrors({});
    setError(null);
  };

  const totalPages = Math.ceil(totalCount / itemPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };



  const permissionOptions = [
    {
      label: "Allow user to change Brand Banner",
      value: "change_brand_banner",
    },
    {
      label: "Allow user to change Welcome Message",
      value: "change_welcome_message",
    },
    {
      label: "Allow user to see details of Registered Users",
      value: "view_registered_users",
    },
    {
      label: "Allow user to Renew QR",
      value: "renew_qr",
    },
    {
      label: "Allow user to See Reports",
      value: "view_reports",
    },
    {
      label: "Allow user to Download Registered Users Data",
      value: "download_registered_data",
    },
  ];


  const handlePermissionChange = (value) => {
    setFormData((prev) => {
      const currentPermissions = Array.isArray(prev.permission) ? prev.permission : [];
      const alreadySelected = currentPermissions.includes(value);
      const updated = alreadySelected
        ? currentPermissions.filter((p) => p !== value)
        : [...currentPermissions, value];

      return { ...prev, permission: updated };
    });
  };


  const cleanPermissions = (permissions) => {
    console.log("permissions",permissionOptions)
    console.log("pp",permissions)
    const validValues = permissionOptions.map(opt => opt.value);
    return permissions.filter(p => validValues.includes(p));
  };




  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Brand Users</h3>
        </Col>
        <Col className="text-end">
          {
            permissions.canAdd && (
              <Button
                variant="primary"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                style={{ background: "#aa2191", border: "none",color: "#fff" }}
              >
                + Add User
              </Button>
            )
          }
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center my-5">
              <h5 className="text-muted">No users found</h5>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                      <th>#</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      {
                        permissions.canEdit && (

                          <th>Actions</th>
                        )
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userrr, idx) => {
                      console.log("userr",userrr)
                      return(
                        (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{userrr.name}</td>
                            <td>{userrr.email}</td>
                            <td>{userrr.mobile}</td>
                            <td>{userrr.status === 1 ? "Active" : "Inactive"}</td>
                            <td>
                              {
                                permissions.canEdit && (
    
                                  <Link
                                    href="#"
                                    passHref
                                    className="btn btn-ghost btn-icon custom-btn-icon btn-sm rounded-circle"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setIsEditMode(true);
                                      setEditingUserId(userrr.id);
                                      setFormData({
                                        name: userrr.name,
                                        email: userrr.email,
                                        password: "", 
                                        mobile: userrr.mobile,
                                        status: userrr.status,
                                        // permission: JSON.parse(userrr.permission),
    
                                        permission: userrr?.permission ?cleanPermissions(JSON.parse(userrr.permission)):"",
                                      });
                                      setShowModal(true);
                                    }}
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
                                )
                              }
    
                            </td>
                          </tr>
                        )
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="justify-content-between align-items-center row p-3">
                <div className="col-md-6 col-sm-12">
                  <p>Total Users: {totalCount}</p>
                </div>
                <div className="col-md-6 col-sm-12">
                  {/* Static pagination placeholder — replace with real pagination if needed */}
                  <Pagination className="justify-content-end mb-0 custom-pagination">
                    <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                    <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                      .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2))
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
                      })}

                    <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
                  </Pagination>
                  <style jsx global>
              {`
              
              /* Change background of active button */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191; /* Bootstrap magenta color */
  border: none;
  color: white;
}
              `}

              </style>
                </div>
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Modal (unchanged) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Edit Brand User" : "Add Brand User"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    isInvalid={!!validationErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    isInvalid={!!validationErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    isInvalid={!!validationErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mobile</Form.Label>
                  <Form.Control
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    isInvalid={!!validationErrors.mobile}
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.mobile}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Permissions</Form.Label>
                  <Dropdown autoClose={false}>
                    <Dropdown.Toggle variant="outline-secondary" id="permissions-dropdown" className="w-100 text-start">
                      {formData?.permission?.length > 0
                        ? `${formData?.permission?.length} selected`
                        : "Select Permissions"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      style={{
                        width: "max-content",
                        minWidth: "100%",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {permissionOptions.map((perm, idx) => (
                        <Dropdown.Item
                          key={idx}
                          as="div"
                          className="d-flex align-items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Form.Check
                            type="checkbox"
                            label={perm.label}
                            checked={formData?.permission?.includes(perm.value)}
                            onChange={() => handlePermissionChange(perm.value)}
                            className="me-2"
                          />
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>


                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="text-end">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} style={{ background: "#aa2191", border: "none", color: "#fff" }}>
                {loading ? <Spinner size="sm" animation="border" /> : "Save User"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>

  );
};

export default BrandUsersPage;
