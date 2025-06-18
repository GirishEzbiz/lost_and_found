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
} from "react-bootstrap";
import Link from "next/link";
import Swal from "sweetalert2";

import ToastNotification from "../../components/ToastNotification"; // Import the Toast component
import axios from "axios";
import { MdOutlineMessage, MdOutlineUpdate } from "react-icons/md";

import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import Cookies from "js-cookie";
import StatusUpdateModal from "pages/components/StatusUpdateModal";
import RenewCodeMiningModal from "./Renewcodeminding";
import RazorpayButton from "./RazorPayButton";
import Image from "next/image";

const BrandCodeMinig = () => {
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
  const [toastVariant, setToastVariant] = useState("success");
  const [tokenData, setTokenData] = useState();
  const [userData, setUserData] = useState();
  // Inside your CodeMinig component
  const [showModal, setShowModal] = useState(false);
  const [showModalStatus, setShowModalStatus] = useState(false);
  const [modalData, setModalData] = useState({
    id: "",
    billingDate: "",
    invoiceDetails: "",
  }); // You can use this to store data to show in the modal
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewModalData, setRenewModalData] = useState({
    id: "",
    renewalDate: "",
    remarks: "",
  });
  let { billingDate, invoiceDetails } = modalData;

  const handleShowModal = (templateId) => {
    setModalData({
      id: templateId,
    }); // Store template or any other data to show inside the modal
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const handleCloseStatusUpdate = () => {
    setShowModalStatus(false);
  };

  const handleShowRenewModal = (templateId) => {
    ("Opening Renew Modal for ID:", templateId); // Debugging ke liye
    setRenewModalData({ id: templateId });
    setShowRenewModal(true);
  };
  
  
  const handleCloseRenewModal = () => {
    setShowRenewModal(false);
  };
  const handleShowModalStatus = () => setShowModalStatus(true);
  const handleCloseModalStatus = () => setShowModalStatus(false);

  const handleInputChangeStatus = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 

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
      console.log("error fetching token",error);
      return null;
  }
  }

  useEffect(() => {
    setTokenData(decodeJWT(Cookies.get("adminToken")));
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Cookies.get("Page-limit");; // Number of items per page

  const totalPages = Math.ceil(codeMiningData.length / itemsPerPage);
  const paginatedData = codeMiningData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchCodeMiningData = async () => {
    try {
      setLoading(true);

      // const response = await fetch("/api/admin/codeMining");
      const response = await fetch(
        `/api/admin/codeMining?brand_id=${tokenData?.brand_id}`
      );

      const data = await response.json();
      // console.log(data)

      // setCodeMiningData(data);

      if (tokenData) {
        let filteredData = data.filter(
          (d, i) => d.brand_id === tokenData?.brand_id
        );

        setCodeMiningData(data);
      }
    } catch (error) {
      console.log("error fetching skus",error);
  } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    // if(tokenData){

    fetchCodeMiningData();

    // }
  }, [tokenData]);

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
    // console.log("modalData", modalData);

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
      // console.log("datass", data);
    } catch (error) {
      console.log("error fetching qr data",error);
  }
  };

  const handleStatusUpdate = async (type, data) => {

    const allData = {
      type: type,
      data: data,
      ids: ids,
    };
    ("allData", allData);

    try {
      const response = await axios.patch("/api/admin/fetchQR", allData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Success",
        text: response.data.message,
      });

      // ("Status updated successfully:", response.data);

      handleCloseModalStatus();
    } catch (error) {
      console.log("error updateing status",error);
  
      Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Something went wrong!",
      });
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
      console.log("error deleteing codemining data",error);
  
      setToastMessage("Error deleting code mining data. Please check your internet connection.");
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

  // const formatDate = (dateString) => {
  //   const date = new Date(dateString);

  //   const day = String(date.getDate()).padStart(2, "0"); // Day (dd)
  //   const month = String(date.getMonth() + 1).padStart(2, "0"); // Month (mm)
  //   const year = date.getFullYear(); // Year (yyyy)

  //   let hours = date.getHours(); // Hours (H)
  //   const minutes = String(date.getMinutes()).padStart(2, "0"); // Minutes (i)

  //   const isAM = hours < 12; // AM/PM
  //   hours = hours % 12 || 12; // Convert 24-hour format to 12-hour format

  //   const ampm = isAM ? "AM" : "PM"; // AM/PM

  //   return `${day}/${month}/${year} `; // Return formatted date
  // };

  const generateQR = async (temp_id) => {
    // console.log("temp_id", temp_id);

    try {
      const allData = {
        temp_id: temp_id,
      };
      setLoadingSkuId(temp_id);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allData),
      };
      const response = await fetch("/api/admin/generateQr", requestOptions);
      ("response", response);

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "QR Code Generated",
          text: "The QR code has been successfully generated.",
        });
        fetchCodeMiningData();
        setLoadingSkuId();
      } else {
        const error = await response.json();
        setError(error.message || "There was an error saving the generate Qr.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "There was an error generating the QR code.",
        });
      }
    } catch (error) {
      ("error geanrateing qr codes",error);
  
      Swal.fire({
          icon: "error",
          title: "Error",
          text: "There was an error generating the QR code.",
      });
  } finally {
      setLoadingSkuId();
    }
  };

  const handleStatusButton = () => {
    setShowUpdateSection((prev) => !prev);
  };

  return (
    <>
      <Container fluid className="p-2">
        <Row className="align-items-center my-2">
          <Col>
            <h3>Brand Code Management</h3>
          </Col>
        </Row>
        <Card className="shadow-sm">
  <Card.Body className="p-0">
    {loading ? (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    ) : codeMiningData?.length === 0 ? (
      <div className="text-center my-5">
       <Image
  src="/images/not-found.png"
  alt="No data available"
  className="mb-3"
  width={200} // Set a fixed width
  height={200} // Set a fixed height (adjust as needed)
  style={{ maxWidth: "200px", width: "100%" }}
/>
        <h5 className="text-muted">No Templates Found</h5>
        <p className="text-secondary d-inline">
          We couldn’t find any Templates matching your criteria. Try adjusting your filters or adding a new Template.
        </p>
        <Link href="/admin/code-mining/create" passHref>
          <span className="text-primary fw-bold ms-2 text-decoration-underline">
            + Add New
          </span>
        </Link>
      </div>
    ) : (
      <>
        <div
          className="table-responsive"
          style={{
            maxHeight: paginatedData?.length > 7 ? "300px" : "none", // ✅ Show vertical scroll only when rows > 7
            overflowY: paginatedData?.length > 7 ? "auto" : "visible", // ✅ Enable scrolling if more than 7 rows
            overflowX: "hidden", // ❌ No horizontal scrolling
          }}
        >
          <table
            className="table text-nowrap table-centered mt-0"
            style={{ width: "100%" }}
          >
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
                <th className="text-inherit">ID</th>
                <th>Sku Name</th>
                <th>From Range</th>
                <th>To Range</th>
                <th>Details</th>
                <th>Date</th>
                <th>Expiry Date</th>
                <th>Action</th>
                {tokenData.role !== 0 && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedData?.map((template, index) => (
                <tr key={template?.id}>
                  <td>{index + 1}</td>
                  <td>{template?.sku_name || "-"}</td>
                  <td>{template?.from_range || "-"}</td>
                  <td>{template?.to_range || "-"}</td>
                  <td className="text-center">
                    <OverlayTrigger
                      placement="left"
                      overlay={
                        <Popover id={`popover-${template?.id}`}>
                          <Popover.Header as="h3">Template Details</Popover.Header>
                          <Popover.Body>
                            <ul className="list-unstyled mb-0 list-group list-group-flush">
                              <li className="list-group-item d-flex justify-content-between">
                                <span>Activated Brands:</span>
                                <span className="text-success">{template?.total_brand_activated}</span>
                              </li>
                              <li className="list-group-item d-flex justify-content-between">
                                <span>Generated Codes:</span>
                                <span className="text-success">{template?.total_code_generated}</span>
                              </li>
                              <li className="list-group-item d-flex justify-content-between">
                                <span>Total Initiated:</span>
                                <span className="text-success">{template?.total_initiated}</span>
                              </li>
                              <li className="list-group-item d-flex justify-content-between">
                                <span>Published Printed:</span>
                                <span className="text-success">{template?.total_printed_published}</span>
                              </li>
                            </ul>
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <Badge pill bg="primary" className="me-1 fs-5">
                        <MdOutlineMessage />
                      </Badge>
                    </OverlayTrigger>
                  </td>
                  <td>{new Date(template.indate).toLocaleDateString()}</td>
                  <td>{new Date(template.service_to).toLocaleDateString()}</td>
                  <td>
                    <Button
                      variant="secondary"
                      className="btn-sm"
                      onClick={() => handleShowRenewModal(template?.id)}
                    >
                      Renew
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {tokenData?.role == 12 && (
                        <>
                          <Link
                            href={`/admin/code-mining/edit/${template?.id}`}
                            className="text-success"
                          >
                            Edit
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteClick(template?.id)}
                          >
                            Delete
                          </Button>
                          {loadingSkuId === template?.id ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => generateQR(template?.id)}
                            >
                              Generate QR
                            </Button>
                          )}
                        </>
                      )}
                      {tokenData.role == 32 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleShowModal(template?.id)}
                        >
                          Update
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="justify-content-between align-items-center row p-3">
          <div className="col-md-5 col-sm-12">
            <p>Total Data: {codeMiningData?.length}</p>
          </div>
          <div className="col-md-7 col-sm-12">
            <Pagination className="justify-content-end mb-0">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
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
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
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

        <RenewCodeMiningModal
          show={showRenewModal}
          handleClose={handleCloseRenewModal}
          tokenData={tokenData}
          id={renewModalData.id}
        />
      </Container>
    </>
  );
};

export default BrandCodeMinig;
