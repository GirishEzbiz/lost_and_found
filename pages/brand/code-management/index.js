"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Badge,
  Tabs,
  Tab,
  Pagination,
  Toast,
} from "react-bootstrap";
import axios from "axios";
import { getAdminDetail } from "lib/getAdminDetail";
import { dateFormat } from "utils/dateFormat";
import { Spinner } from "react-bootstrap";
import Swal from "sweetalert2";

export default function QRManagementPage() {
  const PRICE_PER_QR = 10;
  const GST_RATE = 0.18;

  const brandUserData = getAdminDetail();
  const [qrs, setQrs] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [showBatchRenewModal, setShowBatchRenewModal] = useState(false);
  const [selectedBatchForRenewal, setSelectedBatchForRenewal] = useState(null);
  const [renewYears, setRenewYears] = useState(1);
  const [activeTab, setActiveTab] = useState("qrcodes");
  const [searchText, setSearchText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rloading, setRLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [fromRange, setFromRange] = useState("");
  const [toRange, setToRange] = useState("");
  const [countData, setCountData] = useState({
    active: "--",
    expired: "--",
    inactive: "--",
    total_codes: "--",
  });
  const [totalBatchCount, setTotalBatchCount] = useState(0);
  const [batchCurrentPage, setBatchCurrentPage] = useState(1);
  const itemsPerPage = 10;  // 
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const fetchQRs = async (filters = {}) => {
    try {
      const { status, search, page = 1, limit = 10 } = filters;

      const queryParams = new URLSearchParams({
        brandId: brandUserData.brand_id,
        page,
        limit,
      });

      if (status) queryParams.append("status", status);
      if (search) queryParams.append("search", search);

      const res = await axios.get(
        `/api/brand/qr_codes?${queryParams.toString()}`
      );
      setQrs(res.data.data || []);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching QRs:", err);
    }
  };
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleRenew = (qr) => {
    openBatchRenewModal(qr);
  };

  const handleConfirmAndPay = async () => {
    const { total } = calculateTotalCost();

    try {
      const orderRes = await axios.post("/api/brand/payment", {
        amount: total,
        currency: "INR", // Include currency here
      });

      const { orderId } = orderRes.data; // order.id from Razorpay

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total,
        currency: "INR",
        name: "QRiTagya",
        description: "QR Renewal Payment",
        order_id: orderId,
        handler: async function (response) {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
            response;

          const { total, rangeCount } = calculateTotalCost();

          const payload = {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            // batchId: selectedBatchForRenewal.id,
            years: renewYears,
            grandTotal: total,
            brand_id: brandUserData.brand_id,
            from: fromRange,
            to: toRange,
            total_qrs: rangeCount,
          };

          await axios.post("/api/brand/verifyPayment", payload);

          Swal.fire({
            icon: "success",
            title: "Payment Successful",
            text: "✅ Payment successful and batch renewed!",
            confirmButtonColor: "#3085d6",
          });
          setShowBatchRenewModal(false);
          fetchBatches(); // refresh batch
          if (activeTab === "qrcodes") fetchQRs(); // refresh qrs
        },

        prefill: {
          name: brandUserData?.name || "",
          email: brandUserData?.email || "",
          contact: brandUserData?.mobile || "",
        },
        theme: { color: "#624BFF" },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("❌ Payment Error:", error);
      Swal.fire({
        icon: "error",
        title: "Payment Failed",
        text: "Payment failed. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const fetchBatches = async (page = 1) => {
    try {
      const res = await axios.get(
        `/api/brand/qr_batches?brandId=${brandUserData.brand_id}&page=${page}&limit=${itemsPerPage}`
      );
      setBatchList(res.data.data || []);
      setTotalBatchCount(res.data.totalCount || 0);
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  // Handle Page Change for Batches
  const handleBatchPageChange = (page) => {
    setBatchCurrentPage(page);
    fetchBatches(page);
  };
  const totalBatchPages = Math.ceil(totalBatchCount / itemsPerPage);


  useEffect(() => {
    if (activeTab === "qrcodes") fetchQRs();
    if (activeTab === "batches") fetchBatches();
  }, [activeTab]);

  // On filter apply
  const handleSearch = async () => {
    if (!searchText.trim() && !selectedStatus) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setQrLoading(true);

    try {
      setCurrentPage(1);
      await fetchQRs({
        status: selectedStatus,
        search: searchText,
        page: 1,
        limit: itemsPerPage,
      });
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    setQrLoading(true);
    setCurrentPage(page);

    try {
      await fetchQRs({
        status: selectedStatus,
        search: searchText,
        page,
        limit: itemsPerPage,
      });
    } catch (error) {
      console.error("Page change failed:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const handleReset = async () => {
    if (!searchText && !selectedStatus) return;

    setSearchText("");
    setSelectedStatus("");
    setShowError(false);
    setQrLoading(true);

    try {
      await fetchQRs();
    } catch (error) {
      console.error("Reset failed:", error);
    } finally {
      setQrLoading(false);
    }
  };
  const handleCountClick = async () => {
    if (!fromRange || !toRange) {
      Toast("Please enter both From and To range");
      return;
    }

    try {
      const res = await axios.get("/api/brand/count", {
        params: {
          brandId: brandUserData.brand_id,
          from: fromRange,
          to: toRange,
        },
      });
      setCountData(res.data);
    } catch (error) {
      console.error("Error fetching QR counts", error);
    }
  };

  const statusColor = (status) => {
    if (status === "Expired") return "danger";
    if (status === "Expiring Soon") return "warning";
    return "success";
  };

  const openBatchRenewModal = (item) => {
    setRenewYears(1);

    const isBatch = item.start_sr_no && item.end_sr_no;

    if (isBatch) {
      setFromRange(item.start_sr_no || "");
      setToRange(item.end_sr_no || "");
    } else {
      setFromRange(item.serial_number || "");
      setToRange(item.serial_number || "");
    }

    setSelectedBatchForRenewal({
      ...item,
      total_qrs: isBatch ? item.total_qrs : 1,
    });

    setCountData({
      active: "--",
      expired: "--",
      inactive: "--",
      total_codes: "--",
    });
    setShowBatchRenewModal(true);
  };

  const calculateTotalCost = () => {
    const from = parseInt(fromRange);
    const to = parseInt(toRange);

    const rangeCount =
      !isNaN(from) && !isNaN(to) && from <= to ? to - from + 1 : 0;

    const base = rangeCount * PRICE_PER_QR * renewYears;
    const gst = base * GST_RATE;
    return { base, gst, total: base + gst, rangeCount };
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "95%" }}>
      <h3 className="mb-4">QR Code Management</h3>
      <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-3">
        <Tab eventKey="qrcodes" title={<span className="custom-tab-title">📋 QR Code List</span>} >
          <Row className="mb-3 g-2">
            <Col md={4}>
              <Form.Control
                placeholder="Search by QR Code or Serial"
                value={searchText}
                isInvalid={showError && !searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                Please enter QR Code or Serial
              </Form.Control.Feedback>
            </Col>

            <Col md={3}>
              <Form.Select
                value={selectedStatus}
                isInvalid={showError && !selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="expiring soon">Expiring Soon</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                Please select a status
              </Form.Control.Feedback>
            </Col>
            <Col md={3}>
              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={loading}
                  style={{ backgroundColor: "#A22191", color: "#fff", border: "none" }}
                >
                  {loading ? "Searching..." : "Search"}
                </Button>

                <Button
                  className="bg-gray-500 text-white border-0"
                  onClick={handleReset}
                  disabled={(!searchText && !selectedStatus) || rloading}
                >
                  {rloading ? "Resetting..." : "Reset"}
                </Button>
              </div>
            </Col>
          </Row>
          <div className="position-relative">
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              <table className="table align-middle mb-0">
                <thead
                  className="table-light"
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <tr className="text-center text-xs">
                    <th className="py-3 fw-semibold border-bottom">#</th>
                    <th className="py-3 fw-semibold border-bottom">QR Code</th>
                    <th className="py-3 fw-semibold border-bottom">Serial</th>
                    <th className="py-3 fw-semibold border-bottom">Batch</th>
                    <th className="py-3 fw-semibold border-bottom">Expiry</th>
                    <th className="py-3 fw-semibold border-bottom">Status</th>
                    <th className="py-3 fw-semibold border-bottom">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {qrs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        No QR Codes found
                      </td>
                    </tr>
                  ) : (
                    qrs.map((qr, idx) => {
                      const today = new Date();
                      const expiryDate = new Date(qr.expiry_date);
                      const daysLeft = Math.ceil(
                        (expiryDate - today) / (1000 * 60 * 60 * 24)
                      );

                      let statusLabel = "Inactive";
                      let badgeColor = "secondary";
                      let showRenew = false;

                      if (qr.status === 1) {
                        if (expiryDate < today) {
                          statusLabel = "Expired";
                          badgeColor = "danger";
                          showRenew = true;
                        } else if (daysLeft <= 14) {
                          statusLabel = "Expiring Soon";
                          badgeColor = "warning";
                          showRenew = true;
                        } else {
                          statusLabel = "Active";
                          badgeColor = "success";
                        }
                      }

                      return (
                        <tr key={qr.id} className="text-center">
                          <td className="py-3 border-top">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="py-3 border-top">{qr.qr_code}</td>
                          <td className="py-3 border-top">
                            {qr.serial_number}
                          </td>
                          <td className="py-3 border-top">{qr.batch_name}</td>
                          <td className="py-3 border-top">
                            {dateFormat(qr.expiry_date)}
                          </td>
                          <td className="py-3 border-top">
                            <Badge bg={badgeColor}>{statusLabel}</Badge>
                          </td>
                          <td className="py-3 border-top">
                            {showRenew && (
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleRenew(qr)}
                                >
                                  Renew
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {qrLoading && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75"
                style={{ zIndex: 10 }}
              >
                <Spinner animation="border" variant="primary" />
                <div className="mt-2 text-primary fw-semibold">
                  Fetching QR Codes...
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center px-2 py-3">
            <p className="mb-0 text-nowrap">Total QR Codes: {totalCount}</p>

            <Pagination className="mb-0 custom-pagination">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {(() => {
                const pageItems = [];
                const start = Math.max(1, currentPage);
                const end = Math.min(totalPages, currentPage + 1);

                for (let i = start; i <= end; i++) {
                  pageItems.push(
                    <Pagination.Item
                      key={i}
                      active={i === currentPage}
                      onClick={() => handlePageChange(i)}
                    >
                      {i}
                    </Pagination.Item>
                  );
                }

                return pageItems;
              })()}

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


          <style jsx global>
            {`

/* Targets ONLY the active pagination item */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191 !important; /* Force override */
  border: none !important;
  color: white !important;
}

/* Explicitly set styles for inactive items (optional) */
.custom-pagination .page-item:not(.active) .page-link {
  background-color:  #f8f9fa!important; /* Or your default color */
  color: #000; /* Default text color */
}

/* Override tab title color */
.custom-tab-title {
  color: #a22191!important; /* Force override Bootstrap styles */

}


    `}
          </style>

        </Tab>

        <Tab eventKey="batches"  title={<span className="custom-tab-title">📦 Batch Management</span>} >
    

          <style>
            {`
      /* For WebKit (Chrome, Edge, Safari) */
::-webkit-scrollbar {
  height: 8px;
  width: 9px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Light background */
}

::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;  /* Light gray handle */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
    `}
          </style>

          <div className="" style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table align-middle mb-0">
              <thead
                className="table-light"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 100,
                  backgroundColor: "#f8f9fa",
                }}
              >
                <tr className="text-center text-xs">
                  <th className="py-3 fw-semibold border-bottom">#</th>
                  <th className="py-3 fw-semibold border-bottom">Batch</th>
                  <th className="py-3 fw-semibold border-bottom">
                    Serial Range
                  </th>
                  <th className="py-3 fw-semibold border-bottom">Expiry</th>
                  <th className="py-3 fw-semibold border-bottom">Total QRs</th>
                  <th className="py-3 fw-semibold border-bottom">Action</th>
                </tr>
              </thead>
              <tbody>
                {batchList.map((batch, index) => (
                  <tr key={batch.id} className="text-center">
                    <td className="py-3 border-top">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-3 border-top">{batch.batch_name}</td>
                    <td className="py-3 border-top">
                      {batch.start_sr_no} - {batch.end_sr_no}
                    </td>
                    <td className="py-3 border-top">
                      {dateFormat(batch.expiry_date)}
                    </td>
                    <td className="py-3 border-top">{batch.total_qrs}</td>
                    <td className="py-3 border-top">
                      <div className="d-flex justify-content-center">
                        <Button
                          size="sm"
                          variant=""
                          style={{ borderColor: "#A22191", color: "#A22191" }}
                          onClick={() => openBatchRenewModal(batch)}
                        >
                          Renew
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center px-2 py-3">
            <Pagination className="mb-0 custom-pagination">
              <Pagination.First
                onClick={() => handleBatchPageChange(1)}
                disabled={batchCurrentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handleBatchPageChange(batchCurrentPage - 1)}
                disabled={batchCurrentPage === 1}
              />
              {/* Generate page numbers */}
              {(() => {
                const pageItems = [];
                const startPage = Math.max(1, batchCurrentPage - 2); // Show 2 previous pages
                const endPage = Math.min(totalBatchPages, batchCurrentPage + 2); // Show 2 next pages

                for (let i = startPage; i <= endPage; i++) {
                  pageItems.push(
                    <Pagination.Item
                      key={i}
                      active={i === batchCurrentPage}
                      onClick={() => handleBatchPageChange(i)}
                     
                    >
                      {i}
                    </Pagination.Item>
                  );
                }

                return pageItems;
              })()}

              <Pagination.Next
                onClick={() => handleBatchPageChange(batchCurrentPage + 1)}
                disabled={batchCurrentPage === totalBatchPages}
              />
              <Pagination.Last
                onClick={() => handleBatchPageChange(totalBatchPages)}
                disabled={batchCurrentPage === totalBatchPages}
              />
            </Pagination>

          </div>
        </Tab>
      </Tabs>

      <Modal
        show={showBatchRenewModal}
        onHide={() => setShowBatchRenewModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedBatchForRenewal?.start_sr_no &&
              selectedBatchForRenewal?.end_sr_no
              ? "Renew Batch"
              : "Renew Code"} 
            : {selectedBatchForRenewal?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  value={fromRange}
                  onChange={(e) => setFromRange(e.target.value)}
                  readOnly={activeTab === "qrcodes"}
                  size="sm"
                />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Control
                  type="text"
                  value={toRange}
                  onChange={(e) => setToRange(e.target.value)}
                  readOnly={activeTab === "qrcodes"}
                  size="sm"
                />
              </Form.Group>
            </Col>
          </Row>
          {activeTab === "batches" && (
            <Row className="align-items-center mb-3">
              <Col
                xs={12}
                className="d-flex justify-content-between align-items-center"
              >
                <Button
                  className="py-1 px-3 bg-gray-500 border-0"
                  size="sm"
                  style={{ outline: "none", boxShadow: "none" }}
                  onClick={handleCountClick}
                >
                  Count
                </Button>

                <div className="small text-muted d-flex gap-3">
                  <div>
                    <strong>Total Renewable codes:</strong>{" "}
                    {countData.total_codes}
                  </div>
                </div>
              </Col>
            </Row>
          )}
          <div>
            <p className="mb-3 ">
              QR Price: ₹{PRICE_PER_QR} x {calculateTotalCost().rangeCount} QRs
              x {renewYears} year(s)
            </p>
            <p>GST (18%): ₹{calculateTotalCost().gst.toFixed(2)}</p>
            <h5>Total Payable: ₹{calculateTotalCost().total.toFixed(2)}</h5>
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Duration (Years)</Form.Label>
            <Form.Select
              value={renewYears}
              onChange={(e) => setRenewYears(Number(e.target.value))}
            >
              <option value={1}>1 Year</option>
              <option value={2}>2 Years</option>
              <option value={3}>3 Years</option>
            </Form.Select>
          </Form.Group>
          <div>
            <h5>Total Payable: ₹{calculateTotalCost().total.toFixed(2)}</h5>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBatchRenewModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmAndPay}>
            Confirm & Pay
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
