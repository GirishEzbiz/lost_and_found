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
import Link from "next/link";
import { FaDownload } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { utils, writeFile } from "xlsx";
import AddBatchModal from "components/AddBatchModal";
import Swal from "sweetalert2";
import GetPermission from "utils/getpermissions";
import Cookies from "js-cookie";
import batchs from "pages/api/admin/batchs";

export default function Batchs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [batches, setBatches] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tokenData, setTokenData] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = Cookies.get("Page-limit") || 10;
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingBatchId, setLoadingBatchId] = useState(null);
  const [permissions, setPermissions] = useState({
    canAdd: false,
    batchAction: false

  });



  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-batch"),
      batchAction: GetPermission("batch-actions")

    });
  }, []);


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


  let user_id = tokenData?.id

  useEffect(() => {
    getBatches();
  }, [currentPage]);

  const getBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/batchs?page=${currentPage}&limit=${pageSize}`
      );
      const data = await response.json();
      setBatches(data.batches || []);

      setTotalCount(data.total || 0);
    } catch (error) {
      console.error("Fetch error:", error);
      if (error.response) {
        setToastVariant("danger");
        setToastMessage(error.response.data.message);
        setShowToast(true);
      } else {
        setToastVariant("danger");
        setToastMessage("Failed to fetch code batches");
        setShowToast(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const generateQR = async (batchId, brandId, skuId, fromRange, toRange) => {
    // setLoadingBatchId(batchId);


    let payload = {
      batch_id: batchId,
      brand_id: brandId,
      process_status: 1,
      user_id,
    };
    console.log("Generating QR Payload:", payload); // ✅ debug
    try {
      const res = await fetch(`/api/admin/generateQrByBatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.log("Save error:", err);
      setError("Error saving the batch.");
    } finally {
      setLoadingBatchId(null);

      getBatches();
    }


  };




  // const qrDownload = async (batchId) => {
  //   setLoadingBatchId(batchId);
  //   const link = document.createElement("a");
  //   link.href = `/api/admin/download-csv?batch_id=${batchId}`;
  //   link.setAttribute("download", `batch_${batchId}_qr_codes.csv`);
  //   document.body.appendChild(link);
  //   link.click();
  //   link.remove();
  //   setTimeout(() => {
  //     setLoadingBatchId(null); // Remove loader after short delay
  //   }, 1000);
  // };

const qrDownload = async (batchId, batchName) => {

  setLoadingBatchId(batchId);
  const link = document.createElement("a");

  // ✅ Send all as query parameters
  link.href = `/api/admin/download-csv?batch_id=${batchId}&batch_name=${encodeURIComponent(batchName)}`;
  link.setAttribute("download", `batch_${batchId}_qr_codes.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    setLoadingBatchId(null);
  }, 1000);
};


  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>Batch Management</h3>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
          <div className="float-end">
            {/* <Link href="/admin/batchs/AddBatch" passHref> */}

            {
              permissions.canAdd && (
                <Button variant="primary" onClick={() => setModalOpen(true)} style={{ background: "#a22191", border: "none", color: "white" }}>
                  + Add Batch
                </Button>
              )
            }

            {/* </Link> */}
          </div>
          <p className="mt-2">Showing {batches.length} out of {totalCount}</p>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center my-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center my-5">
              <h5 className="text-muted">Data Not Found</h5>
            </div>
          ) : (
            <>
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
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
                      <th className="text-inherit">#</th>
                      <th>Batch ID</th>
                      <th>Batch Name</th>
                      <th>Total Codes</th>
                      <th>From Range - To Range</th>
                      <th>Expiry Date</th>
                      {
                        permissions.batchAction && (

                          <th>Actions</th>
                        )
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch, index) => (
                      <tr key={batch?.id}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>

                        <td>
                          <Link href={``}>{batch?.id}</Link>
                        </td>
                        <td>{batch?.batch_name || "-"}</td>
                        <td>{batch?.total_codes || "-"}</td>
                        <td>
                          {batch?.start_sr_no || "-"} -{" "}
                          {batch?.end_sr_no || "-"}
                        </td>
                        <td>
                          {batch?.expiry_date
                            ? new Date(batch.expiry_date).toLocaleDateString(
                              "en-IN"
                            )
                            : "-"}
                        </td>
                        <td>
                          {
                            permissions.batchAction && (
                              <div className="d-flex align-items-center gap-2">
                                {tokenData?.role == 12 && (
                                  <>
                                    {batch?.process_status === 1 ? (
                                      // If batch.process_status is 1, show the "Download" button
                                      <div
                                        className="btn btn-success btn-icon btn-sm rounded-circle texttooltip"
                                        onClick={() => qrDownload(batch?.id, batch?.batch_name)}
                                        title="Download Qr Batch"
                                        disabled={loadingBatchId === batch?.id}
                                      >
                                        {loadingBatchId === batch?.id ? (
                                          <span className="spinner-border spinner-border-sm" />
                                        ) : (
                                          <FaDownload />
                                        )}
                                      </div>
                                    ) : (
                                      // If batch.process_status is not 1, show the "Generate" button
                                      <div
                                        className="btn btn-secondary btn-sm texttooltip"
                                        onClick={() => generateQR(batch?.id, batch.brand_id, batch.sku_id, batch?.start_sr_no, batch?.end_sr_no)}
                                        disabled={loadingBatchId === batch?.id}
                                      >
                                        {loadingBatchId === batch?.id ? (
                                          <span className="spinner-border spinner-border-sm me-1" />
                                        ) : (
                                          <FiRefreshCcw />
                                        )}
                                        &nbsp; Generate
                                      </div>
                                    )}
                                  </>
                                )}
                                {tokenData.role == 32 && (
                                  <>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      onClick={() => handleShowModal(template?.id)} // Trigger modal
                                    >
                                      Update
                                    </Button>
                                  </>
                                )}
                              </div>
                            )
                          }

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="justify-content-between align-items-center row p-3">
                <div className="col-md-5 col-sm-12">

                </div>
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
                            <Pagination.Ellipsis
                              key={`ellipsis-${page}`}
                              disabled
                            />
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

      <AddBatchModal
        showModal={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          getBatches(); // or refresh logic
          setToastVariant("success");
          setToastMessage("Batch added successfully");
          setShowToast(true);
        }}
        batches={batches}
      />
    </Container>
  );
}
