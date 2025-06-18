import {
  Card,
  Col,
  Container,
  Row,
  Spinner,
  Pagination,
  Badge,
  OverlayTrigger,
   Tooltip
} from "react-bootstrap";
import { useEffect, useState } from "react";
import ToastNotification from "pages/components/ToastNotification";
import Cookies from "js-cookie";

export default function EmailWhatsappLogs() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = Cookies.get("Page-limit") || 10;

 


const fetchLogs = async (page) => {
  setLoading(true);
  try {
    const response = await fetch(
      `/api/admin/email-whatsapp-delivery?page=${page}&limit=${pageSize}`
    );
    const data = await response.json();

    if (Array.isArray(data.logs)) {
      const formattedLogs = data.logs.map((log) => ({
        id: log.id,
        action: log.action,
        channel: log.channel === "email" ? "Email" : "WhatsApp",
        type: log.type,
        message: log.message,
        status: log.status === "success" ? "OK" : "Not OK",
        duration: `${Math.floor(Number(log.duration) / 1000)}s`,
      }));

      setLogs(formattedLogs);
      setTotalCount(data.total || 0);
    } else {
      throw new Error("Invalid logs format");
    }
  } catch (error) {
    console.error("Error fetching logs:", error);
    setToastMessage("Failed to fetch logs");
    setToastVariant("danger");
    setShowToast(true);
  } finally {
    setLoading(false);
  }
};




 useEffect(() => {
  fetchLogs(currentPage);
}, [currentPage]);


  const totalPages = Math.ceil(totalCount / pageSize);
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Email / WhatsApp Delivery Logs</h3>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
          <p className="mt-2">
            Showing {logs.length} out of {totalCount}
          </p>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center my-5">
              <h5 className="text-muted">No logs found</h5>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
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
                      <th>Action</th>
                      <th>Channel</th>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{log.action}</td>
                        <td>{log.channel}</td>
                        <td>{log.type}</td>
                        <td>
  <OverlayTrigger
    placement="top"
    overlay={
      <Tooltip id={`tooltip-message-${log.id}`}>
        {log.message}
      </Tooltip>
    }
  >
    <span
      style={{
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block",
        maxWidth: "150px",
      }}
    >
      {log.message}
    </span>
  </OverlayTrigger>
</td>

                        <td>
                          <Badge bg={log.status === "OK" ? "success" : "danger"}>
                            {log.status}
                          </Badge>
                        </td>
                        <td>{log.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="justify-content-between align-items-center row p-3">
                <div className="col-md-5 col-sm-12"></div>
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
