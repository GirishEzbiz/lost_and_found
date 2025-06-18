
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Form,
  Alert,
  Pagination,
} from "react-bootstrap";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";

const SKUListPage = () => {
  const [qrdata, setQrdata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: "",
    sku: "",
    date: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit");

  // Fetch QR data
  const fetchQrs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/qrcodes");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setQrdata(data);
      setFilteredData(data); // Initialize filtered data with all QR data
    } catch (error) {
      console.log("error fetching qrs code",error);
      setError(error.message);
  }
   finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Apply filters to data
  useEffect(() => {
    const applyFilters = () => {
      const filtered = qrdata.filter((qrs) => {
        const matchBrand =
          !filters.brand ||
          qrs.brand_name.toLowerCase().includes(filters.brand.toLowerCase());
        const matchSku =
          !filters.sku ||
          qrs.sku_name.toLowerCase().includes(filters.sku.toLowerCase());
        const matchDate =
          !filters.date ||
          new Date(qrs.created_at).toISOString().split("T")[0] === filters.date;

        return matchBrand && matchSku && matchDate;
      });
      setFilteredData(filtered);
    };

    applyFilters();
  }, [filters, qrdata]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Pagination logic
  const paginateData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    fetchQrs();
  }, []);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = paginateData();

  return (
    <Container fluid className="p-2">
      <Row className="align-items-center my-2">
        <Col>
          <h3>QR Code Ledger</h3>
        </Col>
      </Row>

      {/* Error Message */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Filter Section */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group controlId="brandFilter">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  type="text"
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                  placeholder="Filter by brand"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="skuFilter">
                <Form.Label>SKU</Form.Label>
                <Form.Control
                  type="text"
                  name="sku"
                  value={filters.sku}
                  onChange={handleFilterChange}
                  placeholder="Filter by SKU"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="dateFilter">
                <Form.Label>Date</Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* QR Table */}
      {/* <Card className="shadow-sm">
        <Card.Body> */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : paginatedData.length === 0 ? (
        <p className="text-center">No QR found with applied filters.</p>
      ) : (
        <>
          <Table responsive hover>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Serial No</th>
                <th>Brand</th>
                <th>SKU</th>
                <th>QR Code</th>
                <th>Status</th>
                <th>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((qrs, index) => (
                <tr key={qrs.id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{qrs.serial_number}</td>
                  <td>{qrs.brand_name}</td>
                  <td>{qrs.sku_name}</td>
                  <td>{qrs.qr_code}</td>
                  <td>{qrs.status}</td>
                  <td>{formatDate(qrs.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          {/* Pagination */}
          <Pagination>
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
        </>
      )}

      {/* </Card.Body>
      </Card> */}
    </Container>
  );
};

export default SKUListPage;
