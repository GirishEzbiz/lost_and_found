import {
  Button,
  Card,
  Col,
  Container,
  Pagination,
  Row,
  Spinner,
} from "react-bootstrap";
import ToastNotification from "pages/components/ToastNotification";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function FinderManagement() {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [finders, setFinders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = Cookies.get("Page-limit") || 10;
  const [tokenData, setTokenData] = useState();

  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.log("error decoding token", error);
      return null;
    }
  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);

  useEffect(() => {
    getFinders();
  }, [currentPage]);

  const getFinders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/finder-page?page=${currentPage}&limit=${pageSize}`
      );
      const data = await response.json();
      setFinders(data.finders || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error("Error fetching finder data:", error);
      setToastVariant("danger");
      setToastMessage("Failed to fetch finder data");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Finder Management</h3>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Displays finder details including name, mobile, city, and registration date.
          </p>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : finders.length === 0 ? (
            <div className="text-center my-5">
              <h5 className="text-muted">Data Not Found</h5>
            </div>
          ) : (
            <>
              <div
                className="table-responsive"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                <p>Showing {finders.length} out of {totalCount}</p>
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
                      <th>Mobile</th>
                      <th>City</th>
                      <th>Region</th>
                      <th>Created On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finders.map((finder, index) => (
                      <tr key={finder.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{finder.name || "-"}</td>
                        <td>{finder.mobile || "-"}</td>
                        <td>{finder.city || "-"}</td>
                        <td>{finder.region_name || "-"}</td>
                        <td>
                          {finder.indate
                            ? new Date(finder.indate).toLocaleDateString(
                              "en-IN"
                            )
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="justify-content-between align-items-center row p-3">
                <div className="col-md-5 col-sm-12">

                </div>
                <div className="col-md-7 col-sm-12 d-flex justify-content-end">
                  <Pagination className="mb-0 custom-pagination">
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    />

                    {/* Display previous, current, and next pages */}
                    {[...Array(3)].map((_, index) => {
                      const pageToShow = currentPage + index - 1;  // Show previous, current, and next pages
                      if (pageToShow >= 1 && pageToShow <= totalPages) {
                        return (
                          <Pagination.Item
                            key={pageToShow}
                            active={pageToShow === currentPage}
                            onClick={() => handlePageChange(pageToShow)}
                          >
                            {pageToShow}
                          </Pagination.Item>
                        );
                      }
                      return null;
                    })}

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
  );
}
