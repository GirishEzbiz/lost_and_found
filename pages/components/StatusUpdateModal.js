 
import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import Select from "react-select";

const StatusUpdateModal = ({
  show,
  handleClose,
  handleFetchQR,
  setFetchLoading,
  handleUpdate,
  fetchloading,
  qrData,
}) => {
  const [fetchCriteria, setFetchCriteria] = useState("sku_brand"); // Default fetch method
  const [searchData, setSearchData] = useState({
    sku: "",
    brand: "",
    fromRange: "",
    toRange: "",
  });
  const [errors, setErrors] = useState({
    sku: "",
    brand: "",
    fromRange: "",
    toRange: "",
  });

  const [updateField, setUpdateField] = useState(""); // Expiry date or Status
  const [updateValue, setUpdateValue] = useState(""); // New value to update
  const [skus, setSkus] = useState([]);

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const statusOptions = [
    { value: 1, label: "Active" }, // 1 for Active
    { value: 6, label: "Disposed" }, // 0 for Inactive
  ];

  const fetchSkus = async () => {
    try {
      const response = await fetch("/api/admin/sku");
      const data = await response.json();
      setSkus(data.skus);
    } catch (error) {
      console.log("error fetching skus",error);


  } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch("/api/admin/brands");
      const data = await response.json();
      setBrands(data.brands);
    } catch (error) {
      console.log("error fetching brands",error);

        } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkus();
  }, []);
  useEffect(() => {
    fetchBrands();
  }, []);




  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData({ ...searchData, [name]: value });
  };

  const handleFetchQRAction = async (fetchc, searchData) => {
    setFetchLoading(true);

    setErrors({
      sku: "",
      brand: "",
      fromRange: "",
      toRange: "",
    });

    if (!fetchc) {
      console.error("fetchc cannot be null or undefined");
      setFetchLoading(false);
      return;
    }

    if (
      searchData &&
      typeof searchData === "object" &&
      Object.keys(searchData)?.length > 0
    ) {
      const { sku, brand, fromRange, toRange } = searchData;

      if (fetchc === "sku_brand") {
        if (!sku) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            sku: "SKU is required",
          }));
        }
        if (!brand) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            brand: "Brand is required",
          }));
        }
        if (!sku || !brand) {
          setFetchLoading(false);
          return;
        }
      }

      if (fetchc === "range") {
        if (!fromRange) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            fromRange: "From Range is required",
          }));
        }
        if (!toRange) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            toRange: "To Range is required",
          }));
        }
        if (!fromRange || !toRange) {
          setFetchLoading(false);
          return;
        }
      }

      try {
        await handleFetchQR(fetchc, searchData);
      } catch (error) {
        console.log("error fetching qr codes",error);

          }
    } else {
      console.error("searchData must be a non-empty object with valid keys");
    }

    setFetchLoading(false);
  };
  const handleUpdateFieldChange = (e) => {
    setUpdateField(e.target.value);
    setUpdateValue(""); // Reset update value when field changes
  };

  const handleUpdateClick = async () => {
    setUpdateLoading(true); // ✅ Start loader

    try {
      await handleUpdate(updateField, updateValue);
      setSuccessMessage("QR updated successfully!");

      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.log("error processing req",error);

      setSuccessMessage(
          "Error: " + (error.response?.data?.message || "Something went wrong!")
      );
  } finally {
      setTimeout(() => {
        setUpdateLoading(false);
      }, 1000);
       // ✅ Ensure the loader stops
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Update QR Code Status</Modal.Title>
      </Modal.Header>
      {successMessage && (
        <div className="alert alert-success text-center">{successMessage}</div>
      )}

      <Modal.Body>
        <Row>
          {/* Initially Full Width, Shrinks When Data is Fetched */}
          <Col md={qrData?.length > 0 ? 8 : 12} className="transition-all">
            {/* Fetch Options */}
            <Form.Group>
              <Form.Label>Select Fetch Criteria</Form.Label>
              <Form.Control
                as="select"
                value={fetchCriteria}
                onChange={(e) => setFetchCriteria(e.target.value)}
              >
                <option value="sku_brand">By SKU or Brand</option>
                <option value="range">By Range</option>
              </Form.Control>
            </Form.Group>

            {fetchCriteria === "sku_brand" && (
              <Row className="mt-3">
                <Col md={6}>
                  <Select
                    value={skus?.find(
                      (option) => option.value === searchData.sku
                    )}
                    onChange={(selectedOption) =>
                      setSearchData({
                        ...searchData,
                        sku: selectedOption.value,
                      })
                    }
                    options={skus?.map((sku) => ({
                      value: sku.id,
                      label: sku.name,
                    }))}
                    placeholder="Enter SKU"
                  />
                </Col>
                <Col md={6}>
                  <Select
                    value={brands?.find(
                      (option) => option.value === searchData.brand
                    )}
                    onChange={(selectedOption) =>
                      setSearchData({
                        ...searchData,
                        brand: selectedOption.value,
                      })
                    }
                    options={brands?.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    }))}
                    placeholder="Enter Brand"
                  />
                </Col>
              </Row>
            )}

            {fetchCriteria === "range" && (
              <Row className="mt-3">
                <Col md={6}>
                  <Form.Control
                    type="text"
                    name="fromRange"
                    value={searchData.fromRange}
                    onChange={handleInputChange}
                    placeholder="Enter From Range"
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    type="text"
                    name="toRange"
                    value={searchData.toRange}
                    onChange={handleInputChange}
                    placeholder="Enter To Range"
                  />
                </Col>
              </Row>
            )}

            {/* Fetch Button */}
            <Row className="mt-3 text-center">
              <Col>
                <Button
                  variant="primary"
                  onClick={() => handleFetchQRAction(fetchCriteria, searchData)}
                  className="w-50"
                >
                  {fetchloading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Fetch QR Codes"
                  )}
                </Button>
              </Col>
            </Row>
          </Col>

          {/* Loader & Fetched QR Data - Appears on Right When Data is Available */}
          {qrData?.length > 0 && (
            <Col md={4} className="transition-all">
              <div className="border p-3 bg-light rounded">
                <h5 className="text-center text-success fw-bold mb-3">
                  Fetched QR Data
                </h5>
                <p>
                  <strong>Total QR:</strong> {qrData[0]?.total_qr_codes}
                </p>
                <p>
                  <strong>Registered:</strong> {qrData[0]?.Allocated}
                </p>
                <p>
                  <strong>Deactive:</strong> {qrData[0]?.Disposed}
                </p>
              </div>
            </Col>
          )}
        </Row>

        {/* Show Update Field Only When QR Data is Available */}
        {qrData?.length > 0 && (
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Update Field</Form.Label>
                <Form.Control
                  as="select"
                  className="form-select"
                  value={updateField}
                  onChange={handleUpdateFieldChange}
                >
                  <option value="">Select Field to Update</option>
                  <option value="expiry_date">Expiry Date</option>
                  <option value="status">Status</option>
                </Form.Control>
              </Form.Group>
            </Col>

            {updateField && (
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Enter New{" "}
                    {updateField === "expiry_date" ? "Expiry Date" : "Status"}
                  </Form.Label>

                  {updateField === "expiry_date" ? (
                    <Form.Control
                      type="date"
                      value={updateValue}
                      onChange={(e) => setUpdateValue(e.target.value)}
                    />
                  ) : (
                    <Select
                      value={statusOptions.find(
                        (option) => option.value === updateValue
                      )}
                      onChange={(selectedOption) =>
                        setUpdateValue(selectedOption.value)
                      }
                      options={statusOptions}
                      placeholder="Select Status"
                    />
                  )}
                </Form.Group>
              </Col>
            )}
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        {qrData?.length > 0 && (
          <>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateClick}
              disabled={updateLoading} // ✅ Correct state
            >
              {updateLoading ? ( // ✅ Correct state
                <Spinner animation="border" size="sm" />
              ) : (
                "Update QR Codes"
              )}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default StatusUpdateModal;
