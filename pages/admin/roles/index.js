import React, { useState, useEffect } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Container,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import ToastNotification from "pages/components/ToastNotification";
import axios from "axios";
import Link from "next/link";
import Swal from "sweetalert2";
import GetPermission from "utils/getpermissions";
import Cookies from "js-cookie";
import { dateFormat } from "utils/dateFormat";


const AdminTeam = () => {
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit" || 10); // Show 50 items per page
  const [permissions, setPermissions] = useState({
    canAdd: false,
    canEdit: false,
    canDelete: false,
  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-role"),
      canEdit: GetPermission("edit-role"),
    });
  }, []);



  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/roles");

      setFilteredUsers(response.data); // Set filteredUsers initially to all teams
    } catch (error) {
      console.log("error fewtching teams ", error);
      setToastMessage("Failed to load teams.");
      setToastVariant("danger");
      setShowToast(true);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // Handle search and pagination
  const filterAndPaginateUsers = () => {
    let filteredData = filteredUsers;

    if (search) {
      filteredData = filteredData.filter((user) =>
        user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRole(id); // Proceed with deletion
      }
    });
  };

  return (
    <>
      <Container fluid className="p-2" style={{ width: "95%" }}>
        <Row className="align-items-center my-2">
          <Col>
            <h3>Role</h3>
          </Col>
        </Row>

        <Card className="shadow-sm">
          <Card.Header>
            <Row className="align-items-center justify-content-between">
              <Col md={8}>
                <input
                  placeholder="Search for Name, Email, or Role"
                  className="form-control w-50"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>

              {/* Buttons wrapped in flex container */}
              <Col md="auto" className="d-flex gap-2 justify-content-end">
                <Link href="/admin/teams">
                  <Button variant="secondary" className="btn-md">
                    Back
                  </Button>
                </Link>
                {
                  permissions.canAdd && (
                    <Link href="/admin/roles/create">
                      <Button  style={{ backgroundColor: '#a22191', border: 'none' }} className="btn-md">
                        + Add Roles
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
            ) : filteredUsers.length === 0 ? (
              <p className="text-center my-5">No data found.</p>
            ) : (
              <>

                <div style={{ overflowY: "auto", maxHeight: "300px" }}> 
                <table className= "table">
                  <thead className="table-light" style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 10,
                      background: "white",
                    }}>
                    <tr>
                      <th>ID</th>
                      <th>Role</th>
                      <th>Created By</th>
                      <th>Created At</th>
                      {
                        permissions.canEdit && (
                          <th>Actions</th>

                        )
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {filterAndPaginateUsers().map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>
                          <Badge pill bg="light" text="dark" className="me-1">
                            {user.created_by_name || "-"}
                          </Badge>
                        </td>
                        <td>{dateFormat(user.indate)}</td>
                        {
                          permissions.canEdit && (
                            <td>
                              <Link
                                href={`/admin/roles/edit/${user.id}`}
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
                            </td>
                          )
                        }

                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {/* Pagination Controls */}
                <div className="justify-content-between align-items-center row p-3">
                  <div className="col-md-5 col-sm-12 text-right">
                    <p>Total Users: {filteredUsers.length}</p>
                  </div>
                  <div className="col-md-7 col-sm-12">
                    <Pagination className="justify-content-end mb-0 custom-pagination">
                      <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      />
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {[...Array(totalPages)].map((_, index) => (
                        <Pagination.Item
                          key={index}
                          active={index + 1 === currentPage}
                          onClick={() => handlePageChange(index + 1)}
                        >
                          {index + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                      <Pagination.Last
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      />
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

export default AdminTeam;
