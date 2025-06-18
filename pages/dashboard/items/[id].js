import React, { useEffect, useState, useRef } from "react";
import GoBack, { BackButton } from "../backButton";

import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoDownload,
  IoPencil,
  IoPrint,
  IoQrCode,
} from "react-icons/io5";
import { useRouter } from "next/router";
import Loading from "utils/Loading";
import Image from "next/image";
// import QRCode from "react-qr-code"; // Import QR Code Library
// import html2canvas from "html2canvas"; // For QR download
import jsPDF from "jspdf"; // For QR print
import html2canvas from "html2canvas";
import { QRCode } from "react-qrcode-logo";
import ReactDOM, { createRoot } from "react-dom/client";
import { apiRequest } from "utils/apiRequest";
import Cookies from "js-cookie";

const ItemDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [itemData, setItemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showRecoverModal, setShowRecoverModal] = useState(false); // Recovery confirmation modal







  const [isSubmitting, setIsSubmitting] = useState(false);
  const qrRef = useRef(); // Reference for QR code

  useEffect(() => {
    if (id) {
      fetchItems();
    }
   
  }, [id]);

console.log("itemData", itemData);
  // conosle.log("Item ID from query:", itemData); // Debuggin

  useEffect(() => {
    const unique_user_id = Cookies.get("unique_user_id");
    if (unique_user_id) {
      fetchUserDetails(unique_user_id);
    }
  }, []);

  const fetchUserDetails = async (unique_user_id) => {
    try {
      const dd = await apiRequest("/api/user/userDetails", "", "GET");

      console.log("Fetched user details:", dd.user);
      const userDetails = dd.user;

      if (!userDetails || !userDetails.full_name || !userDetails.email || !userDetails.mobile) {
        throw new Error("User details are incomplete.");
      }

      // All good — now pass to update function
      updateScanData({
        unique_user_id,
        name: userDetails.full_name,
        mobile: userDetails.mobile,
        role: "Item_Owner",
      });

    } catch (error) {
      console.error("Error fetching user details:", error.message);
    }
  };

  const updateScanData = async (payload) => {
    try {
      console.log("Updating with payload:", payload);

      const response = await fetch("/api/scan-page/updatescandata", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      Cookies.remove("unique_user_id")
      if (!response.ok) {
        throw new Error("Failed to update scan data.");
      }

      console.log("Scan data updated successfully!");

    } catch (error) {
      console.error("Error updating scan data:", error.message);
    }
  };




  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/getItems?item_id=${id}`);
      const data = await response.json();
      setItemData(data[0]);
    } catch (error) {
      console.log("error fetching items", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (id) => {
    router.push(`/dashboard/editItem/${id}`);
  };

  const handleUpdateItemStatus = async (status) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/updateItemStatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id, status }),
      });

      if (response.ok) {
        setItemData((prev) => ({
          ...prev,
          is_lost: status === "lost" ? 1 : 0,
          is_found: status === "found" ? 1 : 0,
        }));
      } else {
        console.error(`Failed to mark item as ${status}`);
      }
    } catch (error) {
      // Log it to the console for immediate visibility
      console.error("Error updating item status:", error);
    } finally {
      setIsSubmitting(false);
      setShowModal(false);
      setShowRecoverModal(false);
      fetchItems();
    }
  };
  const qrBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const handleDownloadQR = async () => {
    // QR code render karne ke liye ek container create karo
    const qrContainer = document.createElement("div");
    document.body.appendChild(qrContainer);

    const qr_id = itemData?.qr_code_id;

    // React element ko container me render karo
    const root = ReactDOM.createRoot(qrContainer);
    root.render(<QRCode value={`${qrBaseUrl}/qr/${qr_id}`} size={256} />);

    // Short delay do taaki QR render ho sake
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Ab container ka screenshot lo
    const canvas = await html2canvas(qrContainer);
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `QR_Code_${id}.png`;
    link.click();

    // Cleanup: container remove kar do
    document.body.removeChild(qrContainer);
  };

  const handlePrintQR = async () => {
    const qrContainer = document.createElement("div");
    document.body.appendChild(qrContainer);
    const qr_id = itemData?.qr_code_id;
    const root = createRoot(qrContainer);
    root.render(<QRCode value={`${qrBaseUrl}/qr/${qr_id}`} size={256} />);

    // Wait for the QR code to actually render
    setTimeout(async () => {
      const canvas = await html2canvas(qrContainer);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 15, 40, 180, 180);
      pdf.autoPrint();
      window.open(pdf.output("bloburl"), "_blank");

      root.unmount();
      document.body.removeChild(qrContainer);
    }, 500); // delay to ensure QR is rendered
  };


  const handleBack = () => {
    // Navigate directly to the dashboard page
    router.push("/dashboard/items"); // Adjust the URL if necessary
  };

  return (
    <>
      {/* navbar */}
      <div className="d-flex align-items-center bg-white p-3">
        {/* <GoBack /> */}
        <BackButton onClick={handleBack} />
        <div className="w-100">
          <h4 className="mb-0" style={{ marginLeft: "1%" }}>
            Item Detail
          </h4>
        </div>
      </div>

      <div className="container my-4">
        <div className="row">
          <div className="col">
            <div className=" ">
              <div className="p-3  ">
                {loading ? (
                  <Loading />
                ) : (
                  <div className="row">
                    <style>{`

    .enhanced-image {
    border-radius: 10px;
    // border: 1px solid black !important; 
    box-shadow: 0 5px 15px rgba(13, 110, 253, 0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
  }

  .enhanced-image:hover {
    // transform: scale(1.05);
    box-shadow: 0 10px 20px rgba(13, 110, 253, 0.3);
  }
    .item-heading {
      font-size: 1.7rem;
      font-weight: 700;
      // color: #0d6efd;
      white-space: nowrap;
      margin-bottom: 1rem;
      // text-shadow: 0 3px 5px rgba(13, 110, 253, 0.2);
    }

    

    .custom-btn {
  width: 100%;
  font-size: 12px;
  font-weight: 500;
  padding: 8px;
  transition: all 0.3s ease-in-out;
  white-space: nowrap;
  color: #ffffff!important ;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* Danger Button */
.btn-outline-danger {
  // background-color: yellow;
  // border-color: #dc3545;
  background-color: #ffc107 !important; /* Yellow background */
  border-color: #ffc107 !important;
  color: white !important; /* Text in black for readability */
}

/* Success Button */
.btn-outline-success {
  background-color: #198754;
  border-color: #198754;
}

.bg-warning:hover{
     background-color:#D3D3D3!important;
    //  color:white!important;
   
     

}

/* Primary Button */
.btn-outline-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

/* Dark Button */
.btn-outline-dark {
  background-color: #212529;
  border-color: #212529;
}

/* Optional: Hover effect - Slight scale for interactivity */
.custom-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.2);
}


    .footer-section {
      background-color: rgba(13, 110, 253, 0.1);
      padding: 12px 15px;
      border-radius: 6px;
    }
  `}</style>


                    {/* top alert */}
                    <div className="p-0">
                      {(() => {
                        const expiryDate = new Date(itemData?.expiry_date);
                        const today = new Date();
                        const diffTime = expiryDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );

                        let bgColor = "";
                        let borderColor = "";
                        let leftBorderColor = "";
                        let iconColor = "";
                        let heading = "";
                        let headingColor = "";
                        let message = "";

                        if (diffDays < 0) {
                          // ❌ Already expired
                          bgColor = "#fff4f4";
                          borderColor = "#f08080";
                          leftBorderColor = "#ff4d4f";
                          iconColor = "#f44336";
                          heading = "❌ Protection Expired!";
                          headingColor = "#d32f2f";
                          message = `Your subscription for ${itemData?.item_name
                            } expired on ${expiryDate.toLocaleDateString()}.`;
                        } else if (diffDays <= 14) {
                          // ⚠ Expiring within 2 weeks
                          bgColor = "#fffbe6";
                          borderColor = "#ffe58f";
                          leftBorderColor = "#faad14";
                          iconColor = "#fa8c16";
                          heading = "⚠ Protection Expiring Soon!";
                          headingColor = "#d48806";
                          message = `Your subscription for ${itemData?.item_name
                            } will expire on ${expiryDate.toLocaleDateString()}.`;
                        } else {
                          // ✅ More than 2 weeks left
                          bgColor = "#e6f7ff";
                          borderColor = "#91d5ff";
                          leftBorderColor = "#1890ff";
                          iconColor = "#1890ff";
                          heading = "Protection Active";
                          headingColor = "#096dd9";
                          message = `Your subscription for ${itemData?.item_name
                            } is active until ${expiryDate.toLocaleDateString()}.`;
                        }

                        return (
                          <div
  className="d-flex justify-content-between align-items-start flex-wrap p-3 mb-3 position-relative"
  style={{
    backgroundColor: bgColor,
    border: `1px solid ${borderColor}`,
    borderLeft: `4px solid ${leftBorderColor}`,
    borderRadius: "12px",
    maxWidth: "400px",
    margin: "0 auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    paddingBottom: "3rem", // space for button
  }}
>
  <div className="me-3" style={{ fontSize: "24px", color: iconColor }}>
    <i className="bi bi-bell-fill"></i>
  </div>

  <div style={{ flex: 1 }}>
    <h6
      style={{
        color: headingColor,
        fontWeight: 600,
        marginBottom: "4px",
      }}
    >
      {heading}
    </h6>
    <p className="mb-1" style={{ color: "#666", fontSize: "14px" }}>
      {message} <span
    className="text-decoration-underline mb-0"
    style={{ fontSize: "13px" ,color:"#E5980D"}}
    onClick={() => router.push(`/dashboard/renew-subscription/${id}`)}
  >
    Renew 
  </span>
  <span className="" style={{ fontSize: "20px" ,color:"#E5980D"}}>
    →
  </span>
    </p>
   
  </div>

 
  


</div>

                        );
                      })()}
                    </div>


                    {/* image  */}

                    <div className="col-sm-12 d-flex align-items-center justify-content-center">
                      <img
                        src={itemData?.image_url}
                        alt="Item Image"
                        className=" "
                        style={{
                          width: "450px", // updated width
                          height: "240px", // keeps ratio
                          maxWidth: "100%", // responsive
                          borderRadius: "12px",
                          objectFit: "cover",
                        }}
                      />
                    </div>




                    <div className="col-12">
                      <div className="my-2">




                        <div className="container text-center mt-4">
                          <div className="row g-3">


                            <div className="col-6">
                              {itemData?.is_lost === 0 && (
                                <button
                                  className="btn bg-warning custom-btn"
                                  onClick={() => setShowModal(true)}
                                >
                                  <IoCloseCircle size={19} className="me-2" />
                                  <span>Mark as Lost</span>
                                </button>
                              )}

                              {itemData?.is_lost === 1 && (
                                <button
                                  className="btn bg-warning custom-btn"
                                  onClick={() => setShowRecoverModal(true)}
                                >
                                  <IoCheckmarkCircle
                                    size={19}
                                    className="me-2"
                                  />
                                  <span>Mark as Found</span>
                                </button>
                              )}
                            </div>

                            <div className="col-6">
                              <button
                                className="btn btn-outline-primary custom-btn"
                                onClick={() => handleClick(itemData?.item_id)}
                              >
                                <IoPencil size={19} className="me-2" />
                                <span>Edit</span>
                              </button>
                            </div>

                            <div className="col-6">
                              <button
                                className="btn btn-outline-success custom-btn"

                                onClick={handleDownloadQR}
                              >
                                <IoDownload size={19} className="me-2" />
                                <span>Download</span>
                              </button>
                            </div>

                            <div className="col-6">
                              <button
                                className="btn btn-outline-dark custom-btn"
                                onClick={handlePrintQR}
                              >
                                <IoPrint size={19} className="me-2" />
                                <span>Print QR</span>
                              </button>
                            </div>


                          </div>
                        </div>


                        <h1
                          className="item-heading   text-center w-90 mt-4"
                          style={{
                            fontSize: "20px",
                            color: "black",
                            position: "relative",
                            display: "inline-block",
                            margin: "0 auto",
                            paddingBottom: "6px",
                            textAlign: "center",
                          }}
                        >
                          {itemData?.item_name}

                        </h1>

                        <ul className="list-group list-group-flush mt-5 rounded-3 overflow-hidden">
                          <li
                            className="list-group-item px-4 py-3 bg-light"
                            style={{
                              border: "1px solid #e2e8f0",
                              borderRadius: "12px",
                              marginBottom: "16px",
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.03)",
                            }}
                          >
                            <h4 className="mb-2  text-dark d-flex align-items-center">
                              <i className="bi bi-info-circle-fill    "></i>
                              Product Details
                            </h4>
                            <p className="text-muted   mb-0" style={{ fontSize: "15px" }}>
                              {itemData?.description}
                            </p>
                          </li>

                          {/* Optional status section - just styled but still commented out */}
                          {/* 
  <li
    className="list-group-item px-4 py-3 bg-light"
    style={{
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.03)",
    }}
  >
    <h6 className="mb-1 fw-semibold text-dark">
      Status:
      <span
        className={`ms-2 ${
          itemData?.status === "Lost" ? "text-danger" : "text-success"
        }`}
      >
        {itemData?.status || "Available"}
      </span>
    </h6>
  </li>
  */}
                        </ul>

                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRecoverModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Recovery</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRecoverModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you have found this item?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowRecoverModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleUpdateItemStatus("found")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Action</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to mark this item as lost?</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleUpdateItemStatus("lost")}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <div className="modal-backdrop fade show"></div>}
      {showRecoverModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
};

export default ItemDetail;
