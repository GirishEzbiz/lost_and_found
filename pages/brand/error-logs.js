import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { OverlayTrigger, Tooltip, Dropdown, Spinner, Table, Badge, Pagination, Card } from "react-bootstrap";

const LogsDropdown = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit");



  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test?page=${page}&limit=${itemsPerPage}`);
      const result = await response.json();
      setLogs(result.data || []);
      setTotalPages(result.total_pages || 1);
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const extractFilePath = (stack) => {
    const match = stack.match(/\/pages\/[^\s]+:\d+:\d+/);
    return match ? match[0] : "N/A";
  };

  const getLevelBadge = (level) => {
    const badgeStyle = {
      fontSize: "13px",
      padding: "5px 14px",
      borderRadius: "8px",
    };

    switch (level.toLowerCase()) {
      case "error":
        return <Badge bg="danger" style={badgeStyle}>ERROR</Badge>;
      case "warn":
        return <Badge bg="warning" text="dark" style={badgeStyle}>WARNING</Badge>;
      case "info":
        return <Badge bg="info" style={badgeStyle}>INFO</Badge>;
      default:
        return <Badge bg="secondary" style={badgeStyle}>{level.toUpperCase()}</Badge>;
    }
  };

  // Pagination logic

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="d-flex align-items-center mt-4 justify-content-center">
      <Dropdown show={open} onToggle={() => setOpen(!open)} style={{ width: "100%" }} className="mx-6" >
        <Dropdown.Toggle variant="secondary" id="logs-dropdown" className="px-4 py-2">
          {loading ? "Loading Logs..." : "📜 View Logs"}
        </Dropdown.Toggle>

        <Dropdown.Menu style={{ width: "100%", padding: "10px", marginTop: "5px",boxShadow: "none",}}>
          {loading ? (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : logs.length > 0 ? (
          
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover borderless className="mb-0 table-centered text-nowrap">
                  <thead className="table-light text-secondary">
                    <tr>
                      <th>ID</th>
                      <th>Level</th>
                      <th>Message</th>
                      <th>Function</th>
                      <th>Page</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{getLevelBadge(log.level)}</td>

                        {/* Message Column - Hover on Badge to Show Full Message */}
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-message-${index}`}>{log.message}</Tooltip>}
                          >
                            <Badge bg="secondary" className="dots-badge cursor-pointer">...</Badge>
                          </OverlayTrigger>
                        </td>

                        <td>{log.function_name}</td>

                        {/* Page Column - Hover on Badge to Show Full Page Path */}
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-page-${index}`}>{extractFilePath(log.stack)}</Tooltip>}
                          >
                            <Badge bg="info" className="dots-badge cursor-pointer">...</Badge>
                          </OverlayTrigger>
                        </td>

                        <td>{formatDate(log.indate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-end px-3 py-2">
                <Pagination className="mb-0">
                  <Pagination.First
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {Array.from({ length: totalPages }, (_, index) => index + 1)
                    .filter(
                      (page) =>
                        page === currentPage ||
                        page === currentPage - 1 ||
                        page === currentPage + 1
                    )
                    .map((page) => (
                      <Pagination.Item
                        key={page}
                        active={page === currentPage}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
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
              </div>
            </Card.Body>

          ) : (
            <Dropdown.Item disabled className="text-center">No logs found</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LogsDropdown;
