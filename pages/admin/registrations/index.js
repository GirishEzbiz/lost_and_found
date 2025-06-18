// pages/brand-users.js
import { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { PencilSquare } from "react-bootstrap-icons";
import { getAdminDetail } from "lib/getAdminDetail";
import { dateFormat } from "utils/dateFormat";
import GetPermission from "utils/getpermissions";

export default function BrandUsers() {
  // const maskEmail = (email) => {
  //   if (!email) return "";
  //   const [name, domain] = email.split("@");
  //   const visiblePart = name.slice(0, 3);
  //   return `${visiblePart}${"*".repeat(
  //     Math.max(0, name.length - 3)
  //   )}@${domain}`;
  // };

  // const maskMobile = (mobile) => {
  //   if (!mobile) return "";
  //   return mobile.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");
  // };

  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [mobile, setMobile] = useState("");
  const [serial, setSerial] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);


  const [errors, setErrors] = useState({ mobile: "", serial: "" });
  const itemsPerPage = 10;

  const [isClient, setIsClient] = useState(false);

  const [permissions, setPermissions] = useState({
    canDownload: false,

  });
  useEffect(() => {
    setPermissions({
      canDownload: GetPermission("qr-registration-download"),

    });
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);


  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);
  const fetchUsers = async (page, mobileFilter = "", serialFilter = "") => {
    try {
      const response = await axios.get(
        `/api/admin/registration?page=${page}&limit=${itemsPerPage}&mobile=${mobileFilter}&serial=${serialFilter}`
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

  const registrationDataDownload = () => {
    try {

      setIsDownloadLoading(true);

      const link = document.createElement("a");
      link.href = `/api/admin/download-users-registration`;
      link.setAttribute("download", `user_registrations.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove()

      setTimeout(() => setIsDownloadLoading(false), 1000);
    } catch (error) {
      console.error("Download error:", err);
      setIsDownloadLoading(false);
    }
    ;

  };




  return (
    <div className="container mt-4" style={{ maxWidth: "95%" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>User  Registrations</h3>

        {permissions.canDownload && (


          <button className="btn" style={{ backgroundColor: '#a22191', border: 'none', color: '#fff' }} onClick={registrationDataDownload} disabled={isDownloadLoading}>
            {isDownloadLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Downloading...
              </>
            ) : (
              "Download"
            )}
          </button>
        )
        }

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
            style={{ backgroundColor: "#a22191", color: "#fff" }}
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

      <>
        <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
          <div>Showing {users.length} out of {totalCount}</div>

          <table className="table align-middle">
            <thead className="table-light" style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "white",
            }}>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>

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
                      {user.email
                      }
                    </td>
                    <td>

                      {user.mobile}

                    </td>
                    <td>{dateFormat(user.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end align-items-center">

          <div className="d-flex">
            <button
              className="btn btn-light border"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
            >
              «
            </button>
            <button
              className="btn btn-light border"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ‹
            </button>

            <button className="btn  border mx-1" style={{backgroundColor: '#a22191' , color: '#fff'}}>{currentPage}</button>

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

    </div>
  );

}
