import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Spinner,
  Alert,
  Container,
  Row,
  Col,
  Form,
  Pagination,
} from "react-bootstrap";

export default function BrandQrStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [uniqueBrands, setUniqueBrands] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const fetchStats = async (page = 1, brand = brandFilter) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/brand-wise-count?page=${page}&limit=${pageSize}&brand=${brand}`
      );
      const data = await res.json();

      if (res.ok) {
        setStats(data.data || []);
        setTotalCount(data.total || 0);
        if (data.uniqueBrands) setUniqueBrands(data.uniqueBrands); // if backend returns list of brands
      } else {
        throw new Error(data.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchStats(1);
  }, [brandFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
              <Col>
                <h3>Brand-wise QR Statistics</h3>
              </Col>
            </Row>
      <Card className="shadow-sm">
        <Card.Header>
          <Row className="align-items-center">
           
            <Col className="text-start">
              <Form.Select
                style={{ width: "250px", display: "inline-block" }}
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="all">All Brands</option>
                {uniqueBrands.map((brand, idx) => (
                  <option key={idx} value={brand}>
                    {brand}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : stats.length === 0 ? (
            <Alert variant="warning">No data found.</Alert>
          ) : (
            <>
              <div className="table-responsive">
                <Table bordered hover striped>
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Brand Name</th>
                      <th>Total Released</th>
                      <th>Printed</th>
                      <th>Total Registered</th>
                      <th>Lost Reported</th>
                      <th>Finder Scans</th>
                      <th>Found Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((row, idx) => (
                      <tr key={idx}>
                        <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td>{row.name || "-"}</td>
                        <td>{row.total_released}</td>
                        <td>{row.printed_count}</td>
                        <td>{row.total_registered}</td>
                        <td>{row.lost_reported}</td>
                        <td>{row.finder_scans}</td>
                        <td>{row.found_reported}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-end">
                <Pagination className="custom-pagination">
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter((page) => {
                      return (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      );
                    })
                    .map((page, index, arr) => {
                      const prev = arr[index - 1];
                      const items = [];

                      if (prev && page - prev > 1) {
                        items.push(
                          <Pagination.Ellipsis key={`ellipsis-${page}`} disabled />
                        );
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
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
