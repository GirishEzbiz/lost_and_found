import React, { useEffect, useState } from "react";
import { FaMapMarkerAlt, FaBroadcastTower } from "react-icons/fa";
import { Form, Button, Row, Col, Pagination, Badge, Card } from "react-bootstrap";
import Select from "react-select";
import Cookies from "js-cookie";

const ContactReport = () => {
  const [scanData, setScanData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rloading, setRloading] = useState(false);

  const [filteredData, setFilteredData] = useState([]); // Store filtered results
  const [currentPage, setCurrentPage] = useState(1);
  const [allScanData, setAllScanData] = useState([]); // Store all dataddd for filtering/searching
  const itemsPerPage = Cookies.get("Page-limit"); // Show 50 items per page
  const [filters, setFilters] = useState({
    //   qrCode: "",
    //   serial: "",
    //   ip: "",
    //   browser: "",
    //   date: "",
    //   status: "",
  });

  const [totalItems, setTotalItems] = useState(0);
  const displayValue = (value) => (value ? value : "-");

  // Fetch scan data from API
  const fetchData = async (filters) => {
    try {
      const response = await fetch(
        `/api/admin/contact-report?currentpage=${currentPage}&itemperpage=${itemsPerPage}&filters=${JSON.stringify(
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

  return (
    <>
      <div className="container mx-auto p-3">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Contact Us Report
        </h3>



        <Card className="shadow-sm mt-3">
          <Card.Header>
            <p className="mb-0 text-muted">Showing {filteredData.length} out of {totalItems}</p>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <table className="table table-hover mb-0">
                <thead
                  className="table-light"
                  style={{ position: "sticky", top: 0, zIndex: 1 }}
                >
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Date</th>
                    <th>No. of Assets</th>
                    <th>Organization</th>
                    <th>Mobile</th>
                    <th>Created Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData?.length > 0 ? (
                    filteredData?.map((item, index) => (
                      <tr key={item.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{displayValue(item.name)}</td>
                        <td>{displayValue(item.submission_date)}</td>
                        <td>{displayValue(item.no_of_assets)}</td>
                        <td>{displayValue(item.organization)}</td>
                        <td>{displayValue(item.mobile)}</td>
                        <td>{displayValue(item.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No scan data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-end p-3">
              <Pagination className="custom-pagination">
                <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
                  .map((page, index, arr) => {
                    const prev = arr[index - 1];
                    const items = [];

                    if (prev && page - prev > 1) {
                      items.push(<Pagination.Ellipsis key={`ellipsis-${page}`} disabled />);
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
                <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          </Card.Body>
        </Card>



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

        @media (min-width: 1200px) {
          .container-xl,
          .container-lg,
          .container-md,
          .container-sm,
          .container {
            max-width: 1354px !important;
          }
        }

                     /* Change background of active button */
.custom-pagination .page-item.active .page-link {
  background-color: #A22191; /* Bootstrap magenta color */
  border: none;
  color: white;
}
      `}</style>
    </>
  );
};

export default ContactReport;
