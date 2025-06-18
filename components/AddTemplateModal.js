import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

const CodeMiningModal = ({ showModal, onClose, onSuccess, tempId }) => {
  const [brands, setBrands] = useState([]);
  const [skuData, setSkuData] = useState([]);
  const [errors, setErrors] = useState({});
  const [codeMiningData, setCodeMiningData] = useState({
    template_name: "",
    brand_id: "",
    sku_id: "",
    description: "",
    total_codes: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsResponse = await fetch("/api/admin/brands");
        const brandsss = await brandsResponse.json();
        const brandsData = brandsss.brands;
        setBrands(brandsData);

        const skuResponse = await fetch("/api/admin/sku");
        const skuss = await skuResponse.json();
        const skuData = skuss.skus;
        setSkuData(skuData);

        if (tempId) {
          const codeMiningResponse = await fetch(
            `/api/admin/codeMining?id=${tempId}`
          );
          const templateData = await codeMiningResponse.json();
          const template = templateData[0];
          setCodeMiningData({
            template_name: template.template_name,
            brand_id: template.brand_id,
            sku_id: template.sku_id,
            description: template.description,
            total_codes: Number(template.total_codes),
          });
        }
      } catch (error) {
        console.log("error fetching data", error);
      }
    };
    if (showModal) fetchData();
  }, [showModal, tempId]);

  const handleCreate = async (inputValue) => {
    try {
      const response = await axios.post("/api/admin/sku", {
        name: inputValue,
        category_id: 18,
        subcategory_id: 2,
      });

      if (response.data && response.data.skuId) {
        const newSKU = { id: response.data.skuId, name: inputValue };
        setSkuData((prev) => [...prev, newSKU]);
        setCodeMiningData((prev) => ({ ...prev, sku_id: newSKU.id }));
      }
    } catch (error) {
      console.log("error creating SKU", error);
    }
  };

  const validateFields = () => {
    const validationErrors = {};
    if (!codeMiningData.template_name.trim())
      validationErrors.template_name = "Template name is required.";
    if (!codeMiningData.brand_id)
      validationErrors.brand_id = "Brand is required.";
    if (!codeMiningData.sku_id) validationErrors.sku_id = "SKU is required.";

    if (!codeMiningData.total_codes || codeMiningData.total_codes <= 0)
      validationErrors.total_codes = "Total Codes must be a positive number.";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      const allData = {
        ...codeMiningData,
        indate: new Date().toISOString(),
      };

      const requestOptions = {
        method: tempId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allData),
      };
      const response = await fetch(
        tempId ? `/api/admin/codeMining?id=${tempId}` : "/api/admin/codeMining",
        requestOptions
      );

      if (response.ok) {
        onSuccess?.();
        onClose();
        setCodeMiningData({
          template_name: "",
          brand_id: "",
          sku_id: "",
          description: "",
          total_codes: "",
        });
        setErrors({});
      } else {
        const error = await response.json();
        setError(error.message || "Error saving the data.");
      }
    } catch (error) {
      console.log("error saving data", error);
      setError("Error saving the data.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCodeMiningData((prev) => ({ ...prev, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  return (
    <Modal
      show={showModal}
      onHide={onClose}
      backdrop="static"
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>{tempId ? "Edit" : "Create"} Template</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="template_name">
                <Form.Label>Template Name</Form.Label>
                <Form.Control
                  type="text"
                  name="template_name"
                  value={codeMiningData.template_name}
                  onChange={handleChange}
                  isInvalid={!!errors.template_name}
                  placeholder="Enter template name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.template_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="brand_id">
                <Form.Label>Brand</Form.Label>
                <Form.Control
                  as="select"
                  name="brand_id"
                  value={codeMiningData.brand_id}
                  onChange={handleChange}
                  isInvalid={!!errors.brand_id}
                >
                  <option value="">Select Brand</option>
                  {brands?.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.brand_id}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="sku_id">
                <Form.Label>SKU</Form.Label>
                <CreatableSelect
                  name="sku_id"
                  value={
                    skuData.find((sku) => sku.id === codeMiningData.sku_id)
                      ? {
                          value: codeMiningData.sku_id,
                          label: skuData.find(
                            (sku) => sku.id === codeMiningData.sku_id
                          )?.name,
                        }
                      : codeMiningData.sku_id
                      ? {
                          value: codeMiningData.sku_id,
                          label: codeMiningData.sku_id,
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    if (selectedOption) {
                      const isNewOption = !skuData.some(
                        (sku) => sku.id === selectedOption.value
                      );

                      if (isNewOption) {
                        handleCreate(selectedOption.value);
                      } else {
                        setCodeMiningData((prev) => ({
                          ...prev,
                          sku_id: selectedOption.value,
                        }));
                      }
                    } else {
                      setCodeMiningData((prev) => ({
                        ...prev,
                        sku_id: "",
                      }));
                    }
                  }}
                  onCreateOption={handleCreate}
                  options={skuData.map((sku) => ({
                    value: sku.id,
                    label: sku.name,
                  }))}
                  isClearable
                  classNamePrefix="react-select"
                  className={errors.sku_id ? "is-invalid" : ""}
                  placeholder="Select or create an SKU"
                  createOptionPosition="first"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.sku_id}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="total_codes">
                <Form.Label>Total No of  Codes </Form.Label>
                <Form.Control
                  type="number"
                  name="total_codes"
                  value={codeMiningData.total_codes}
                  onChange={handleChange}
                  isInvalid={!!errors.total_codes}
                  placeholder="Enter number of codes to generate"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.total_codes}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={codeMiningData.description}
                  onChange={handleChange}
                  isInvalid={!!errors.description}
                  placeholder="Type detail of this template if any ..."
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button variant="secondary" className="me-2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{background:"#a22191",border:"none",color:"white"}} >
              {tempId ? "Update" : "Create Template"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CodeMiningModal;
