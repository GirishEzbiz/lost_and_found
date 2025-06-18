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
  Pagination,
} from "react-bootstrap";
import ToastNotification from "pages/components/ToastNotification";
import axios from "axios";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import Cookies from "js-cookie";
 

const AdminUsers = () => {
  const [isUsers, setIsUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [search, setSearch] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit"); // Max users per page
  const totalPages = Math.ceil(1);


  const [tokenData, setTokenData] = useState();

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

  // console.log("tokenData", tokenData);

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);


  const brandId = tokenData?.brand_id
  useEffect(() => {
if(brandId){

  fetchUsers();
}

  }, [tokenData]);

  const fetchUsers = async () => {


    setLoading(true);
    try {
      const response = await axios.get(`/api/user/getAllUsers?brand_id=${brandId}&page=${totalPages}&limit=${itemsPerPage}`);
      setIsUsers(response.data.data);
      setFilteredUsers(response.data.data);
    } catch (error) {
      console.log("error faild to load", error);
      setToastMessage("Failed to load users.");
      setToastVariant("danger");
      setShowToast(true);
  }
  finally {
      setLoading(false);
    }

  };


  // Fetch users data


  // Filter users based on the search query
  useEffect(() => {
    if (!isUsers) return; // Prevent errors if isUsers is undefined
  
    const lowercasedSearch = search.toLowerCase();
    const filtered = isUsers.filter(
      (user) =>
        user.full_name.toLowerCase().includes(lowercasedSearch) ||
        user.email.toLowerCase().includes(lowercasedSearch)
    );
  
    setFilteredUsers(search ? filtered : isUsers); // If search is empty, return full list
    setCurrentPage(1);
  }, [search, isUsers]);
  

  // Paginate data
  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setQrdata([]); // ✅ Force UI re-render
      setCurrentPage(pageNumber);
    }
  };

  return (
    <Container fluid className="p-2">
      <Row className="align-items-center my-2">
        <Col>
          <h3>Users</h3>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
          <Row>
            <Col md={6}>
              <input
                placeholder="Search for Name or Email"
                className="form-control w-50"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : paginatedData.length === 0 ? (
            <p className="text-center my-5">No data found.</p>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto", position: "relative", width: "100%" }}>
                <table
                  className="text-nowrap table-centered mt-0 table"
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: 0,
                    width: "100%",
                    margin: "0 auto"
                  }}
                >
                  <thead
                    className="table-light"
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 100,
                      background: "white",
                    }}
                  >
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>Total Items</th>
                      <th>Lost</th>
                      <th>Found</th>
                      {/* <th>Recovered</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.full_name}</td>
                        <td>{user.user_mobile || "-"}</td>
                        <td>{user.email}</td>
                        <td>{user.total_qr_codes}</td>
                        <td>{user.lost_count || "-"}</td>
                        <td>{user.found_count || "-"}</td>
                        {/* <td>{user.recovered_count || "-"}</td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>



              <div className="justify-content-between align-items-center row p-3">
                <div className="col-md-5 col-sm-12">
                  <p>Total Users: {filteredUsers.length}</p>
                </div>
                <div className="col-md-7 col-sm-12">
                  <Pagination className="justify-content-end mb-0">
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <FiChevronsLeft size="18px" />
                    </Pagination.First>

                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FiChevronLeft size="18px" />
                    </Pagination.Prev>

                    {[...Array(2)].map((_, index) => {
                      const page = Math.max(1, currentPage - 1) + index;
                      if (page > totalPages) return null;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}

                    <Pagination.Next
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <FiChevronRight size="18px" />
                    </Pagination.Next>

                    <Pagination.Last
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <FiChevronsRight size="18px" />
                    </Pagination.Last>
                  </Pagination>
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
  );
};

export default AdminUsers;
