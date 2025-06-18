import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Form,
  OverlayTrigger,
  Popover,
  Badge,
  Pagination,
  Modal,
  Alert,
} from "react-bootstrap";
import Link from "next/link";
import Swal from "sweetalert2";
import { utils, writeFile } from "xlsx";

import ToastNotification from "../../components/ToastNotification"; // Import the Toast component
import axios from "axios";
import { MdOutlineMessage, MdOutlineUpdate } from "react-icons/md";

import { FiChevronsLeft, FiChevronsRight, FiRefreshCcw } from "react-icons/fi";
import Cookies from "js-cookie";
import StatusUpdateModal from "pages/components/StatusUpdateModal";
import BrandCodeMinig from "./brandCodeMining";
import { FaDownload, FaRegClipboard } from "react-icons/fa";
import DownloadQR from "./DownloadQR";
import Image from "next/image";
import AddTemplateModal from "components/AddTemplateModal";
import GetPermission from "utils/getpermissions";

const CodeMinig = () => {
  const [loading, setLoading] = useState(false);
  const [codeMiningData, setCodeMiningData] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [showUpdateSection, setShowUpdateSection] = useState(false);
  const [loadingSkuId, setLoadingSkuId] = useState();
  const [qrData, setQrdata] = useState({});
  const [ids, setIds] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [fetchloading, setFetchLoading] = useState();
  const [formData, setFormData] = useState({
    fromRange: "",
    toRange: "",
    status: "",
  });
  const [loadingsub, setLoadingSub] = useState();
  const [toastVariant, setToastVariant] = useState("success");
  const [tokenData, setTokenData] = useState();
  const [userData, setUserData] = useState();
  const [modalOpen, setModalOpen] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [permissions, setPermissions] = useState({
    canAdd: false,

  });
  useEffect(() => {
    setPermissions({
      canAdd: GetPermission("add-template"),

    });
  }, []);

  // Inside your CodeMinig component
  const [showModal, setShowModal] = useState(false);
  const [showModalStatus, setShowModalStatus] = useState(false);
  const [modalData, setModalData] = useState({
    id: "",
    billingDate: "",
    invoiceDetails: "",
  }); // You can use this to store data to show in the modal

  let { billingDate, invoiceDetails } = modalData;

 
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleCloseStatusUpdate = () => {
    setShowModalStatus(false);
  };

  const handleCloseModalStatus = () => setShowModalStatus(false);

 

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit"); // Number of items per page

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const brand_id = tokenData?.brand_id;
  const fetchCodeMiningData = async () => {
    try {
      setLoading(true);

      // const response = await fetch("/api/admin/codeMining");
      const response = await fetch(
        `/api/admin/codeMining?brand_id=${brand_id}&page=${currentPage}&limit=${itemsPerPage}`
      );

      // const data = await response.json();
      // console.log(data)

      // setCodeMiningData(data);

      // if (tokenData) {
      //   let filteredData = data.filter(
      //     (d, i) => d.brand_id === tokenData?.brand_id
      //   );

      //   setCodeMiningData(data);
      // }

      const result = await response.json();

      if (result?.data) {
        setCodeMiningData(result.data); // Only paginated data
        setTotalPages(Math.ceil(result.total / itemsPerPage)); // update total pages
        setTotalCount(result.total);
      }
    } catch (error) {
      console.log("error fetching skus", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (tokenData) {
      fetchCodeMiningData();
    }
  }, [tokenData, currentPage]);

  // console.log(formData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // if (value !== "") {
    //   // Call saveStatus with the fromRange, toRange, and selected status
    //   handleStatusUpdate(formData.fromRange, formData.toRange, Number(value));
    // }
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;

    setModalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFetchQR = async (type, filters) => {


    let { brand, sku, fromRange, toRange } = filters;

    if (type == "sku_brand") {
      let idss = codeMiningData
        .filter((da) => da.brand_id === brand && da.sku_id == sku)
        .map((da) => da.id)
        .join(",");


      setIds(idss);

      const response = await fetch(`/api/admin/fetchQR?ids=${idss}`);

      const qr = await response.json();

      setQrdata(qr);
    }
  };

  const handleSaveModal = async (e) => {
    e.preventDefault();
    setLoadingSub(true);
    try {
      let data = await fetch("/api/admin/codeMining?action=updateBilling", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingDate: billingDate, // Ensure modalData has these properties
          invoiceDetails: invoiceDetails,
          id: modalData.id,
        }),
      });
      handleCloseModal();
      // console.log("datass", data);
    } catch (error) {
      console.log("error updateing billings", error);
    } finally {
      setLoadingSub(false); // Reset loading state
    }
  };

  const handleStatusUpdate = async (type, data) => {

    const allData = {
      type: type,
      data: data,
      ids: ids,
    };


    try {
      const response = await axios.patch("/api/admin/fetchQR", allData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Show success alert

      handleCloseModalStatus();
    } catch (error) {
      console.log("error updateing status", error);
    }
  };

  const deleteCodeMining = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/codeMining?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setToastMessage("Code mining data deleted successfully!");
        setToastVariant("success");
        setShowToast(true);
        // Optimistically remove the deleted mining from the list
        setCodeMiningData((prevSkus) =>
          prevSkus.filter((mining) => mining.id !== id)
        );
      } else {
        // Handle different error scenarios more clearly
        const errorData = await response.json();
        setToastMessage(
          errorData.message ||
          "Error deleting code mining data. Please try again."
        );
        setToastVariant("danger");
        setShowToast(true);
      }
    } catch (error) {
      console.log("error deleteing codemining data", error);

      setToastMessage(
        "Error deleting code mining data. Please check your internet connection."
      );
      setToastVariant("danger");
      setShowToast(true);
    } finally {
      setLoading(false); // Reset the loading state
    }
  };

  const handleDeleteClick = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete this data. Do you want to proceed?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCodeMining(id);
      }
    });
  };


  

  return (
    <>
    
        <Container fluid className="p-2" style={{ width: "95%" }}>
          <Row className="align-items-center my-2">
            <Col>
              <h3>Template Management</h3>
            </Col>
          </Row>

          <Card className="shadow-sm">
            <Card.Header>
              {/* Status Change Button */}

              {/* {tokenData?.role == 12 && (
                <Button variant="outline-dark" onClick={handleShowModalStatus}>
                  Change Status <MdOutlineUpdate className="ms-2 fs-4" />
                </Button>
              )} */}

              {/* <Col className="text-end "> */}
              <div className="float-end">
                {/* <Link href="/admin/code-mining/create" passHref> */}
                {
                  permissions.canAdd && (
                    <Button variant="primary" onClick={() => setModalOpen(true)} style={{background:"#a22191",border:"none",color:"white"}} >
                      + Add Template
                    </Button>
                  )
                }

                {/* </Link> */}
              </div>

              <StatusUpdateModal
                show={showModalStatus}
                handleFetchQR={handleFetchQR}
                fetchloading={fetchloading}
                setFetchLoading={setFetchLoading}
                qrData={qrData}
                handleClose={handleCloseStatusUpdate}
                handleInputChange={handleInputChange}
                handleUpdate={handleStatusUpdate}
                formData={formData}
              />
              <p className="mt-2">Showing {codeMiningData?.length} out of {totalCount}</p>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="d-flex justify-content-center my-5 s">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : codeMiningData?.length === 0 ? (
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
                          {/* <th>Template Id</th> */}
                          <th>Template Name</th>
                          <th>Sku Name</th>
                          <th>Brand Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {codeMiningData?.map((template, index) => (
                          <tr key={template?.id}>
                            <td>{index + 1}</td>
                            {/* <td>
                              <Link
                                href={`/admin/batchs?batchId=${template?.id}`}
                              >
                                {template?.id}
                              </Link>
                            </td> */}
                            <td>{template?.template_name || "-"}</td>
                            <td>{template?.sku_name || "-"}</td>
                            <td>{template?.brand_name || "-"}</td>
                            
                          </tr>
                        ))}

                        {/* Modal */}
                        <Modal show={showModal} onHide={handleCloseModal}>
                          <Modal.Header closeButton>
                            <Modal.Title>Update Billing</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            {/* You can display more information about the template */}
                            {/* Display billing date and invoice details at the top */}
                            {modalData.billingDate && (
                              <Alert variant="info">
                                <strong>Billing Date:</strong>{" "}
                                {new Date(
                                  modalData.billingDate
                                ).toLocaleDateString()}
                              </Alert>
                            )}

                            {modalData.invoiceDetails && (
                              <Alert variant="success">
                                <strong>Invoice Details:</strong>{" "}
                                {modalData.invoiceDetails}
                              </Alert>
                            )}

                            <Form>
                              {/* Billing Date Field */}
                              <Form.Group
                                className="mb-3"
                                controlId="billingDate"
                              >
                                <Form.Label>Billing Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="billingDate"
                                  value={billingDate}
                                  onChange={handleModalChange}
                                  required
                                />
                              </Form.Group>

                              {/* Invoice Details Field */}
                              <Form.Group
                                className="mb-3"
                                controlId="invoiceDetails"
                              >
                                <Form.Label>Invoice Details</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={3}
                                  name="invoiceDetails"
                                  value={invoiceDetails}
                                  onChange={handleModalChange}
                                  placeholder="Enter invoice details..."
                                  required
                                />
                              </Form.Group>

                              {/* Add buttons or other elements as needed */}
                            </Form>
                          </Modal.Body>
                          <Modal.Footer>
                            <Button
                              variant="secondary"
                              onClick={handleCloseModal}
                            >
                              Close
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={handleSaveModal}
                              disabled={loadingsub}
                            >
                              {loadingsub ? "Submittinggg..." : "Submit"}
                            </Button>

                            {/* You can add actions like save here if needed */}
                          </Modal.Footer>
                        </Modal>
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
                        >
                          {/* <FiChevronsLeft size="18px" /> */}
                        </Pagination.First>
                        <Pagination.Prev
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          {/* <FiChevronsLeft size="18px" /> */}
                        </Pagination.Prev>
                        {[...Array(2)].map((_, index) => {
                          const page = Math.max(1, currentPage - 1) + index;
                          if (page > totalPages) return null;
                          return (
                            <Pagination.Item
                              key={page}
                              active={page === currentPage}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Pagination.Item>
                          );
                        })}
                        <Pagination.Next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          {/* <FiChevronsRight size="18px" /> */}
                        </Pagination.Next>
                        <Pagination.Last
                          onClick={() => handlePageChange(totalPages)}
                          disabled={currentPage === totalPages}
                        >
                          {/* <FiChevronsRight size="18px" /> */}
                        </Pagination.Last>
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

          <AddTemplateModal
            showModal={modalOpen}
            onClose={() => setModalOpen(false)}
            onSuccess={() => {
              fetchCodeMiningData(); // or refresh logic
              setToastVariant("success");
              setToastMessage("Template added successfully");
              setShowToast(true);
            }}
          />
        </Container>
     
    </>
  );
};

export default CodeMinig;
