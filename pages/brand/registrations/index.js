// pages/brand-users.js
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { PencilSquare } from "react-bootstrap-icons";
import { getAdminDetail } from "lib/getAdminDetail";
import { dateFormat } from "utils/dateFormat";
import Swal from "sweetalert2";

export default function BrandUsers() {
  const maskEmail = (email) => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    const visiblePart = name.slice(0, 3);
    return `${visiblePart}${"*".repeat(
      Math.max(0, name.length - 3)
    )}@${domain}`;
  };

  const maskMobile = (mobile) => {
    if (!mobile) return "";
    return mobile.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");
  };

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobile, setMobile] = useState("");
  const [serial, setSerial] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);


  const [errors, setErrors] = useState({ mobile: "", serial: "" });
  const itemsPerPage = 10;

  const [isClient, setIsClient] = useState(false);

useEffect(() => {
  setIsClient(true);
}, []);

  const brandUserData = getAdminDetail();
  const permissions = brandUserData?.permissions || [];
  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);
  const hasPermission = (perm) => permissions.includes(perm);
  const fetchUsers = async (page, mobileFilter = "", serialFilter = "") => {
    try {
      const response = await axios.get(
        `/api/brand/registration?brandId=${brandUserData.brand_id}&page=${page}&limit=${itemsPerPage}&mobile=${mobileFilter}&serial=${serialFilter}`
      );
      setUsers(response?.data?.data);
      setTotalCount(response?.data?.totalCount);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSearch = async () => {
    if (!mobile.trim() && !serial.trim()) {
      setErrors({
        mobile: "Please enter Mobile or Serial No",
        serial: "Please enter Mobile or Serial No",
      });
      return;
    }
    setIsSearchLoading(true);
    await fetchUsers(1, mobile, serial);
    setCurrentPage(1);
    setIsSearchLoading(false);
  };
  const handleReset = async () => {
    if (!mobile.trim() && !serial.trim()) return;
    setIsResetLoading(true);
    setMobile("");
    setSerial("");
    await fetchUsers(1); // no filters
    setCurrentPage(1);
    setIsResetLoading(false);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);




  const handleDownload = async () => {
    try {
      const response = await fetch(
        `/api/brand/download-brand-registrations?brandId=${brandUserData.brand_id}&mobile=${mobile}&serial=${serial}`
      );
  
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = "registered_users.csv"; // ✅ file name
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "❌ Failed to download the file. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };
  

  // return (
  //   <div className="container mt-4">
  //     <div className="d-flex justify-content-between align-items-center mb-3">
  //       <h4>Qr Code Registrations</h4>
  //       {/* <button className="btn btn-primary">Download</button> */}
  //       {isClient && hasPermission("download_registered_data") && (
  //         <button className="btn btn-primary">Download</button>
  //       )}
  //     </div>

  //     <div className="row align-items-end g-2 mb-3">
  //       <div className="col-md-3">
  //         <label className="form-label text-muted">Mobile</label>
  //         <input
  //           type="text"
  //           className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
  //           placeholder="Enter Mobile"
  //           value={mobile}
  //           onChange={(e) => setMobile(e.target.value)}
  //         />
  //       </div>

  //       <div className="col-md-3">
  //         <label className="form-label text-muted">Serial No</label>
  //         <input
  //           type="text"
  //           className={`form-control ${errors.serial ? "is-invalid" : ""}`}
  //           placeholder="Enter Serial No"
  //           value={serial}
  //           onChange={(e) => setSerial(e.target.value)}
  //         />
  //       </div>

  //       <div className="col-md-3 d-flex gap-2">
  //         <button
  //           className="btn"
  //           style={{ backgroundColor: "#624BFF", color: "#fff" }}
  //           onClick={handleSearch}
  //           disabled={isSearchLoading}
  //         >
  //           {isSearchLoading ? "Loading..." : "Search"}
  //         </button>

  //         <button
  //           className="btn btn-secondary"
  //           onClick={handleReset}
  //           disabled={isResetLoading}
  //         >
  //           {isResetLoading ? "Resetting..." : "Reset"}
  //         </button>
  //       </div>
  //     </div>

  //     <div className="table-responsive">
  //       <table className="table table-hover align-middle">
  //         <thead className="table-light">
  //           <tr>
  //             <th>#</th>
  //             <th>Name</th>
  //             <th>Email</th>
  //             <th>Mobile</th>
  //             <th>Registration Date</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {users?.length === 0 ? (
  //             <tr>
  //               <td colSpan="5" className="text-center text-muted py-3">
  //                 No users found.
  //               </td>
  //             </tr>
  //           ) : (
  //             users?.map((user, index) => (
  //               <tr key={user.id || index}>
  //                 <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
  //                 <td>{user.full_name}</td>
  //                 <td>{maskEmail(user.email)}</td>
  //                 <td>{maskMobile(user.mobile)}</td>
  //                 <td>{dateFormat(user.created_at)}</td>
  //               </tr>
  //             ))
  //           )}
  //         </tbody>
  //       </table>
  //     </div>

  //     <div className="d-flex justify-content-between align-items-center">
  //       <div>Total Users: {totalCount}</div>

  //       <div className="d-flex">
  //         <button
  //           className="btn btn-light border"
  //           disabled={currentPage === 1}
  //           onClick={() => handlePageChange(1)}
  //         >
  //           «
  //         </button>
  //         <button
  //           className="btn btn-light border"
  //           disabled={currentPage === 1}
  //           onClick={() => handlePageChange(currentPage - 1)}
  //         >
  //           ‹
  //         </button>

  //         <button className="btn btn-primary border mx-1">{currentPage}</button>

  //         <button
  //           className="btn btn-light border"
  //           disabled={currentPage === totalPages}
  //           onClick={() => handlePageChange(currentPage + 1)}
  //         >
  //           ›
  //         </button>
  //         <button
  //           className="btn btn-light border"
  //           disabled={currentPage === totalPages}
  //           onClick={() => handlePageChange(totalPages)}
  //         >
  //           »
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="container mt-4" style={{ maxWidth: "95%" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Qr Code Registrations</h3>
        {isClient && hasPermission("download_registered_data") && (
          <button onClick={handleDownload} className="btn" style={{ backgroundColor: "#A22191", color: "#fff" }} > Download</button>
        )}
      </div>
  
      <div className="row align-items-end g-2 mb-3">
        <div className="col-md-3">
          <label className="form-label text-muted">Mobile</label>
          <input
            type="text"
            className={`form-control ${errors.mobile ? "is-invalid" : ""}`}
            placeholder="Enter Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
  
        <div className="col-md-3">
          <label className="form-label text-muted">Serial No</label>
          <input
            type="text"
            className={`form-control ${errors.serial ? "is-invalid" : ""}`}
            placeholder="Enter Serial No"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />
        </div>
  
        <div className="col-md-3 d-flex gap-2">
          <button
            className="btn"
            style={{ backgroundColor: "#A22191", color: "#fff" }}
            onClick={handleSearch}
            disabled={isSearchLoading}
          >
            {isSearchLoading ? "Loading..." : "Search"}
          </button>
  
          <button
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isResetLoading}
          >
            {isResetLoading ? "Resetting..." : "Reset"}
          </button>
        </div>
      </div>
      
      {/* 👇 View only if has "view_registered_users" permission */}
      {isClient && hasPermission("view_registered_users") ? (
        <>

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
          <div className="table-responsive " style={{ maxHeight: "300px", overflowY: "auto" }}>
            <table className="table  align-middle">
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 100, backgroundColor: "white" }}>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {/* {users?.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-3">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users?.map((user, index) => (
                    <tr key={user.id || index}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td>{user.full_name}</td>
                      <td>{maskEmail(user.email)}</td>
                      <td>{maskMobile(user.mobile)}</td>
                      <td>{dateFormat(user.created_at)}</td>
                    </tr>
                  ))
                )} */}

{users?.length === 0 ? (
    <tr>
      <td colSpan="5" className="text-center text-muted py-3">
        No users found.
      </td>
    </tr>
  ) : (
    users?.map((user, index) => (
      <tr key={user.id || index}>
        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
        <td>{user.full_name}</td>
        <td>
          {isClient && hasPermission("view_registered_users")
            ? user.email
            : maskEmail(user.email)}
        </td>
        <td>
          {isClient && hasPermission("view_registered_users")
            ? user.mobile
            : maskMobile(user.mobile)}
        </td>
        <td>{dateFormat(user.created_at)}</td>
      </tr>
    ))
  )} 
              </tbody>
            </table>
          </div>
  
          <div className="d-flex justify-content-between align-items-center">
            <div>Total Users: {totalCount}</div>
  
            <div className="d-flex">
              <button
                className="btn btn-light border"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
              >
                
              </button>
              <button
                className="btn btn-light border"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                ‹
              </button>
  
              <button className="btn  border mx-1" style={{ backgroundColor: "#A22191", color: "#fff" }}>{currentPage}</button>
  
              <button
                className="btn btn-light border"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                ›
              </button>
              <button
                className="btn btn-light border"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
              >
                »
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-warning text-center">
          You do not have permission to view this report.
        </div>
      )}
    </div>
  );
  
}
