import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination } from 'react-bootstrap';

export default function ManageApiLogs() {
  const [logs, setLogs] = useState([]);
  const [fromDate, setFromDate] = useState('');               // Input field date
  const [toDate, setToDate] = useState('');                   // Input field date
  const [searchFromDate, setSearchFromDate] = useState('');   // This will actually trigger fetch
  const [searchToDate, setSearchToDate] = useState('');
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = Cookies.get("Page-limit") || 10;

  const fetchLogs = async (page = 1, from = null, to = null) => {
    try {
      let url = `/api/admin/api-request-logs?page=${page}&limit=${pageSize}`;
      if (from && to) {
        url += `&fromDate=${from}&toDate=${to}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setLogs(data.logs);
      setTotalLogs(data.total || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  // Only triggered when page changes or searchFromDate/searchToDate changes
  useEffect(() => {
    fetchLogs(currentPage, searchFromDate, searchToDate);
  }, [currentPage, searchFromDate, searchToDate]);

  const totalPages = Math.ceil(totalLogs / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = () => {
    console.log("Searching from:", fromDate, "to:", toDate);
    setSearchFromDate(fromDate);   // ✅ This triggers the API call
    setSearchToDate(toDate);       // ✅ This triggers the API call
    setCurrentPage(1);             // Always reset to page 1 on search
  };

  return (
    <Container fluid className="py-4" style={{ width: "95%" }}>
      <h4 className="mb-4 fw-semibold">Manage Api Request Logs</h4>

      <div className="bg-light p-3 rounded-2 mb-4 shadow-sm">
        <Row className="g-3 align-items-center">
          <Col md={3}>
            <Form.Control
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </Col>
          <Col md={3}>
            <Form.Control
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </Col>

          <Col md={12} className="d-flex gap-2 flex-wrap">
            <Button variant="primary" className="w-100 w-md-auto" onClick={handleSearch}>
              Search more detail
            </Button>
          </Col>
        </Row>
      </div>

      <div className="bg-white p-3 rounded-2 shadow-sm">
        <div className="mb-2 fw-medium">Showing {logs.length} out of {totalLogs} </div>

        <div className="logs-table-wrapper">
          <div className="logs-table-scroll">
            <Table size="sm" className="text-center custom-logs-table">
              <thead className="table-light sticky-header">
                <tr>
                  <th>#</th>
                  <th>API</th>
                  <th>Method</th>
                  <th>Requested At</th>
                  <th>Params</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>{log.url}</td>
                    <td>{log.method}</td>
                    <td>
                      {/* {new Date(log.requested_at).toLocaleString()} */}
{new Date(log.requested_at).toLocaleString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false // for 24-hour format, set to true for AM/PM
})}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.params}>
                      {log.params}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center row p-3">
        <div className="col-md-7 col-sm-12">
          <Pagination className="justify-content-start mb-0">
            <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {[currentPage - 1, currentPage, currentPage + 1]
              .filter(page => page >= 1 && page <= totalPages)
              .map((page) => (
                <Pagination.Item key={page} active={page === currentPage} onClick={() => handlePageChange(page)}>
                  {page}
                </Pagination.Item>
              ))}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      </div>
    </Container>
  );
}
