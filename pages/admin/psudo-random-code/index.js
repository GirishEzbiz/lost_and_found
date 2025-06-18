"use client";
import Cookies from "js-cookie";
import { Pagination } from "react-bootstrap";
import { useEffect, useState } from "react";
import { dateFormat } from "utils/dateFormat";
import { exportStatusData } from "utils/exportStatusData";
import Swal from "sweetalert2";
import { QRCodeCanvas } from 'qrcode.react';
import { BsQrCode } from "react-icons/bs";
import { getAdminDetail } from "lib/getAdminDetail";



const PseudoRandomFilter = () => {
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("");
  const [rangeType, setRangeType] = useState("All");
  const [fromRange, setFromRange] = useState("");
  const [toRange, setToRange] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [brands, setBrands] = useState([]);
  const [skus, setSkus] = useState([]);
  const [floading, setfloading] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expiryDate, setExpiryDate] = useState("");
  const [status, setStatus] = useState('');
  const [conditionStatus, setConditionStatus] = useState('');
  const [batchNo, setBatchNo] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState('');
  const [remarks, setRemarks] = useState("");
  const [showBrandChange, setShowBrandChange] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [qrData, setQrData] = useState([]); // State to hold QR data
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = parseInt(Cookies.get("Page-limit") || 10);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / itemPerPage);

  const userD = getAdminDetail()
  const user_id = userD.id



  const handleFilter = () => {
    console.log("sku", sku)
    console.log("brand", brand)
    if (!sku || !brand) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Filters',
        text: 'Please select both SKU and Brand to filter the result.',
      });
      return;
    }

    if (rangeType === "Range" && (!fromRange || !toRange)) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Range',
        text: 'Please select both From and To Range.',
      });
      return;
    }

    QrData(1);
    setShowTable(true);
  };

  const handleShowQrCode = (qrCode) => {
    setSelectedQrCode(`https://qritagya.com/qr/${qrCode}`);
    setShowModal(true);
  };


  const QrData = async (page = 1) => {
    setfloading(true)
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/psudo-random-code?action=qr&sku=${sku}&brand=${brand}&from_range=${fromRange}&to_range=${toRange}&limit=${itemPerPage}&page=${page}`
      );
      const data = await response.json();


      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      // You can also handle the actual QR data here if returned
      setQrData(data.qrData);
      setTotalCount(data.totalCount || 0); // Set total count from backend
      setCurrentPage(page); // Upda
    } catch (error) {
      console.error("Error fetching QR data:", error);
    } finally {
      setfloading(false)
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [])
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/psudo-random-code");
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      setBrands(data.brands);
      setSkus(data.skus);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }


  const updatePsuedoRandomCode = async () => {

    setLoading(true);
    try {
      let payload = {
        expiry_date: expiryDate,
        status: status,
        remarks: remarks,
        production_batch_no: batchNo,
        condition_status: conditionStatus,

      }
      if (showBrandChange && newBrand) {
        payload.new_brand = parseInt(newBrand);
      }

      let response = await fetch(`/api/admin/psudo-random-code?from_range=${fromRange}&to_range=${toRange}&brand=${brand}&sku=${sku}&user=${user_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      let data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Updated Successfully',
          text: 'Pseudo Random Code data has been updated.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update Failed',
          text: data?.message || 'Something went wrong while updating.',
        });
      }

      setTimeout(() => {
        handleReset()
        handleResetFilters()
      }, 500);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while updating.',
      });
    } finally {
      setLoading(false);
    }
  }




  const handleReset = () => {
    setSku("");
    setBrand("");
    setRangeType("All");
    setFromRange("");
    setToRange("");
    setShowTable(false);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };



  const handleResetFilters = () => {
    setExpiryDate("");
    setStatus('');
    setBatchNo("");
    setRemarks("")
    setConditionStatus('');

  };


  const downloadQrData = async () => {
    // Prepare the data to be sent for download (only serial_number, qr_code, created_at, expiry_date)
    const payload = {
      status,
      from_range: fromRange,
      to_range: toRange,
      brand,
      sku,
      remarks,
      user_id,
      qr_data: qrData.map(item => ({
        serial_number: item.serial_number,
        qr_code: item.qr_code,
        created_at: item.created_at,
        expiry_date: item.expiry_date,
      }))
    };

    // Send the data to the server to generate and download the CSV
    const response = await fetch('/api/admin/download-psudo-random-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to fetch CSV');
      return;
    }

    // Create a link to trigger download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'filtered_qr_codes.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    QrData(page); // Fetch data for selected page
  };

  return (

    <div className="container-fluid mt-5" style={{ width: "95%" }}>
      <h3 className="mb-4">Pseudo Random Code</h3>

      <div className="row mb-3">
        <div className="col-md-3">
          <label className="form-label">Brands</label>
          <select
            className="form-select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">Select Brand</option>
            {brands.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>


      </div>
      {brand && (
        <div className="d-flex flex-wrap mb-4">
          <div className="col-md-3" style={{ marginRight: "10px" }}>
            <label className="form-label">SKU</label>
            <select
              className="form-select"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            >
              <option value="">Select SKU</option>
              {skus.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2 mx-3">
            <label className="form-label">Range</label>
            <select
              className="form-select"
              value={rangeType}
              onChange={(e) => setRangeType(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Range">Range</option>
            </select>
          </div>

          {rangeType === "Range" && (
            <>
              <div className="col-md-2 mx-3">
                <label className="form-label">From</label>
                <input
                  type="text"
                  className="form-control"
                  value={fromRange}
                  placeholder="From Range"
                  onChange={(e) => setFromRange(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">To</label>
                <input
                  type="text"
                  className="form-control"
                  value={toRange}
                  placeholder="To Range"
                  onChange={(e) => setToRange(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}


      {
        brand && <div className="d-flex gap-2 mb-4">
          <button className="btn btn-primary" disabled={floading} onClick={handleFilter} style={{background:"#a22191",border:"none",color:"white"}}>
            {floading ? "Processing Filters..." : " Filter Result"}
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            Reset
          </button>
        </div>
      }

      {showTable && (
        <>
          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>

              <div
                className="p-4 mb-3"
                style={{ background: "#B4D9FD", borderRadius: "8px" }}
              >
                <div className="row g-3 align-items-end">
                  <div className="row">
                    {/* Expiry Date Input */}
                    <div className="col-md-3">
                      <label className="form-label">Expiry Date:</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                      />
                    </div>

                    {/* Duration Dropdown */}
                    <div className="col-md-2" style={{  width:"158px" }}>
                      <label className="form-label">Duration:</label>
                      <select
                        className="form-select"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value) return;

                          const now = new Date();
                          switch (value) {
                            case "3m":
                              now.setMonth(now.getMonth() + 3);
                              break;
                            case "6m":
                              now.setMonth(now.getMonth() + 6);
                              break;
                            case "1y":
                              now.setFullYear(now.getFullYear() + 1);
                              break;
                            case "3y":
                              now.setFullYear(now.getFullYear() + 3);
                              break;
                            case "5y":
                              now.setFullYear(now.getFullYear() + 5);
                              break;
                            default:
                              break;
                          }

                          // Format date to 'yyyy-MM-ddTHH:mm' (compatible with datetime-local)
                          const formatted = now.toISOString().slice(0, 16);
                          setExpiryDate(formatted);
                        }}
                      >
                        <option value="">Duration</option>
                        <option value="3m">3 Months</option>
                        <option value="6m">6 Months</option>
                        <option value="1y">1 Year</option>
                        <option value="3y">3 Years</option>
                        <option value="5y">5 Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Status:</label>
                    <select
                      className="form-select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value=''>Select Status</option>
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Production Batch No.:</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter Batch No."
                      value={batchNo}
                      onChange={(e) => setBatchNo(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Remarks</label>
                    <input
                      className="form-control"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Add any remarks here"
                    />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label">Condition Status:</label>
                    <select
                      className="form-select"
                      value={conditionStatus}
                      onChange={(e) => setConditionStatus(e.target.value)}
                    >
                      <option value='' hidden>Select Conditions </option>
                      <option value={"supplied"}>Supplied</option>
                      <option value={"print_missing"}>Print Missing</option>
                      <option value={"printed"}>Printed</option>
                      <option value={"damaged"}>Damaged</option>
                    </select>
                  </div>

                  <div className="mt-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="changeBrandCheck"
                        checked={showBrandChange}
                        onChange={() => setShowBrandChange(!showBrandChange)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="changeBrandCheck">
                        Change Brand
                      </label>
                    </div>

                    {showBrandChange && (
                      <div className="col-md-4 mt-3">
                        <label className="form-label">Select New Brand</label>
                        <select
                          className="form-select"
                          value={newBrand}
                          onChange={(e) => setNewBrand(e.target.value)}
                        >
                          <option value="">Select Brand</option>
                          {brands
                            .filter((b) => String(b.id) !== String(brand))
                            .map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="col-12 d-flex gap-2 mt-3">
                    <button className="btn btn-primary" onClick={updatePsuedoRandomCode}>Update Pseudo Random Code</button>
                    <button className="btn btn-success" onClick={downloadQrData}>Download Pseudo Random Code</button>
                    <button className="btn btn-secondary" onClick={handleResetFilters}>Reset Filters</button>
                  </div>
                </div>
              </div>
              {/* ... Update Code Container ... */}
              <div className="table-responsive" style={{
                maxHeight: "500px",
                overflowY: "auto",
                position: "relative",
                width: "100%",
              }} >


                <p>Showing {qrData.length} out of {totalCount}</p>
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
                      <th className="py-3 fw-semibold border-bottom">Serial No</th>
                      <th className="py-3 fw-semibold border-bottom">Status</th>
                      <th className="py-3 fw-semibold border-bottom">Tracking Status</th>
                      <th className="py-3 fw-semibold border-bottom">Brand Name</th>
                      <th className="py-3 fw-semibold border-bottom">Downloaded</th>
                      <th className="py-3 fw-semibold border-bottom"> Batch No</th>
                      <th className="py-3 fw-semibold border-bottom">Date Added</th>
                      <th className="py-3 fw-semibold border-bottom">Expiry Date</th>
                      <th className="py-3 fw-semibold border-bottom">Qr Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrData?.length > 0 ? (
                      qrData.map((item, index) => (
                        <tr key={index} className="text-center">
                          <td className="py-3 border-top">{(currentPage - 1) * itemPerPage + index + 1}</td>
                          <td className="py-3 border-top">{item.serial_number}</td>
                          <td className="py-3 border-top">
                            {item.status === 1 ? "Active" : "Inactive"}
                          </td>
                          <td className="py-3 border-top">
                            <span
                              className={`badge ${item.is_recovered
                                ? "bg-warning"
                                : item.is_found
                                  ? "bg-primary"
                                  : item.is_lost
                                    ? "bg-danger"
                                    : item.is_activated
                                      ? "bg-success"
                                      : "bg-secondary"
                                }`}
                            >
                              {item.is_recovered
                                ? "Item Recovered"
                                : item.is_found
                                  ? "Item Found"
                                  : item.is_lost
                                    ? "Item Lost"
                                    : item.is_activated
                                      ? "Registered"
                                      : "Unregistered"}
                            </span>
                          </td>
                          <td className="py-3 border-top">{item.brand_name}</td>
                          <td className="py-3 border-top">
                            {item.is_downloaded === 1
                              ? formatDate(item.download_date)
                              : "Not Downloaded"}
                          </td>
                          <td className="py-3 border-top">{dateFormat(item.production_batch_no)}</td>
                          <td className="py-3 border-top">{dateFormat(item.created_at)}</td>
                          <td className="py-3 border-top">{dateFormat(item.expiry_date)}</td>
                          <td className="py-3 border-top">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => handleShowQrCode(item.qr_code)}
                            >
                              <BsQrCode />
                            </button>
                          </td>


                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No data found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>


              </div>
              <div className="justify-content-end align-items-center row p-3">
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
        </>

      )}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">QR Code</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body text-center">
                <QRCodeCanvas value={selectedQrCode} size={200} />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PseudoRandomFilter;
