import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Container, Row, Spinner, Table, Form, Pagination } from 'react-bootstrap';
import { dateFormat } from 'utils/dateFormat';
import Select from 'react-select';

const actionOptions = [
  { value: "Allocation", label: "Allocation" },
  { value: "Download", label: "Download" },
  { value: "Expiry date", label: "Expiry Date" },
  { value: "Activation", label: "Activation" },
  { value: "Deactivation", label: "Deactivation" },
  { value: "Batch", label: "Production Batch" },
];


export default function CodeLedgerLog() {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sloading, setsLoading] = useState(false);
  const [Rloading, setRLoading] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    user: "",
    action: [],
    sku: "",
    serial: ""
  });


  const [users, setUsers] = useState([]);
  const [skus, setSkus] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageLimit = Cookies.get("Page-limit") || 10;
  const fetchData = async (filters = {}, page = 1) => {
    setLoading(true);

    const queryParams = new URLSearchParams();
    const offset = (page - 1) * pageLimit;
    if (filters.fromDate) queryParams.append("from_date", filters.fromDate);
    if (filters.toDate) queryParams.append("to_date", filters.toDate);
    if (filters.user) queryParams.append("user", filters.user);
    if (filters.action?.length) {
      queryParams.append("action", filters.action.map(a => a.value).join(","));
    }
    if (filters.sku) queryParams.append("sku", filters.sku);
    if (filters.serial) queryParams.append("serial", filters.serial);

    queryParams.append("limit", pageLimit);  // Add limit
    queryParams.append("offset", offset);  // Add offset

    try {
      const response = await fetch(`/api/admin/code_ledgers?${queryParams.toString()}`);
      const data = await response.json();
      setLedgerData(data?.data);
      setSkus(data?.skus);
      setUsers(data?.users);
      setTotalPages(data?.totalPages || 1);  // Update totalPages from the response
    } catch (error) {
      console.error("Error fetching ledger data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return date.toISOString().slice(0, 19).replace("T", " ");
  };

  useEffect(() => {
    fetchData(filters, currentPage);
  }, [currentPage]);

  return (
    <Container fluid className="p-2" style={{ width: '95%' }}>
      <h3 className="mb-4">Code Ledger Log</h3>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={2}>
              <Form.Control
                type="date"
                value={filters.fromDate}
                onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Control
                type="date"
                value={filters.toDate}
                onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              >
                <option value="" hidden>Select User</option>
                {users?.length > 0 && users.map((user) => (
                  <option value={user?.name} key={user?.name}>{user?.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Select
                isMulti
                options={actionOptions}
                value={filters.action}
                onChange={(selected) => setFilters({ ...filters, action: selected })}
                placeholder="Select actions..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  menu: (provided) => ({
                    ...provided,
                    zIndex: 9
                  })
                }}
              />
            </Col>


            <Col md={2}>
              <Form.Select
                value={filters.sku}
                onChange={(e) => setFilters({ ...filters, sku: e.target.value })}
              >
                <option value="" hidden>Select SKU</option>
                {skus?.length > 0 && skus.map((sku) => (
                  <option value={sku?.name} key={sku?.name}>{sku?.name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Control
                type="text"
                placeholder="Enter Serial"
                value={filters.serial}
                onChange={(e) => setFilters({ ...filters, serial: e.target.value })}
              />
            </Col>

            <Col md={2} className="d-flex gap-2">
              <Button
              style={{background:"#a22191",border:"none",color:"white"}}
                variant="primary"
                className="w-100"
                disabled={sloading}
                onClick={() => {
                  setsLoading(true);  // Set search loading to true
                  setCurrentPage(1);  // Reset to page 1 on new search
                  fetchData(filters, 1).finally(() => setsLoading(false));
                }}
              >
                {sloading ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="secondary"
                className="w-100"
                disabled={Rloading}
                onClick={() => {
                  setRLoading(true);  // Set reset loading to true
                  const emptyFilters = {
                    fromDate: "",
                    toDate: "",
                    user: "",
                    action: [],
                    sku: "",
                    serial: "" 
                  };
                  setFilters(emptyFilters);
                  setCurrentPage(1);
                  fetchData(emptyFilters, 1).finally(() => setRLoading(false));  // Reset and fetch data
                }}
              >
                {Rloading ? "Reseting..." : "Reset"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : ledgerData.length === 0 ? (
            <div className="text-center my-5">
              <h5 className="text-muted">No records found</h5>
            </div>
          ) : (
            <div className="table-responsive"
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
                overflowX: 'auto', // Enable horizontal scroll
                position: 'relative',
              }}>
              <Table className="table-centered" style={{
                marginBottom: '0',
                minWidth: '1500px', // Forces horizontal scroll if table is wide
              }}>
                <thead className="table-light" style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: '#f8f9fa' // Match your table-light color
                }}>
                  <tr>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>#</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Date/Time</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Action</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>SKU</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Brand</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>User</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Range From</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Range To</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Total</th>
                    <th className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.map((row, idx) => (
                    <tr key={idx}>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                        {(currentPage - 1) * pageLimit + idx + 1}
                      </td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                        {dateFormat(row.created_at)}
                      </td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>
                        {row.action?.split(",").map((item, idx, arr) => (
                          <span key={idx}>
                            <span className="badge bg-secondary me-1">{item}</span>
                            {idx < arr.length - 1 && <span>, </span>}
                          </span>
                        ))}
                      </td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.sku_name}</td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.brand_name}</td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.user_name}</td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.range_from}</td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.range_to}</td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.total}</td>
                      <td className="px-2 py-2 text-center" style={{ whiteSpace: 'nowrap' }}>{row.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      <Pagination className="justify-content-end mt-3 custom-pagination">
        <Pagination.Prev onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} />
        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index}
            active={currentPage === index + 1}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} />
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


    </Container>
  );
}
