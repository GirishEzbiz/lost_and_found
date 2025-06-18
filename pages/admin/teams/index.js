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


const AdminTeam = () => {
  const [isTeam, setIsTeam] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [search, setSearch] = useState("");
  const [tokenData, setTokenData] = useState();
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = parseInt(Cookies.get("Page-limit") || 10);
  const totalPages = Math.ceil(totalCount / pageSize);

  const [permissions, setPermissions] = useState({
    canAdd: false,
    canEdit: false,
    canDelete: false,
  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-team"),
      canEdit: GetPermission("edit-team"),
      canDelete: GetPermission("delete-team"),
    });
  }, []);


  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit") || 10; // Max SKUs per page

  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1]; // Get the payload part of the JWT
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Replace URL-safe characters
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload); // Return the parsed JSON payload
    } catch (error) {
      console.log("error fetching token", error);
      return null; // Return null if decoding fails
    }

  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const fetchUsers = async () => {
    setLoading(true);
    try {
      let brandId = tokenData?.brand_id;
      const response = await axios.get(`/api/admin/admin`, {
        params: {
          brand_id: tokenData?.brand_id ?? "null",
          page: currentPage,
          limit: itemsPerPage,
          search,
        },
      });


      setIsTeam(response.data.users || []);
      setFilteredUsers(response.data.users || []);
      setTotalCount(response.data.total || 0);
    } catch (error) {
      console.log("error fetching teams", error);
      setToastMessage("Failed to load teams.");
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teams data (mocked for now)
  useEffect(() => {
    // const fetchUsers = async () => {
    //   setLoading(true);
    //   try {
    //     let brandId = tokenData?.brand_id;
    //     const response = await axios.get(
    //       `/api/admin/admin?brand_id=${brandId}`
    //     );
    //     console.log("response", response.data);

    //     let d = response.data;

    //     console.log("tokenData", tokenData);

    //     // if (tokenData.role == 0) {
    //     //   let filterTeam = d?.filter((d) => d.brand_id !== null && d.brand_id === tokenData?.brand_id)

    //     //   console.log("filterTeam", filterTeam)
    //     //   console.log("d", d)

    //     //   setIsTeam(filterTeam);
    //     //   setFilteredUsers(filterTeam); // Set filteredUsers initially to all teams
    //     // } else {
    //     setIsTeam(response?.data);
    //     setFilteredUsers(response?.data);
    //     // }
    //   } catch (error) {
    //     console.log("error fetching teams", error);
    //     setToastMessage("Failed to load teams.");
    //     setToastVariant("danger");
    //     setShowToast(true);
    // }
    //  finally {
    //     setLoading(false);
    //   }
    // };
    if (tokenData) {
      fetchUsers();
    }
  }, [tokenData, currentPage, search]);

  useEffect(() => {
    // Filter teams based on the search query
    const filtered = isTeam.filter((user) => {
      const lowercasedSearch = search.toLowerCase();
      return (
        user.name?.toLowerCase().includes(lowercasedSearch) ||
        user.email?.toLowerCase().includes(lowercasedSearch) ||
        user.role?.toLowerCase().includes(lowercasedSearch)
      );
    });
    setFilteredUsers(filtered);
  }, [search, isTeam]); // Re-run the filter when search or isTeam change

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const handleDeleteClick = (id) => {
    // Handle delete logic here
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "swal2-small", // Apply custom class for small size
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(id); // Proceed with deletion
      }
    });
  };

  const deleteUser = async (id) => {
    try {
      // Sending DELETE request to the API with the category ID
      const response = await fetch(`/api/admin/admin?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        // Log the success message
        // Show success toast
        setToastMessage("User deleted successfully!");
        setToastVariant("success");
        setShowToast(true);

        // Remove the deleted category from the local state
        setIsTeam((prevUsers) => prevUsers.filter((user) => user.id !== id));
      } else {
        const errorData = await response.json();
        console.error(errorData.message); // Log the error message
        // Show error toast
        setToastMessage("Error deleting user. Please try again.");
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.log("error deleteing user", error);
      // Show error toast
      setToastMessage("Error deleting user. Please try again.");
      setToastVariant("danger");
      setShowToast(true);
    }
    finally {
      setLoading(false); // Set loading to false once the operation is complete
    }
  };

  return (
    <>
      <Container fluid className="p-2" style={{ width: "95%" }}>
        <Row className="align-items-center my-2">
          <Col>
            <h3>Team Management</h3>
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
              <Col md="auto" className="d-flex gap-2">
                <Link href="/admin/roles">
                  <Button variant="secondary" className="btn-md">
                    Roles & Permission
                  </Button>
                </Link>
                {
                  permissions.canAdd && (
                    <Link href="/admin/teams/create">
                      <Button  className="btn-md" style={{ backgroundColor: "#A22191", color: "#fff", border: "none" }} >
                        + Add Team
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
              <div className="text-center my-5">
                <h5 className="text-muted">No data found.</h5>
              </div>
            ) : (
              <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <p>Showing {filteredUsers.length} out of {totalCount}</p>

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
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created By</th>
                      {
                        (permissions.canEdit || permissions.canDelete) && (

                          <th>Actions</th>
                        )
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.mobile || "-"}</td>
                        <td>{user.email}</td>
                        <td>{user.role_name || "-"}</td>
                        <td>
                          {user.status === 1 ? (
                            <Badge pill bg="success">Active</Badge>
                          ) : (
                            <Badge pill bg="danger">In-Active</Badge>
                          )}
                        </td>
                        <td>
                          <Badge pill bg="light" text="dark">
                            {user.created_by_name || "-"}
                          </Badge>
                        </td>
                        <td>
                          {
                            permissions.canEdit && (
                              <Link
                                href={`/admin/teams/edit/${user.id}`}
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
                            )
                          }


                          {
                            permissions.canDelete && (
                              <div
                                className="btn btn-ghost btn-icon btn-sm rounded-circle texttooltip"
                                onClick={() => handleDeleteClick(user.id)}
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
                            )
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>

          <div className="justify-content-end align-items-center row p-3">

            <div className="col-md-7 col-sm-12">
              {/* <Pagination className="justify-content-end mb-0">
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
            </Pagination> */}

              <Pagination className="justify-content-end mb-0 custom-pagination">
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
