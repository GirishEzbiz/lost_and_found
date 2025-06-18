import { useEffect, useMemo, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  Pagination,
  Form,
  Button,
  CardBody,
  Modal,
} from "react-bootstrap";
import Image from "next/image";
import { useRouter } from "next/router";

import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { IoInformationCircleOutline } from "react-icons/io5";
import QRCode from "react-qr-code";
import { exportStatusData } from "utils/exportStatusData";
import ExportButton from "./ExportButton";
import Link from "next/link";
import Cookies from "js-cookie";
import Select from "react-select";

const SKUListPage = () => {
  const [qrdata, setQrdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    brand: "",
    sku: "",
    fromDate: "",
    toDate: "",
  });

  const [tokenData, setTokenData] = useState();
  const [showModal, setShowModal] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [brandId, setBrandId] = useState(null);
  const [skus, setSkus] = useState([]);
  const [downloadQr, setDownloadQr] = useState([]);
  const [excleData, setExcleData] = useState();
  const [selectedSR, setSelectedSr] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [brands, setBrands] = useState([]);
  const itemsPerPage = Cookies.get("Page-limit");

  const router = useRouter();
  const batchId = useMemo(
    () => router.query.batchId ?? null,
    [router.query.batchId]
  );
  const qrBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const token = Cookies.get("adminToken");
    if (token) {
      setTokenData(decodeJWT(token));
    }
  }, []);

  useEffect(() => {
    const fetchBrandsAndSkus = async () => {
      try {
        setLoading(true);
        const [brandsResponse, skusResponse] = await Promise.all([
          fetch("/api/admin/brands"),
          fetch("/api/admin/sku"),
        ]);

        const brandsData = await brandsResponse.json();
        const skusData = await skusResponse.json();

        setBrands(
          brandsData.map((brand) => ({
            value: Number(brand.id),
            label: brand.name,
          }))
        );
        setSkus(skusData.map((sku) => ({ value: sku.id, label: sku.name })));
      } catch (error) {
        console.log("error fetching brands/skus", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandsAndSkus();
  }, []);

  useEffect(() => {
    if (tokenData && router.isReady) {
      fetchQrs(currentPage, filters.brand, filters.sku);
      fetchDownloadQrs(filters.brand, filters.sku);
    }
  }, [
    tokenData,
    currentPage,
    filters.brand,
    filters.sku,
    router.isReady,
    batchId,
  ]);

  useEffect(() => {
    const data = downloadQr?.map((item) => ({
      Serial_No: item.serial_number,
      Brand_Name: item.brand_name,
      SKU_Name: item.sku_name,
      Assigning_Date: item.created_at,
      Exp_Date: item.expiry_date,
      Status: item.status,
      Encrypted_Code: item.qr_code,
    }));
    setExcleData(data);
  }, [downloadQr]);

  const fetchQrs = async (page = 1, brand, sku) => {
    try {
      setLoading(true);
      setError(null);

      let brandId = brand ? Number(brand) : tokenData?.brand_id;
      let skuID = sku ? Number(sku) : null;

      let apiUrl = "/api/admin/qrcodes?";
      if (brandId) apiUrl += `brand_id=${brandId}&`;
      if (skuID) apiUrl += `sku_id=${skuID}&`;
      if (batchId) apiUrl += `batch_id=${batchId}&`;
      apiUrl += `page=${page}&limit=${itemsPerPage}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch QR data");

      const data = await response.json();
      setQrdata(data.qr_codes || []);
      setTotalPages(data.total_pages || 1);
    } catch (error) {
      console.error("fetchQrs error", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadQrs = async (brand, sku) => {
    try {
      setLoading(true);
      setError(null);
      let brandId = brand ? Number(brand) : tokenData?.brand_id;
      let skuID = sku ? Number(sku) : null;

      let apiUrl = "/api/admin/downloadqrmanager?";
      if (brandId) apiUrl += `brand_id=${brandId}&`;
      if (skuID) apiUrl += `sku_id=${skuID}&`;
      if (batchId) apiUrl += `batch_id=${batchId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch download QR data");

      const data = await response.json();
      setDownloadQr(data.qr_codes || []);
    } catch (error) {
      console.error("fetchDownloadQrs error", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("decodeJWT error", error);
      return null;
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleQrClick = (qr, sr, brand_id) => {
    setSelectedQr(qr);
    setSelectedSr(sr);
    setBrandId(brand_id);
    setShowModal(true);
    Cookies.set("scanned_brand_id", brand_id, { expires: 1, path: "/" });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedQr(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>QR Code Ledger</h3>
        </Col>
        <Col className="text-end">
          <ExportButton
            data={excleData}
            setError={setError}
            filters={filters}
            batchId={batchId}
          />
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group controlId="brandFilter">
                <Form.Label>Brand</Form.Label>
                <Select
                  name="brand"
                  value={
                    brands.find((b) => b.value === Number(filters.brand)) ||
                    null
                  }
                  options={brands}
                  isClearable
                  isLoading={loading}
                  isSearchable
                  classNamePrefix="react-select"
                  placeholder="Search and select a brand"
                  onChange={(selectedOption) => {
                    setFilters((prev) => ({
                      ...prev,
                      brand: selectedOption ? Number(selectedOption.value) : "",
                    }));
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="skuFilter">
                <Form.Label>SKU</Form.Label>
                <Select
                  name="sku"
                  value={skus.find((s) => s.value === filters.sku) || null}
                  options={skus}
                  isClearable
                  isLoading={loading}
                  isSearchable
                  classNamePrefix="react-select"
                  placeholder="Search and select a SKU"
                  onChange={(selectedOption) => {
                    setFilters((prev) => ({
                      ...prev,
                      sku: selectedOption ? selectedOption.value : "",
                    }));
                  }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="fromDateFilter">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={filters.fromDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="toDateFilter">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={filters.toDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : qrdata.length === 0 ? (
          <div className="text-center my-5">
            <Image
              src="/images/not-found.png"
              alt="No data available"
              width={200}
              height={200}
            />
            <h5 className="text-muted">No QR Found</h5>
            <Link href="/admin/sku-master/create" passHref>
              <span className="text-primary fw-bold ms-2 text-decoration-underline">
                + Add New
              </span>
            </Link>
          </div>
        ) : (
          <>
            <CardBody className="pt-0">
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <table
                  className="text-nowrap table-centered mt-0 table"
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
                      <th>#</th>
                      <th>Serial No</th>
                      <th>Allocated Brand</th>
                      <th>SKU Name</th>
                      <th>Status</th>
                      <th>Tracking Status</th>
                      <th>Downloaded</th>
                      <th>Date Added</th>
                      <th>Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {qrdata.map((qrs, index) => (
                      <tr key={qrs.id}>
                        <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                        <td>{qrs.serial_number}</td>
                        <td>{qrs.brand_name}</td>
                        <td>{qrs.sku_name}</td>
                        <td>{exportStatusData(qrs.status)}</td>
                        <td>
                          <span
                            className={`badge ${
                              qrs.is_recovered
                                ? "bg-warning"
                                : qrs.is_found
                                ? "bg-primary"
                                : qrs.is_lost
                                ? "bg-danger"
                                : qrs.is_activated
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {qrs.is_recovered
                              ? "Item Recovered"
                              : qrs.is_found
                              ? "Item Found"
                              : qrs.is_lost
                              ? "Item Lost"
                              : qrs.is_activated
                              ? "Registered"
                              : "Unregistered"}
                          </span>
                        </td>
                        <td>
                          {qrs.is_downloaded === 1
                            ? formatDate(qrs.download_date)
                            : "Not Downloaded"}
                        </td>
                        <td>{formatDate(qrs.created_at)}</td>
                        <td>{formatDate(qrs.expiry_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination className="justify-content-end">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
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
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </CardBody>
          </>
        )}
      </Card>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>QR Code Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedQr ? (
            <>
              <h5>Generated QR Code</h5>
              <QRCode
                value={
                  brandId == 75
                    ? `https://coupon-redeem.vercel.app/scan-page/${selectedQr}`
                    : `${qrBaseUrl}/qr/${selectedQr}`
                }
                size={256}
              />
              <div className="mt-3">
                <p>{selectedSR}</p>
              </div>
            </>
          ) : (
            <Spinner animation="border" variant="primary" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const QrManagerPage = () => {
  const [qrdata, setQrdata] = useState([]);
  const [skus, setSkus] = useState([]);
  const [filteredSkus, setFilteredSkus] = useState([]);
  const [trackingStatuses, setTrackingStatuses] = useState([]);
  const [filters, setFilters] = useState({
    serial_number: "",
    user_mobile: "",
    sku: "",
    tracking_status: "",
    registration_date: "",
    expiry_date: "",
  });
  const [tokenData, setTokenData] = useState();
  const [excleData, setExcleData] = useState();
  const [selectedQr, setSelectedQr] = useState(null);
  const [selectedSR, setSelectedSr] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = Cookies.get("Page-limit");
  const qrBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("Error decoding JWT", err);
      return null;
    }
  };

  useEffect(() => {
    const token = Cookies.get("adminToken");
    if (token) {
      setTokenData(decodeJWT(token));
    }
  }, []);

  useEffect(() => {
    if (tokenData?.brand_id) fetchSkus();
  }, [tokenData]);

  const fetchSkus = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/sku?brandId=${tokenData.brand_id}`
      );
      const data = await response.json();
      const formattedSkus = data.map((sku) => ({
        value: sku.id,
        label: sku.name,
      }));
      setSkus(formattedSkus);
      setFilteredSkus(formattedSkus);
    } catch (err) {
      console.error("Error fetching SKUs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQrs = async (
    page = 1,
    status = filters.tracking_status,
    sku = filters.sku
  ) => {
    try {
      setLoading(true);
      setError(null);
      let queryParams = new URLSearchParams({
        brand_id: tokenData?.brand_id,
        page,
        limit: itemsPerPage,
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      if (status) queryParams.set("tracking_status", status);
      if (sku) queryParams.set("sku_id", sku);
      const response = await fetch(
        `/api/admin/qrcodes?${queryParams.toString()}`
      );
      const data = await response.json();
      setQrdata(data.qr_codes || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Error fetching QR data", err);
      setError("Failed to fetch QR codes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenData) fetchQrs(currentPage);
  }, [tokenData, currentPage]);

  useEffect(() => {
    const uniqueStatuses = [...new Set(qrdata.map((q) => q.status))];
    setTrackingStatuses(uniqueStatuses);
  }, [qrdata]);

  useEffect(() => {
    const data = qrdata.map((item) => ({
      Serial_No: item.serial_number,
      Brand_Name: item.brand_name,
      SKU_Name: item.sku_name,
      Assigning_Date: item.created_at,
      Exp_Date: item.expiry_date,
      Status: item.status,
      Encrypted_Code: item.qr_code,
    }));
    setExcleData(data);
  }, [qrdata]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) setCurrentPage(page);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    await fetchQrs(1);
    setSearchLoading(false);
  };

  const handleReset = async () => {
    setResetLoading(true);
    setFilters({
      serial_number: "",
      user_mobile: "",
      sku: "",
      tracking_status: "",
      registration_date: "",
      expiry_date: "",
    });
    await fetchQrs(1, "", "");
    setResetLoading(false);
  };

  const handleQrClick = (qr, sr) => {
    setSelectedQr(qr);
    setSelectedSr(sr);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedQr(null);
  };

  return (
    <Container fluid className="p-2" style={{ width: "95%" }}>
      <Row className="align-items-center my-2">
        <Col>
          <h3>QR Code Manager</h3>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm mb-3">
        <Card.Body>
          <Row>
            <Col md={2}>
              <Form.Label>Serial No</Form.Label>
              <Form.Control
                type="text"
                name="serial_number"
                value={filters.serial_number}
                onChange={handleChange}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Phone No</Form.Label>
              <Form.Control
                type="text"
                name="user_mobile"
                value={filters.user_mobile}
                onChange={handleChange}
              />
            </Col>
            <Col md={2}>
              <Form.Label>SKU</Form.Label>
              <Form.Select
                name="sku"
                value={filters.sku}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {filteredSkus.map((sku) => (
                  <option key={sku.value} value={sku.value}>
                    {sku.label}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Tracking Status</Form.Label>
              <Form.Select
                name="tracking_status"
                value={filters.tracking_status}
                onChange={handleChange}
              >
                <option value="">All</option>
                <option value="Unregistered">Unregistered</option>
                <option value="Registered">Registered</option>
                <option value="Item Lost">Item Lost</option>
                <option value="Item Found">Item Found</option>
                <option value="Item Recovered">Item Recovered</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label>Registration Date</Form.Label>
              <Form.Control
                type="date"
                name="registration_date"
                value={filters.registration_date}
                onChange={handleChange}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                name="expiry_date"
                value={filters.expiry_date}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col md={3} className="d-flex align-items-end">
              <Button
                variant="primary"
                className="px-4 py-1"
                onClick={handleSearch}
                disabled={searchLoading}
              >
                {searchLoading ? "Searching..." : "Search"}
              </Button>
              <Button
                variant="secondary"
                className="ms-2 px-4 py-1"
                onClick={handleReset}
                disabled={resetLoading}
              >
                {resetLoading ? "Resetting..." : "Reset"}
              </Button>
            </Col>
          </Row>
        </Card.Body>

        {loading ? (
          <div className="d-flex justify-content-center my-5">
            <Spinner animation="border" />
          </div>
        ) : qrdata.length === 0 ? (
          <div className="text-center my-5">
            <Image
              src="/images/not-found.png"
              alt="No data"
              width={200}
              height={200}
            />
            <h5 className="text-muted">No QR Found</h5>
            <Link href="/admin/sku-master/create" passHref>
              <span className="text-primary fw-bold ms-2 text-decoration-underline">
                + Add New
              </span>
            </Link>
          </div>
        ) : (
          <CardBody className="pt-0">
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              <Table responsive bordered hover>
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Serial No</th>
                    <th>Phone No</th>
                    <th>SKU Name</th>
                    <th>Tracking Status</th>
                    <th>Registration Date</th>
                    <th>Expiry Date</th>
                    <th>QR</th>
                  </tr>
                </thead>
                <tbody>
                  {qrdata.map((qrs, idx) => (
                    <tr key={qrs.id}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{qrs.serial_number}</td>
                      <td>{qrs.user_mobile}</td>
                      <td>{qrs.sku_name}</td>
                      <td>
                        <span
                          className={`badge ${
                            qrs.is_recovered
                              ? "bg-warning"
                              : qrs.is_found
                              ? "bg-primary"
                              : qrs.is_lost
                              ? "bg-danger"
                              : qrs.is_activated
                              ? "bg-success"
                              : "bg-secondary"
                          }`}
                        >
                          {qrs.is_recovered
                            ? "Item Recovered"
                            : qrs.is_found
                            ? "Item Found"
                            : qrs.is_lost
                            ? "Item Lost"
                            : qrs.is_activated
                            ? "Registered"
                            : "Unregistered"}
                        </span>
                      </td>
                      <td>{formatDate(qrs.registration_date)}</td>
                      <td>{formatDate(qrs.expiry_date)}</td>
                      <td>
                        <IoInformationCircleOutline
                          onClick={() =>
                            handleQrClick(qrs.qr_code, qrs.serial_number)
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <Pagination className="justify-content-end">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => Math.abs(p - currentPage) <= 1)
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
          </CardBody>
        )}
      </Card>

      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>QR Code Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {selectedQr ? (
            <>
              <QRCode value={`${qrBaseUrl}/qr/${selectedQr}`} size={256} />
              <div className="mt-3">
                <p>{selectedSR}</p>
              </div>
            </>
          ) : (
            <Spinner animation="border" />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const QRManagement = () => {
  const [tokenData, setTokenData] = useState(null);

  function decodeJWT(token) {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.log("error fetching token", error);
    }
  }

  useEffect(() => {
    const token = Cookies.get("adminToken");
    if (token) {
      setTokenData(decodeJWT(token));
    }
  }, []);

  // Render QrManagerPage if brand_id exists, otherwise render SKUListPage
  return (
    <>{tokenData?.brand_id !== null ? <QrManagerPage /> : <SKUListPage />}</>
  );
};

export default QRManagement;
