// import Cookies from 'js-cookie';
// import React, { useState } from 'react';
// import { Form, Button, Row, Col, Card, Container, Table, Pagination } from 'react-bootstrap';
// import Swal from 'sweetalert2';

// export default function ManageHelpDesk() {
//   const [showStatus, setShowStatus] = useState(false);
//   const [selectedCodeType, setSelectedCodeType] = useState('');
//   const [codeInput, setCodeInput] = useState('');
//   const [fetchdata, setFetchData] = useState(null);
//   const handleSelectChange = (event) => {
//     setSelectedCodeType(event.target.value);
//   };
//   const [totalPages, setTotalPages] = useState(0); // State to hold total pages
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalRecord, setTotalRecord] = useState(0);

//   const pageLimit = Number(Cookies.get('Page-limit')) || 20; // Default to 20 if not set in cookies

//   const [scanData, setScanData] = useState([]);

//   const handleShowStatus = async () => {
//     if (selectedCodeType === '') {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Info',
//         text: 'Please select a code type',
//       });
//       return;
//     }

//     if (codeInput.trim() === '') {
//       Swal.fire({
//         icon: 'warning',
//         title: 'Missing Info',
//         text: 'Please enter a code',
//       });
//       return;
//     }

//     try {
//       let data = await fetch(`/api/admin/manage-helpdesk`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           codeType: selectedCodeType,
//           codeInput: codeInput,
//           page: currentPage,  // Send current page to backend
//           limit: pageLimit,  // Set limit to 20 per page
//         }),
//       });

//       let response = await data.json();
//       console.log("Response:", response);
//       setFetchData(response.data);
//       setScanData(response.scanData);
//       setTotalPages(response.totalPages);  // Set total pages from response
//       setTotalRecord(response.totalCount)
//       console.log(codeInput.trim() !== '')

//       if (codeInput.trim() !== '') {
//         setShowStatus(true);
//       }
//     } catch (error) {
//       console.error('Error in fetching data:', error);
//     }
//   };

//   const handlePageChange = (newPage) => {
//     setCurrentPage(newPage);
//     handleShowStatus();  // Fetch data for the new page
//   };

//   return (
//     <Container fluid className="my-5 " style={{ width: '95%' }}>
//       <h3 className="mb-4 fw-semibold">Manage Helpdesk</h3>

//       <Card className="p-4 bg-light border-0 mb-4">
//         <Row className="g-3 align-items-end">
//           <Col md={4}>
//             <Form.Label className="fw-normal text-dark">Select Code Type:</Form.Label>
//             <Form.Select value={selectedCodeType} onChange={handleSelectChange}>
//               <option value="" hidden>Select Code Type</option>
//               <option value={"code"}>Code</option>
//               <option value={"mobile"}>Mobile</option>
//               <option value={"serial"}>Serial Number</option>
//             </Form.Select>
//           </Col>

//           <Col md={5}>
//             <Form.Label className="fw-normal text-dark">Enter Value</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter Code"
//               value={codeInput}
//               onChange={(e) => setCodeInput(e.target.value)}
//             />
//           </Col>

//           <Col md={3}>
//             <Button variant="primary" className="w-100" onClick={handleShowStatus}>
//               Show Status
//             </Button>
//           </Col>
//         </Row>
//       </Card>

//       {showStatus && (
//         <Row className="g-3">
//           <Col md={6}>
//             <Card className=" p-3" style={{ backgroundColor: '#BFDBFE' }}>
//               <p><strong>PRS Status:</strong> {fetchdata?.status === 1 ? "Active" : "Inactive"}</p>
//               <p><strong>Allocation:</strong> {new Date(fetchdata?.created_at).toLocaleDateString()}</p>
//               <p><strong>Activation:</strong> {new Date(fetchdata?.registration_date).toLocaleDateString()}</p>
//               <p><strong>Expiry Dt:</strong> {new Date(fetchdata?.expiry_date).toLocaleDateString()}
//               </p>
//               <p><strong>Used Date:</strong> 0000-00-00 00:00:00</p>
//             </Card>
//           </Col>
//           <Col md={6}>
//             <Card className=" p-3" style={{ backgroundColor: '#BFDBFE' }}>
//               <p><strong>SKU Name:</strong> {fetchdata?.sku_name}</p>
//               <p><strong>Batch #:</strong> {fetchdata?.batch_name}</p>
//               <p><strong>Serial #:</strong> {fetchdata?.serial_number}</p>
//               <p><strong>Series:</strong> N/A</p>
//               <p><strong>Allocation Points:</strong> N/A</p>
//             </Card>
//           </Col>
//           {scanData && scanData.length > 0 ? (
//             <Col md={12}>

//               <div className="table-container">
//               <span>
//                   Showing { scanData.length} out of {totalRecord}
//                 </span>
//                 <Table className="custom-table">
//                   <thead className="table-light text-center sticky-header">
//                     <tr>
//                       <th>#</th>
//                       <th>Status</th>
//                       <th>Location</th>
//                       <th>Scan Date</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {scanData.map((item, index) => (
//                       <tr key={index} className="text-center">
//                         <td>{(currentPage - 1) * pageLimit + (index + 1)}</td>  {/* Dynamic Row Index */}

//                         <td>{item.status}</td>
//                         <td>{item.city && item.country ? `${item.city}, ${item.country}` : "N/A"}</td>
//                         <td>
//                           {new Date(item.scan_timestamp).toLocaleDateString("en-IN", {
//                             day: "2-digit",
//                             month: "short",
//                             year: "numeric",
//                           })}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//               <div className=" d-flex justify-content-end ">

//                 <Pagination className="mb-0">
//                   <Pagination.First
//                     onClick={() => handlePageChange(1)}
//                     disabled={currentPage === 1}
//                   />
//                   <Pagination.Prev
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                   />

//                   {/* Display previous, current, and next pages */}
//                   {[...Array(3)].map((_, index) => {
//                     const pageToShow = currentPage + index - 1;  // Show previous, current, and next pages
//                     if (pageToShow >= 1 && pageToShow <= totalPages) {
//                       return (
//                         <Pagination.Item
//                           key={pageToShow}
//                           active={pageToShow === currentPage}
//                           onClick={() => handlePageChange(pageToShow)}
//                         >
//                           {pageToShow}
//                         </Pagination.Item>
//                       );
//                     }
//                     return null;
//                   })}

//                   <Pagination.Next
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                   />
//                   <Pagination.Last
//                     onClick={() => handlePageChange(totalPages)}
//                     disabled={currentPage === totalPages}
//                   />
//                 </Pagination>

//               </div>
//             </Col>
//           ) : (
//             <Col md={12}>
//               <div className="text-center fw-normaltext-primary pt-2">
//                 No scan history found.
//               </div>
//             </Col>
//           )}
//         </Row>
//       )}

//       <style>{`
//       .table-container {
//   max-height: 400px; /* Adjust height as needed */
//   overflow-y: auto;
//   border-bottom: 1px solid #dee2e6; /* Apply only bottom border */
// }

// .custom-table {
//   border-collapse: collapse !important;
// }

// .custom-table thead th {
//   position: sticky;
//   top: 0;
//   background-color: #e8edf1  !important; /* Bootstrap table-light color */
//   z-index: 2;
//   border-bottom: 1px solid #dee2e6 !important; /* Only bottom border for the header */
//   border-left: none !important;
//   border-right: none !important;
// }

// .custom-table tbody td {
//   border: none !important; /* Remove borders from tbody cells */
//   border-bottom: 1px solid #dee2e6 !important; /* Apply only bottom border to each row */
// }

// .table-container::-webkit-scrollbar {
//   width: 8px;

// }

// .table-container::-webkit-scrollbar-thumb {
//   background-color: #c1c1c1;
//   border-radius: 4px;
// }

// .table-container::-webkit-scrollbar-track {
//   background-color: #f1f1f1;
// }

//       `}

//       </style>
//     </Container>
//   );
// }

// import {
//   FaHeadset, FaQrcode, FaBoxOpen, FaHistory, FaUserFriends, FaSearch,
//   FaMobileAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaMapMarkerAlt
// } from 'react-icons/fa';
// import { BsBoxSeam, BsShieldCheck, BsQrCodeScan } from 'react-icons/bs';
// import { FiClock, FiUser, FiPackage } from 'react-icons/fi';
// react icon

import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Image,
  InputGroup,
} from "react-bootstrap";

import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { dateFormat } from "utils/dateFormat";
import { BsBoxSeam, BsQrCodeScan, BsShieldCheck } from "react-icons/bs";
import {
  FaHeadset,
  FaQrcode,
  FaBoxOpen,
  FaHistory,
  FaUserFriends,
  FaSearch,
  FaMobileAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaUserCircle,
  FaEnvelope,
} from "react-icons/fa";
// import { FaCalendarAlt, FaCheckCircle, FaHistory, FaMapMarkerAlt, FaMobileAlt, FaQrcode, FaTimesCircle, FaUserFriends } from 'react-icons/fa';
import { FiClock, FiPackage, FiUser } from "react-icons/fi";

const Helpdesk = () => {
  const [showStatus, setShowStatus] = useState(false);
  const [selectedCodeType, setSelectedCodeType] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [fetchdata, setFetchData] = useState(null);
  const handleSelectChange = (event) => {
    setSelectedCodeType(event.target.value);
  };
  const [totalPages, setTotalPages] = useState(0); // State to hold total pages
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecord, setTotalRecord] = useState(0);

  const pageLimit = Number(Cookies.get("Page-limit")) || 20; // Default to 20 if not set in cookies

  const [scanData, setScanData] = useState([]);

  const handleShowStatus = async () => {
    if (selectedCodeType === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Info",
        text: "Please select a code type",
      });
      return;
    }

    if (codeInput.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Missing Info",
        text: "Please enter a code",
      });
      return;
    }

    try {
      let data = await fetch(`/api/admin/manage-helpdesk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codeType: selectedCodeType,
          codeInput: codeInput,
          page: currentPage, // Send current page to backend
          limit: pageLimit, // Set limit to 20 per page
        }),
      });

      let response = await data.json();
      console.log("Response:", response.message);
      if (response.message) {
        setFetchData(response.message);
        return;
      }

      setFetchData(response.data);
      setScanData(response.scanData);
      setTotalPages(response.totalPages); // Set total pages from response
      setTotalRecord(response.totalCount);
      console.log(codeInput.trim() !== "");

      if (codeInput.trim() !== "") {
        setShowStatus(true);
      }
    } catch (error) {
      console.error("Error in fetching data:", error);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    handleShowStatus(); // Fetch data for the new page
  };

  return (
    <Container
      className="py-4 px-lg-1 helpdesk-dashboard"
      style={{ maxWidth: "90%" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0 fw-normaltext-dark">Manage Helpdesk</h3>
      </div>

      <Card
        className="border-0 shadow-sm mb-4"
        style={{ backgroundColor: "#f8f9fa", borderRadius: "0.75rem" }}
      >
        <Card.Body className="p-4">
          <Row className="g-3 align-items-end">
            {/* Code Type Dropdown */}
            <Col xs={12} md={3}>
              <Form.Label className="fw-semibold text-secondary mb-1">
                Code Type
              </Form.Label>
              <Form.Select
                size="md"
                className="border-2 border-primary shadow-sm rounded-2"
                style={{ height: "44px" }}
                value={selectedCodeType}
                onChange={handleSelectChange}
              >
                <option value="" hidden>
                  Select Code Type
                </option>
                <option value="serial">Serial Number</option>
                <option value="code">QR Code</option>
                <option value="mobile">Reference Number</option>
              </Form.Select>
            </Col>

            {/* Code Input with QR Icon and Divider */}
            <Col xs={12} md={6}>
              <Form.Label className="fw-semibold text-secondary mb-1">
                Enter Value
              </Form.Label>
              <div
                style={{
                  display: "flex",
                  maxWidth: "350px", // reduced width
                  height: "44px",
                  border: "2px solid #6366f1",
                  borderRadius: "0.375rem",
                  overflow: "hidden",
                  boxShadow: "0 0 6px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Icon Section */}
                <div
                  style={{
                    backgroundColor: "#6366f1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 12px",
                  }}
                >
                  <BsQrCodeScan
                    style={{ color: "#ffffff", fontSize: "20px" }}
                  />
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#dee2e6",
                    marginTop: "8px",
                    marginBottom: "8px",
                  }}
                />

                {/* Input Section */}
                <input
                  type="text"
                  placeholder="Enter QR Code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "0 12px",
                    fontSize: "14px",
                  }}
                />
              </div>
            </Col>

            {/* Show Status Button */}
            <Col xs={12} md={3} className="text-center text-md-start">
              <Button
                variant="primary"
                size="md"
                className="w-100 rounded-2"
                style={{ height: "44px" }}
                onClick={handleShowStatus}
              >
                Show Status
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Dashboard */}
      {fetchdata !== "No data found" ? (
        <>
          {showStatus && (
            <Row className="g-3">
              <Col lg={6}>
                <Card className="h-auto border-0 shadow-sm">
                  <Card.Header className="border-0 bg-white py-2 px-3">
                    <div className="d-flex align-items-center">
                      <div className="bg-opacity-10 p-1 rounded-circle me-2">
                        <FaQrcode className="text-primary fs-4" />
                      </div>
                      <h5
                        className="mb-0 fw-semibold text-dark"
                        style={{ fontSize: "1rem" }}
                      >
                        QR Code Details
                      </h5>
                    </div>
                  </Card.Header>

                  <Card.Body className="p-2">
                    {" "}
                    {/* Reduced padding for compactness */}
                    <Row className="g-1">
                      {" "}
                      {/* Reduced gap between columns */}
                      {/* SKU */}
                      <Col xs={12} md={6} className="mb-1">
                        {" "}
                        {/* Reduced bottom margin */}
                        <div className="d-flex align-items-center rounded p-2 bg-light">
                          <div className="bg-opacity-10 p-1 rounded me-2">
                            <BsBoxSeam className="text-primary fs-5" />
                          </div>
                          <div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.85rem" }}
                            >
                              SKU
                            </small>
                            <span className="fw-normal text-dark">
                              {fetchdata?.sku_name}
                            </span>
                          </div>
                        </div>
                      </Col>
                      {/* Batch */}
                      <Col xs={12} md={6} className="mb-1">
                        <div className="d-flex align-items-center rounded p-2 bg-light">
                          <div className="bg-opacity-10 p-1 rounded me-2">
                            <FiPackage className="text-primary fs-5" />
                          </div>
                          <div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Batch
                            </small>
                            <span className="fw-normal text-dark">
                              {fetchdata?.batch_name}
                            </span>
                          </div>
                        </div>
                      </Col>
                      {/* Serial */}
                      <Col xs={12} md={6} className="mb-1">
                        <div className="d-flex align-items-center rounded p-2 bg-light">
                          <div className="bg-opacity-10 p-1 rounded me-2">
                            <FaQrcode className="text-primary fs-5" />
                          </div>
                          <div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Serial
                            </small>
                            <span className="fw-normal text-dark">
                              {fetchdata?.serial_number}
                            </span>
                          </div>
                        </div>
                      </Col>
                      {/* Status */}
                      <Col xs={12} md={6} className="mb-1">
                        <div className="d-flex align-items-center rounded p-2 bg-light">
                          <div className="bg-opacity-10 p-1 rounded me-2">
                            <BsShieldCheck className="text-primary fs-5" />
                          </div>
                          <div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Status
                            </small>
                            {fetchdata?.qr_code_status == 1 ? (
                              <Badge
                                pill
                                bg="success"
                                className="px-2 py-1"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Active
                              </Badge>
                            ) : (
                              <Badge
                                pill
                                bg="danger"
                                className="px-2 py-1"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Col>
                      {/* Activation Date */}
                      <Col xs={12} md={6} className="mb-1">
                        <div className="d-flex align-items-center rounded p-2 bg-light">
                          <div className="bg-opacity-10 p-1 rounded me-2">
                            <FaCalendarAlt className="text-primary fs-5" />
                          </div>
                          <div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Activation
                            </small>
                            <span
                              className="fw-normal text-dark"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {dateFormat(fetchdata?.registration_date)}
                            </span>
                          </div>
                        </div>
                      </Col>
                      {/* Expiry Date */}
                      <Col xs={12} md={6} className="mb-1">
                        <div className="d-flex align-items-center rounded p-2 bg-light">
                          <div className="bg-opacity-10 p-1 rounded me-2">
                            <FiClock className="text-primary fs-5" />
                          </div>
                          <div>
                            <small
                              className="text-muted d-block"
                              style={{ fontSize: "0.85rem" }}
                            >
                              Expiry
                            </small>
                            <span
                              className="fw-normal text-dark"
                              style={{ fontSize: "0.85rem" }}
                            >
                              {dateFormat(fetchdata?.expiry_date)}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={6}>
                <Card
                  className="border-0 shadow-sm rounded-4"
                  style={{ height: "258px", overflow: "hidden" }}
                >
                  <Card.Body className="p-3 d-flex flex-column h-100">
                    {/* Row 1: Linked Item heading only */}
                    <div
                      className="d-flex align-items-center mb-2"
                      style={{ whiteSpace: "nowrap" }}
                    >
                      <FaMobileAlt className="text-primary me-2 fs-5" />
                      <h6
                        className="mb-0 fw-semibold text-dark"
                        style={{ fontSize: "1rem" }}
                      >
                        {fetchdata.item_name
                          ? "  Linked Item"
                          : "Not Linked to any item"}
                      </h6>
                    </div>

                    {/* Row 2: Image + all text content aligned horizontally */}
                    <div className="d-flex flex-grow-1 gap-3">
                      {/* Left: Image */}
                      {fetchdata.item_name && (
                        <>
                          <div
                            style={{ width: "110px", flexShrink: 0 }}
                            className="d-flex justify-content-center  pt-2"
                          >
                            <Image
                              src={fetchdata?.image_url}
                              alt={fetchdata?.item_name}
                              className="rounded-3 border"
                              style={{
                                width: "110%",
                                height: "190px",
                                objectFit: "cover",
                              }}
                            />
                          </div>

                          {/* Right: All other text content */}
                          <div className="flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                              <div className="d-flex align-items-center mb-1">
                                <span
                                  className="text-muted me-2"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  Item:
                                </span>
                                <span
                                  className="fw-medium text-dark"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  {fetchdata?.item_name || "My Water Bottle"}
                                </span>
                              </div>

                              <div>
                                <span
                                  className="text-muted me-2"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  Category:
                                </span>
                                <Badge
                                  bg="light"
                                  text="dark"
                                  className="px-2 py-1"
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {fetchdata?.category_name || "Laptop"}
                                </Badge>
                              </div>
                            </div>
                            <div className="d-flex flex-column gap-1">
                              {fetchdata?.user_name && (
                                <div className="d-flex align-items-center">
                                  <FaUserCircle className="text-muted me-2" />
                                  <span
                                    className="text-dark"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    {fetchdata?.user_name}
                                  </span>
                                </div>
                              )}
                              {fetchdata?.user_mobile && (
                                <div className="d-flex align-items-center">
                                  <FaMobileAlt className="text-muted me-2" />
                                  <span
                                    className="text-dark"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    {fetchdata?.user_mobile}
                                  </span>
                                </div>
                              )}
                              {fetchdata?.user_email && (
                                <div className="d-flex align-items-center">
                                  <FaEnvelope className="text-muted me-2" />
                                  <span
                                    className="text-dark"
                                    style={{ fontSize: "0.8rem" }}
                                  >
                                    {fetchdata?.user_email}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-1 pe-3">
                              <div>
                                <small
                                  className="text-muted d-block"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  Linked On
                                </small>
                                <span
                                  className="fw-medium text-dark"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {dateFormat(fetchdata?.created_at) ||
                                    "20/5/2025"}
                                </span>
                              </div>
                              <div
                                className="d-flex align-items-center gap-1"
                                style={{ paddingRight: "10px" }}
                              >
                                <small
                                  className="text-muted"
                                  style={{ fontSize: "0.75rem" }}
                                >
                                  Brand:
                                </small>
                                <span
                                  className="fw-semibold text-dark"
                                  style={{ fontSize: "0.8rem" }}
                                >
                                  {fetchdata?.brand_name ||
                                    "Ezbiz Technologies"}
                                </span>
                              </div>
                            </div>

                            {/* Item Name & Category */}

                            {/* Owner Info */}

                            {/* Linked On + Brand (Bottom Row) */}
                          </div>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Scan History - Compact Table */}
              <Col lg={12}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="border-0 bg-white py-2 px-3">
                    <div className="d-flex align-items-center">
                      <div className=" bg-opacity-10 p-2 rounded-circle me-2">
                        <FaHistory className="text-primary fs-4" />
                      </div>
                      <h5 className="mb-0 fw-semibold text-dark">
                        Scan History
                      </h5>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table borderless hover className="mb-0">
                        <thead className="small bg-light">
                          <tr>
                            <th className="ps-3">#</th>
                            <th>Status</th>
                            <th>Location</th>
                            <th className="pe-3">Scan Date</th>
                          </tr>
                        </thead>

                        <tbody className="small">
                          {scanData?.length > 0 &&
                            scanData?.map((data, index) => (
                              <tr>
                                <td className="ps-3">1</td>
                                <td>
                                  {data.status == "OK" ? (
                                    <Badge
                                      pill
                                      bg="success"
                                      className="d-inline-flex align-items-center py-1 px-2"
                                    >
                                      <FaCheckCircle
                                        className="me-1"
                                        size={12}
                                      />
                                      OK
                                    </Badge>
                                  ) : (
                                    <Badge
                                      pill
                                      bg="danger"
                                      className="d-inline-flex align-items-center py-1 px-2"
                                    >
                                      <FaTimesCircle
                                        className="me-1"
                                        size={12}
                                      />
                                      NOT OK
                                    </Badge>
                                  )}
                                </td>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <FaMapMarkerAlt
                                      className="me-1 text-danger"
                                      size={12}
                                    />
                                    {data.city},{data.state}
                                  </div>
                                </td>
                                <td className="pe-3">
                                  {dateFormat(data.scan_timestamp)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                  <Card.Footer className="border-0 bg-white py-1 px-3 small text-muted">
                    Total Records: {scanData?.length}
                  </Card.Footer>
                </Card>
              </Col>

              {/* Finder History - Compact Table */}
              <Col lg={6} className="d-none">
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="border-0 bg-white py-2 px-3">
                    <div className="d-flex align-items-center">
                      <div className=" bg-opacity-10 p-2 rounded-circle me-2">
                        <FaUserFriends className="text-primary fs-5" />
                      </div>
                      <h6 className="mb-0 fw-semibold">Finder History</h6>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div className="table-responsive">
                      <Table borderless hover className="mb-0">
                        <thead className="small bg-light">
                          <tr>
                            <th className="ps-3">#</th>
                            <th>Finder</th>
                            <th>Mobile</th>
                            <th>Message</th>
                            <th className="pe-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="small">
                          <tr>
                            <td className="ps-3">1</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FiUser className="me-1" size={12} />
                                Amit
                              </div>
                            </td>
                            <td>9876543210</td>
                            <td>Found near gate</td>
                            <td className="pe-3">
                              <Badge
                                pill
                                bg="success"
                                className="d-inline-flex align-items-center py-1 px-2"
                              >
                                <FaCheckCircle className="me-1" size={12} />
                                Verified
                              </Badge>
                            </td>
                          </tr>
                          <tr>
                            <td className="ps-3">2</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FiUser className="me-1" size={12} />
                                Ravi
                              </div>
                            </td>
                            <td>9123456780</td>
                            <td>Left on seat</td>
                            <td className="pe-3">
                              <Badge
                                pill
                                bg="secondary"
                                className="d-inline-flex align-items-center py-1 px-2"
                              >
                                <FaTimesCircle className="me-1" size={12} />
                                Unverified
                              </Badge>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                  <Card.Footer className="border-0 bg-white py-1 px-3 small text-muted">
                    Showing 2 of 2 records
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Card
          className="border-0 shadow-sm rounded-4 text-center"
          style={{ height: "258px", overflow: "hidden" }}
        >
          <Card.Body className="p-3 d-flex flex-column align-items-center justify-content-center h-100">
            {/* Flaticon QR Not Found Icon */}
            <img
              src="https://cdn-icons-png.flaticon.com/128/5058/5058040.png"
              alt="QR Not Found"
              style={{ width: "60px", height: "60px", marginBottom: "10px" }}
            />

            <h5 className="text-danger fw-bold mb-1">NO DATA FOUND</h5>
            <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
              The QR code you scanned does not exist or is invalid.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Custom CSS */}
      <style jsx>{`
        .helpdesk-dashboard {
          // background-color: #f8f9fa;
        }
        .product-image-container {
          position: relative;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          min-height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
          flex: 0 0 150px;
        }
        .product-image {
          max-height: 100px;
          object-fit: contain;
        }
        .product-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 3px 8px;
          font-size: 0.7rem;
        }
        .table-responsive {
          max-height: 250px;
          overflow-y: auto;
        }
        @media (max-width: 767.98px) {
          .product-image-container {
            flex: 0 0 100%;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default Helpdesk;
