import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaBroadcastTower } from "react-icons/fa";
import { Form, Button, Row, Col, Pagination, Badge } from "react-bootstrap";
import Select from "react-select";
import Cookies from "js-cookie";

const ScanReport = () => {
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rloading, setRloading] = useState(false);
  const [filteredData, setFilteredData] = useState([]); // Store filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const [allScanData, setAllScanData] = useState([]); // Store all dataddd for filtering/searching
  const itemsPerPage = Cookies.get("Page-limit"); // Show 50 items per page
  const [filters, setFilters] = useState({
    qrCode: "",
    serial: "",
    ip: "",
    browser: "",
    date: "",
    status: "",
  });
  const [visibleColumns, setVisibleColumns] = useState({
    qrSerial: true,
    userId: true,
    role: true,
    scannerName: true,
    ownerNotification: true,
    ipAddress: true,
    location: true,
    browser: true,
    executionTime: true,
    timestamp: true,
    status: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const [totalItems, setTotalItems] = useState(0);
  const displayValue = (value) => (value ? value : "-");

  // Fetch scan data from API
  const fetchData = async (filters) => {
    try {
      const response = await fetch(
        `/api/scan-page/getscandata?currentpage=${currentPage}&itemperpage=${itemsPerPage}&filters=${JSON.stringify(
          filters
        )}`
      );
      const datas = await response.json();
      const data = datas?.result;
      const total = datas?.total;

      setScanData(data);
      setFilteredData(data); // Initially, filteredData is the same as scanData
      setTotalItems(total);
    } catch (error) {
      console.log("error fetching scan-report", error);
    } finally {
      setLoading(false);
      setRloading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, filters);
  }, [currentPage, filters]); // Trigger fetchData when currentPage or filters change

  const statusOptions = [
    { value: "OK", label: "OK" },
    { value: "NOT OK", label: "NOT OK" },
    { value: "NOT FOUND", label: "NOT FOUND" },
    // Add more options as necessary
  ];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (selectedOption) => {
    setFilters((prev) => ({
      ...prev,
      status: selectedOption ? selectedOption.value : "",
    }));
  };

  const applyFilters = async () => {
    setLoading(true);
    await fetchData(filters);
  };
  const toggleColumn = (key) => {
    const updated = {
      ...visibleColumns,
      [key]: !visibleColumns[key],
    };
    setVisibleColumns(updated);
    Cookies.set('scanTableVisibleColumns', JSON.stringify(updated), { expires: 7 });
  };
  useEffect(() => {
    const saved = Cookies.get('scanTableVisibleColumns');
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved));
      } catch (err) {
        console.error("Invalid visibleColumns cookie", err);
      }
    }
  }, []);

  // Pagination logic
  const paginateData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return scanData?.slice(startIndex, endIndex); // Paginate from allScanData
  };

  // **Pagination Logic**
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  // const currentData = scanData; // This is already the data for the current page after `fetchData`
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = scanData?.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Function to open Google Maps with latitude and longitude
  const openGoogleMaps = (latitude, longitude) => {
    if (latitude && longitude) {
      const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(googleMapsUrl, "_blank");
    }
  };

  return (
    <>
      <div className="container-fluid  p-3" style={{ width: "95%" }}>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          QR Code Scan Report
        </h3>   

        {/* **Compact Filter Section** */}
        <div className="mb-3 p-3 bg-gray-100 rounded shadow-sm">
          <Form>
            {/* First Row - 4 Inputs */}
            <Row className="mb-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">QR Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="qrCode"
                    placeholder="QR Code"
                    value={filters.qrCode}
                    onChange={handleFilterChange}
                    className="form-control form-control-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Serial No.
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="serial"
                    placeholder="Serial No."
                    value={filters.serial}
                    onChange={handleFilterChange}
                    className="form-control form-control-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    IP Address
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="ip"
                    placeholder="IP Address"
                    value={filters.ip}
                    onChange={handleFilterChange}
                    className="form-control form-control-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Browser ID
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="browser"
                    placeholder="Browser ID"
                    value={filters.browser}
                    onChange={handleFilterChange}
                    className="form-control form-control-sm"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Second Row - 2 Inputs + Search Button */}
            <Row className="mb-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="form-control form-control-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Status</Form.Label>
                  {/* <Form.Control
                    type="text"
                    name="status"
                    placeholder="Status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="form-control form-control-sm"
                  /> */}
                  <Select
                    name="status"
                    options={statusOptions}
                    value={
                      statusOptions.find(
                        (option) => option.value === filters.status
                      ) || null
                    }
                    onChange={handleStatusChange}
                    // className="form-control form-control-sm"
                    placeholder="Select Status"
                  />
                </Form.Group>
              </Col>

              {/* Right-Aligned Search Button */}
              <Col md={3} className="d-flex align-items-end mb-1 ">
                <Button
                  variant="primary"
                  disabled={loading}
                  onClick={applyFilters}
                  style={{background:"#a22191",border:"none",color:"white"}}    
                  className="btn px-4 py-1"
                >
                  {loading ? "Searching..." : "Search"}
                </Button>
                <Button
                  variant="secondary"
                  disabled={rloading}
                  onClick={() => {
                    setFilters({
                      qrCode: "",
                      serial: "",
                      ip: "",
                      browser: "",
                      date: "",
                      status: "",
                    });
                    setRloading(true);
                    fetchData();
                  }}
                  className="btn px-4 ms-2 py-1"
                >
                  {rloading ? "Reseting..." : "Reset"}
                </Button>
              </Col>
            </Row>
          </Form>
        </div>

        {/* **Table** */}
        <div className="d-flex justify-content-between align-items-start mb-2 position-relative">
          {/* Left: Showing Count */}
          <span className="p-0 mt-3">
            Showing {filteredData.length} out of {totalItems}
          </span>

          {/* Right: Column Toggle Button */}
          <div className="position-relative">
            <span className=" ">View</span>
            <Button
              variant="secondary"
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              id="column-toggle-btn"
            >
              ☰
            </Button>

            {showColumnMenu && (
              <div
                className="position-absolute bg-white border p-2 rounded shadow"
                style={{
                  top: "100%",   // Appears below the button
                  right: 0,      // Align to right side
                  zIndex: 10,
                  minWidth: "200px",
                }}
              >
                {Object.entries({
                  qrSerial: "QR Serial",
                  userId: "User ID",
                  role: "Role",
                  scannerName: "Scanner Name",
                  ownerNotification: "Owner Notification",
                  ipAddress: "IP Address",
                  location: "Location",
                  browser: "Browser",
                  executionTime: "Execution Time",
                  timestamp: "Timestamp",
                  status: "Status",
                }).map(([key, label]) => (
                  <Form.Check
                    key={key}
                    type="checkbox"
                    id={key}
                    label={label}
                    checked={visibleColumns[key]}
                    onChange={() => toggleColumn(key)}
                    className="mb-1"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="bg-white shadow-md rounded-lg"
          style={{
            maxHeight: "500px",
            overflowY: "auto",
            overflowX: "auto", // ✅ enable horizontal scroll
            whiteSpace: "nowrap", // ✅ prevent table cells from wrapping
          }}
        >
          <table className="w-full border-collapse text-sm w-100">
            <thead
              className="bg-gray-300  text-gray text-xs"
              style={{
                fontWeight: "500",
                position: "sticky",
                top: 0,
                zIndex: 8,
              }}
            >
              <tr>
                <th className="px-2 py-2 text-center">#</th>
                {visibleColumns.qrSerial && (
                  <th className="px-2 py-2 text-center">QR Serial</th>
                )}

                {visibleColumns.userId && (
                  <th className="px-2 py-2 text-center">User Id</th>
                )}
                {visibleColumns.role && (
                  <th className="px-2 py-2 text-center">Role</th>
                )}
                {visibleColumns.scannerName && (
                  <th className="px-2 py-2 text-center">Scanner Name</th>
                )}
                {visibleColumns.ownerNotification && (
                  <th className="px-2 py-2 text-center">Owner Notification</th>
                )}
                {visibleColumns.ipAddress && (
                  <th className="px-2 py-2 text-center">IP Address</th>
                )}
                {visibleColumns.location && (
                  <th className="px-2 py-2 text-center">Location</th>
                )}
                {visibleColumns.browser && (
                  <th className="px-2 py-2 text-center">Browser</th>
                )}
                {visibleColumns.executionTime && (
                  <th className="px-2 py-2 text-center">Execution Time</th>
                )}
                {visibleColumns.timestamp && (
                  <th className="px-2 py-2 text-center">Timestamp</th>
                )}
                {/* {visibleColumns.status && (
                  <th className="px-2 py-2 text-center">Status</th>
                )} */}

              </tr>
            </thead>
            <tbody>
              {filteredData?.length > 0 ? (
                filteredData?.map((item, index) => (
                  <tr key={item.id} className="border-b hover:bg-gray-100">
                    <td className="px-2 py-2 text-center">
                      {(currentPage - 1) * 50 + (index + 1)}
                    </td>
                    {visibleColumns.qrSerial && (
                      <td className="px-2 py-2 text-center font-semibold">
                        {displayValue(item.qr_code_serial)}
                      </td>
                    )}

                    {visibleColumns.userId && (
                      <td className="px-2 py-2 text-center">
                        {displayValue(item.unique_user_id)}
                      </td>
                    )}
                    {visibleColumns.role && (
                      <td className="px-2 py-2 text-center">
                        {item.user_role}
                      </td>
                    )}
                    {visibleColumns.scannerName && (
                      <td className="px-2 py-2 text-center">{item.scanner_name}</td>
                    )}
                    {visibleColumns.ownerNotification && (
                      <td className="px-2 py-2 text-center">
                        {(item.owner_email_status === 1 || item.owner_whatsapp_status === 1) ? (
                          <span style={{ color: "green", fontSize: "18px" }}>✅</span>
                        ) : (
                          <span style={{ color: "gray" }}>—</span>
                        )}
                      </td>
                    )}

                    {visibleColumns.ipAddress && (
                      <td className="px-2 py-2 text-center">{displayValue(item.ip_address)}</td>
                    )}
                    {visibleColumns.location && (
                      <td className="px-2 py-2 text-center">
                        <span
                          style={{ cursor: "pointer", fontSize: "14px" }}
                          onClick={() => openGoogleMaps(item.latitude, item.longitude)}
                        >
                          {displayValue(item.city)}, {displayValue(item.state)}, {displayValue(item.country)}
                        </span>
                        {item.locationSource === "GPS" ? (
                          <FaMapMarkerAlt className="inline ml-1 text-blue-500" />
                        ) : (
                          <FaBroadcastTower className="inline ml-1 text-red-500" />
                        )}
                      </td>
                    )}
                    {visibleColumns.browser && (
                      <td className="px-2 py-2 text-center">
                        <span title={item.browser_details}>
                          {item.browser_details.length > 30
                            ? item.browser_details.substring(0, 18) + "..."
                            : item.browser_details}
                        </span>
                      </td>
                    )}
                    {visibleColumns.executionTime && (
                      <td className="px-2 py-2 text-center">{displayValue(item.execution_time)}</td>
                    )}
                    {visibleColumns.timestamp && (
                      <td className="px-2 py-2 text-center">
                        {/* {displayValue(new Date(item.scan_timestamp).toLocaleDateString())} */}
                        {displayValue(
                          new Date(item.scan_timestamp)
                            .toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        )}

                        <br />
                        {displayValue(new Date(item.scan_timestamp).toLocaleTimeString())}
                      </td>
                    )}
                    {/* {visibleColumns.status && (
                      <td style={{ width: "91px", textAlign: "center" }}>
                        <span
                          className={`px-2 py-1 fs-6 text-white rounded ${item.status.toLowerCase() === "ok"
                            ? "bg-success"
                            : item.status.toLowerCase() === "not ok"
                              ? "bg-warning"
                              : item.status.toLowerCase() === "not found"
                                ? "bg-danger"
                                : "bg-secondary"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    )} */}

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="11"
                    className="px-4 py-4 text-center text-gray-600"
                  >
                    No scan data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="m-0 p-0 d-flex justify-content-end">

          <Pagination className="justify-content-end mt-2 custom-pagination">
            {/* First and Previous Buttons */}
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {/* Dynamic Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage + 1
              )
              .map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              ))}

            {/* Next and Last Buttons */}
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

        {/* **Pagination Controls** */}
        {/* {totalPages > 1 && (
          <div className="mt-4 d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index}
                  active={index + 1 === currentPage}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        )} */}
      </div>
      <style jsx global>{`
        body {
          width: 100% !important;
          margin: 0 auto;
          display: block !important;
          min-height: 100vh !important;
          border: 2px solid #ccc !important;
          box-shadow: 0 !important;
          border-radius: 0px !important;
        }


                      /* Change background of active button */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191; /* Bootstrap magenta color */
  border: none;
  color: white;
}
        @media (min-width: 1200px) {
          .container-xl,
          .container-lg,
          .container-md,
          .container-sm,
          .container {
            max-width: 1354px !important;
          }
        }
      `}</style>
    </>
  );
};

export default ScanReport;
