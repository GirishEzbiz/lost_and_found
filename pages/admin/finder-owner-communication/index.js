import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Pagination, Modal } from "react-bootstrap";
import Cookies from "js-cookie";
import { dateFormat } from "utils/dateFormat";
import { FaImage, FaRegImage } from "react-icons/fa";

const FinderOwnerCommunication = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    finder_name: "",
    finder_city: "",
    owner_name: "",
    message_date: "",
  });

  const [visibleColumns, setVisibleColumns] = useState({
    finder_name: true,
    finder_contact: true,
    finder_city: true,
    finder_message: true,
    item_name: true,
    owner_name: true,
    owner_notified: true,
    notified_at: true,
    message_send_on: true,
  });

  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rloading, setRloading] = useState(false);
  const itemsPerPage = Cookies.get("Page-limit") || 50;
  const [totalItems, setTotalItems] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/finder-owner-communication");
      const result = await response.json();
      setData(result?.data);
      setFilteredData(result?.data);
      setTotalItems(result?.data?.length);
    } catch (error) {
      console.error("Error fetching finder-owner communication data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const saved = Cookies.get("finderOwnerVisibleColumns");
    if (saved) {
      try {
        setVisibleColumns(JSON.parse(saved));
      } catch (err) {
        console.error("Invalid visibleColumns cookie", err);
      }
    }
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    let filtered = data.filter((item) => {
      return (
        item.finder_name
          .toLowerCase()
          .includes(filters.finder_name.toLowerCase()) &&
        item.finder_city
          .toLowerCase()
          .includes(filters.finder_city.toLowerCase()) &&
        item.owner_name
          .toLowerCase()
          .includes(filters.owner_name.toLowerCase()) &&
        (!filters.message_date ||
          item.message_send_on?.startsWith(filters.message_date))
      );
    });

    setFilteredData(filtered);
    setCurrentPage(1);
    setTotalItems(filtered.length);
  };

  const resetFilters = () => {
    setFilters({
      finder_name: "",
      finder_city: "",
      owner_name: "",
      message_date: "",
    });
    setRloading(true);
    fetchData();
    setTimeout(() => setRloading(false), 500);
  };

  const toggleColumn = (key) => {
    const updated = {
      ...visibleColumns,
      [key]: !visibleColumns[key],
    };
    setVisibleColumns(updated);
    Cookies.set("finderOwnerVisibleColumns", JSON.stringify(updated), {
      expires: 7,
    });
  };

  const displayValue = (value) => (value ? value : "-");

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container-fluid p-3" style={{ width: "95%" }}>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">
        Finder-Owner Communication Report
      </h3>

      {/* Filter Section */}
      <div className="mb-3 p-3 bg-gray-100 rounded shadow-sm">
        <Form>
          <Row className="mb-2">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Finder Name</Form.Label>
                <Form.Control
                  type="text"
                  name="finder_name"
                  value={filters.finder_name}
                  onChange={handleFilterChange}
                  placeholder="Enter Finder Name"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Finder City</Form.Label>
                <Form.Control
                  type="text"
                  name="finder_city"
                  value={filters.finder_city}
                  placeholder="Enter Finder City"
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Owner Name</Form.Label>
                <Form.Control
                  type="text"
                  name="owner_name"
                  value={filters.owner_name}
                  placeholder="Enter Owner Name"
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Message Date</Form.Label>
                <Form.Control
                  type="date"
                  name="message_date"
                  value={filters.message_date}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12} className="d-flex justify-content-end">
              <Button  onClick={applyFilters} style={{ backgroundColor: "#A22191", color: "#fff", border: "none" }}>
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2"
                onClick={resetFilters}
              >
                {rloading ? "Resetting..." : "Reset"}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* Column Toggle */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <span className="mt-2">
          Showing {filteredData.length} of {totalItems}
        </span>
        <div>
          <span className="me-2">View</span>
          <Button
            variant="secondary"
            onClick={() => setShowColumnMenu(!showColumnMenu)}
          >
            ☰
          </Button>

          {showColumnMenu && (
            <div
              className="position-absolute bg-white border p-2 rounded shadow"
              style={{ zIndex: 999 }}
            >
              {Object.entries({
                finder_name: "Finder Name",
                finder_contact: "Finder Contact",
                finder_city: "Finder City",
                finder_message: "Finder Message",
                item_name: "Item Name",
                owner_name: "Owner Name",
                owner_notified: "Owner Notified",
                notified_at: "Notified At",
                message_send_on: "Message Sent On",
              }).map(([key, label]) => (
                <Form.Check
                  key={key}
                  type="checkbox"
                  label={label}
                  checked={visibleColumns[key]}
                  onChange={() => toggleColumn(key)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white shadow-md rounded-lg"
        style={{
          maxHeight: "500px",
          overflowY: "auto",
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        <table className="table  table-hover table-sm text-center">
          <thead className="bg-light" style={{ position: "sticky", top: 0 }}>
            <tr>
              <th>#</th>
              {visibleColumns.finder_name && <th>Finder Name</th>}
              {visibleColumns.finder_contact && <th>Finder Contact</th>}
              {visibleColumns.finder_city && <th>Finder City</th>}
              {visibleColumns.finder_message && <th>Finder Message</th>}
              {visibleColumns.message_send_on && <th>Message Sent On</th>}
              {visibleColumns.item_name && <th>Item Name</th>}
              {visibleColumns.owner_name && <th>Owner Name</th>}
              {visibleColumns.owner_notified && <th>Owner Notified</th>}
              {visibleColumns.notified_at && <th>Notified At</th>}
            </tr>
          </thead>
          <tbody>
            {currentData.length ? (
              currentData.map((item, index) => (
                <tr key={index}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  {visibleColumns.finder_name && (
                    <td>{displayValue(item.finder_name)}</td>
                  )}
                  {visibleColumns.finder_contact && (
                    <td>{displayValue(item.finder_contact)}</td>
                  )}
                  {visibleColumns.finder_city && (
                    <td>{displayValue(item.finder_city)}</td>
                  )}
                  {visibleColumns.finder_message && (
                    <td
                      title={item.finder_message} // Full message as tooltip
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        {/* Image icon (if available) */}
                        {item.finder_image && (
                          <span
                            onClick={() => {
                              setSelectedImage(item.finder_image);
                              setShowImageModal(true);
                            }}
                            style={{ cursor: "pointer" }}
                            title="Click to view image"
                          >
                            <FaImage size={20} />
                          </span>
                        )}

                        {/* Truncated message */}
                        <span>
                          {item.finder_message
                            ? item.finder_message.substring(0, 50) + "..."
                            : "-"}
                        </span>
                      </div>
                    </td>
                  )}

                  {visibleColumns.message_send_on && (

                    <td>
                      {/* {item.message_send_on
                        ? new Date(item.message_send_on).toLocaleString()
                        : "-"} */}
                      {dateFormat(item.message_send_on)}
                    </td>
                  )}
                  {visibleColumns.item_name && (
                    <td>{displayValue(item.item_name)}</td>
                  )}
                  {visibleColumns.owner_name && (
                    <td>{displayValue(item.owner_name)}</td>
                  )}
                  {visibleColumns.owner_notified && (
                    <td>
                      {item.owner_notified ? (
                        <span className="badge bg-success">✅ Yes</span>
                      ) : (
                        <span className="badge bg-secondary">No</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.notified_at && (
                    <td>
                      {/* {item.notified_at
                        ? new Date(item.notified_at).toLocaleString()
                        : "-"} */}
                      {dateFormat(item.notified_at)}
                    </td>
                  )}

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Finder Image</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Finder"
              style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "6px" }}
            />
          ) : (
            "No image available"
          )}
        </Modal.Body>
      </Modal>

      {/* Pagination */}
      <div className="d-flex justify-content-end mt-3">
        <Pagination className="custom-pagination">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)]
            .map((_, i) => i + 1)
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
  );
};

export default FinderOwnerCommunication;
