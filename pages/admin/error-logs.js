import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import {
  OverlayTrigger,
  Tooltip,
  Dropdown,
  Spinner,
  Table,
  Badge,
  Pagination,
  Card,
} from "react-bootstrap";

const LogsDropdown = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [errorTypes, setErrorTypes] = useState([]);
  const [selectedError, setSelectedError] = useState(null); // Initially null to indicate no selection

  const itemsPerPage = parseInt(Cookies.get("Page-limit") || "10");

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/test`);
      const result = await response.json();
      const logData = result.data || [];
      setLogs(logData);
      setTotalPages(result.total_pages || 1);

      // Extract short error type names
      const types = [
        ...new Set(
          logData.map((log) => {
            const msg = log.message?.toLowerCase() || "";
            const func = log.function_name?.toLowerCase() || "";

            if (msg.includes("whatsapp") || func.includes("whatsapp")) return "WhatsApp Error";
            if (msg.includes("login") || func.includes("login")) return "Login Error";
            if (msg.includes("otp") || func.includes("otp")) return "OTP Error";
            if (msg.includes("network") || func.includes("network")) return "Network Error";
            if (func.includes("payment")) return "Payment Error"; // ✅ NEW
            if (func.includes("process")) return "Processing Error"; // Optional
            return "Other";
          })
        ),
      ];
      setErrorTypes(types);
    } catch (error) {
      console.error("❌ Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorFilter = (errorType) => {
    setSelectedError(errorType);
    const filtered = logs.filter((log) => {
      const msg = log.message?.toLowerCase() || "";
      const func = log.function_name?.toLowerCase() || "";

      if (errorType === "WhatsApp Error") return msg.includes("whatsapp") || func.includes("whatsapp");
      if (errorType === "Login Error") return msg.includes("login") || func.includes("login");
      if (errorType === "OTP Error") return msg.includes("otp") || func.includes("otp");
      if (errorType === "Network Error") return msg.includes("network") || func.includes("network");
      if (errorType === "Payment Error") return func.includes("payment");
      if (errorType === "Processing Error") return func.includes("process");
      return true;
    });

    setFilteredLogs(filtered);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}/${String(
      date.getMonth() + 1
    ).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const extractFilePath = (stack) => {
    const match = stack?.match(/\/pages\/[^\s]+:\d+:\d+/);
    return match ? match[0] : "N/A";
  };

  const getLevelBadge = (level) => {
    const badgeStyle = {
      fontSize: "13px",
      padding: "5px 14px",
      borderRadius: "8px",
      color: "#475569",
    };

    switch (level.toLowerCase()) {
      case "error":
        return (
          <Badge bg="none" style={badgeStyle}>
            ERROR
          </Badge>
        );
      case "warn":
        return (
          <Badge bg="warning" text="dark" style={badgeStyle}>
            WARNING
          </Badge>
        );
      case "info":
        return (
          <Badge bg="info" style={badgeStyle}>
            INFO
          </Badge>
        );
      default:
        return (
          <Badge bg="secondary" style={badgeStyle}>
            {level.toUpperCase()}
          </Badge>
        );
    }
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid mt-4" style={{ width: "95%"}}>
      {/* Dropdown stays at top */}
      <div className="d-flex justify-content-start mb-3">
        <Dropdown onToggle={(isOpen) => setOpen(isOpen)}>
          <Dropdown.Toggle
            variant="secondary"
            id="logs-dropdown"
            className="px-4 py-2"
          >
            {loading ? "Loading Logs..." : "📜 Select Error Type"}
          </Dropdown.Toggle>

          <Dropdown.Menu className="p-2">
            <Dropdown.Item
              onClick={() => {
                setSelectedError(null);
                setFilteredLogs([]);
              }}
              active={selectedError === null}
            >
              🚫 Clear Selection
            </Dropdown.Item>

            {errorTypes.map((type, idx) => (
              <Dropdown.Item
                key={idx}
                onClick={() => handleErrorFilter(type)}
                active={selectedError === type}
              >
                {type}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Table is always visible below the dropdown */}
      <Card>
        <Card.Header>
          Showing logs for: <strong>{selectedError || "None selected"}</strong>
        </Card.Header>
        <Card.Body className="p-0 co">
          {/* <div className="table-responsive">
            <div   className="mt-4 px-2 px-md-5 w-100"  style={{ maxWidth: "100%", marginBottom: "120px" }}>
              <Table hover responsive className="mb-0 text-center w-100">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Level</th>
                    <th>Message</th>
                    <th>Function</th>
                    <th>Page</th>
                    <th>Date</th>
                  </tr>
                </thead>   
                <tbody>
                  {selectedError ? (
                    filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{index + 1}</td>
                          <td>{getLevelBadge(log.level)}</td>

                      
                          <td>
                            <Badge bg="none" style={{ whiteSpace: "normal", color: "#475569" }}>
                              {log.message || "N/A"}
                            </Badge>
                          </td>

                          <td>{log.function_name}</td>

                         
                          <td>
                            <Badge bg="none" style={{ whiteSpace: "normal", color: "#475569" }}>
                              {extractFilePath(log.stack)}
                            </Badge>
                          </td>

                          <td>{formatDate(log.indate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No logs for this error
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Please select an error type above ☝️
                      </td>
                    </tr>
                  )}
                </tbody>

              </Table>
            </div>

          </div> */}

<div className="table-responsive">
  <div
    className="mt-4 px-2 px-md-5 w-100"
    style={{
      width: "100vw",              // full screen width
      marginLeft: "-1rem",         // adjust Bootstrap default gutter
      marginRight: "-1rem",        // adjust Bootstrap default gutter
      marginBottom: "120px",
      maxHeight: "350px",          // vertical scroll height
      overflowY: "auto",           // enable scroll
      position: "relative",
    }}
  >
    <table className="table mb-0 text-center w-100">
      <thead
        className="table-light"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: "#f8f9fa",
        }}
      >
                  <tr>
                    <th>#</th>
                    <th>Level</th>
                    <th>Message</th>
                    <th>Function</th>
                    <th>Page</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedError ? (
                    filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <tr key={log.id}>
                          <td>{index + 1}</td>
                          <td>{getLevelBadge(log.level)}</td>

                          {/* ✅ Message */}
                          <td>
                            <Badge
                              bg="none"
                              style={{
                                whiteSpace: "normal",
                                color: "#475569",
                              }}
                            >
                              {log.message || "N/A"}
                            </Badge>
                          </td>

                          <td>{log.function_name}</td>

                          {/* ✅ Page */}
                          <td>
                            <Badge
                              bg="none"
                              style={{
                                whiteSpace: "normal",
                                color: "#475569",
                              }}
                            >
                              {extractFilePath(log.stack)}
                            </Badge>
                          </td>

                          <td>{formatDate(log.indate)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No logs for this error
                        </td>
                      </tr>
                    )
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Please select an error type above ☝️
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


        </Card.Body>
      </Card>
    </div>
  );
};

export default LogsDropdown;
