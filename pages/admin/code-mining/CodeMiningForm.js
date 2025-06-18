import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Form, Button, Row, Col, Alert } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

const CodeMiningForm = ({ tempId }) => {
  const router = useRouter();
  const [brands, setBrands] = useState([]);
  const [skuData, setSkuData] = useState([]);
  const [errors, setErrors] = useState({});
  const [codeMiningData, setCodeMiningData] = useState({
    template_name: "",
    brand_id: "",
    sku_id: "",
    description: "",
    total_codes: "",
    // code_length: "",
    // code_type: "",
    expiry_date: "",
    price_per_code: "",
    total_price: "",
  });
  const pricePerCodeValue = 10;
  const [error, setError] = useState("");

  useEffect(() => {
    setCodeMiningData((prev) => ({
      ...prev,
      price_per_code: prev.price_per_code, // Ensure price_per_code is kept
      total_price:
        prev.total_codes && prev.price_per_code
          ? prev.total_codes * prev.price_per_code
          : "",
    }));
  }, [codeMiningData.total_codes, codeMiningData.price_per_code]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandsResponse = await fetch("/api/admin/brands");
        const brandsData = await brandsResponse.json();
        setBrands(brandsData);

        const skuResponse = await fetch("/api/admin/sku");
        const skuData = await skuResponse.json();
        setSkuData(skuData);

        if (tempId) {
          const codeMiningResponse = await fetch(
            `/api/admin/codeMining?id=${tempId}`
          );
          const templateData = await codeMiningResponse.json();
          const template = templateData[0];
          setCodeMiningData({
            brand_id: template.brand_id,
            sku_id: template.sku_id,
            description: template.description,
            // code_length: template.code_length,
            total_codes: Number(template.total_codes),
            // code_type: template.code_type,
            expiry_date: template.expiry_date,
            price_per_code: template.price_per_code,
            total_price: template.total_price,
          });
        }
      } catch (error) {
        console.log("error fetching data", error);
      }
    };
    if (tempId) fetchData();
  }, [tempId]);

  const handleCreate = async (inputValue) => {
    try {
      // Send request to backend to create new SKU
      const response = await axios.post("/api/admin/sku", {
        name: inputValue, // Send name directly
        category_id: 18, // Arbitrary large number
        subcategory_id: 2,
      });
      

      if (response.data && response.data.skuId) {
        const newSKU = { id: response.data.skuId, name: inputValue };

        // Update local state with new SKU
        setSkuData((prev) => [...prev, newSKU]);

        // Update selected SKU ID
        setCodeMiningData((prev) => ({
          ...prev,
          sku_id: newSKU.id,
        }));
      }
    } catch (error) {
      console.log("error crete data", error);
    }
  };

  // Validation logic
  const validateFields = () => {
    const validationErrors = {};
    if (!codeMiningData.brand_id)
      validationErrors.brand_id = "Brand is required.";
    if (!codeMiningData.sku_id) validationErrors.sku_id = "SKU is required.";
    if (!codeMiningData.description.trim())
      validationErrors.description = "Description is required.";
    if (!codeMiningData.total_codes || codeMiningData.total_codes <= 0)
      validationErrors.total_codes = "Total Codes must be a positive number.";
    // if (!codeMiningData.code_length || codeMiningData.code_length <= 0)
    //   validationErrors.code_length = "Code Length must be a positive number.";
    // if (!codeMiningData.code_type.trim())
    //   validationErrors.code_type = "Code Type is required.";
    if (!codeMiningData.price_per_code)
      validationErrors.price_per_code = "price per code is required";
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFields()) return; // Stop if validation fails

    try {
      const allData = {
        ...codeMiningData,
        indate: new Date().toISOString(), // ISO format date
      };

      const requestOptions = {
        method: tempId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allData),
      };
      const response = await fetch(
        tempId ? `/api/admin/codeMining?id=${tempId}` : "/api/admin/codeMining",
        requestOptions
      );

      if (response.ok) {
        router.push("/admin/code-mining");
      } else {
        const error = await response.json();
        setError(error.message || "Error saving the data.");
      }
    } catch (error) {
      console.log("error saveing data", error);
      setError("Error saving the data.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Auto-fill price_per_code when brand is selected
    if (name === "brand_id") {
      const selectedBrand = brands.find((brand) => brand.id == value);
      setCodeMiningData((prev) => ({
        ...prev,
        [name]: value,
        price_per_code: selectedBrand ? selectedBrand.price_per_code : "",
      }));
    } else {
      setCodeMiningData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear validation errors
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        {error && <Alert variant="danger">{error}</Alert>}

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group controlId="brand_id">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                name="template_name"
                placeholder="Enter Template Name"
                value={`${codeMiningData.template_name}`}
                onChange={handleChange}
                isInvalid={!!errors.template_name}
              />

              <Form.Control.Feedback type="invalid">
                {errors.template_name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
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
                      // Call function to send new SKU to backend
                      handleCreate(selectedOption.value);
                    } else {
                      // If it's an existing SKU, just update the state
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
                onCreateOption={handleCreate} // Handles new SKU creation
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
              />
              <Form.Control.Feedback type="invalid">
                {errors.description}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="price_per_code">
              <Form.Label>Price Per Code</Form.Label>
              <Form.Control
                type="text"
                name="price_per_code"
                placeholder="₹"
                value={`${codeMiningData.price_per_code}`}
                onChange={handleChange}
                isInvalid={!!errors.code_length}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code_length}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group controlId="total_codes">
              <Form.Label>Total Codes</Form.Label>
              <Form.Control
                type="number"
                name="total_codes"
                value={codeMiningData.total_codes}
                onChange={handleChange}
                isInvalid={!!errors.total_codes}
              />
              <Form.Control.Feedback type="invalid">
                {errors.total_codes}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          {/* <Col md={6}>
            <Form.Group controlId="code_type">
              <Form.Label>Code Type</Form.Label>
              <Form.Control
                type="text"
                name="code_type"
                value={codeMiningData.code_type}
                onChange={handleChange}
                isInvalid={!!errors.code_type}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code_type}
              </Form.Control.Feedback>
            </Form.Group>
          </Col> */}
          <Col md={6}>
            <Form.Group controlId="expiry_date">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="date"
                name="expiry_date"
                value={codeMiningData.expiry_date}
                onChange={handleChange}
                isInvalid={!!errors.expiry_date}
              />
              <Form.Control.Feedback type="invalid">
                {errors.code_type}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>

          <Col md={12}>
            <Form.Group controlId="total_price">
              <Form.Label>Total price (Auto-Calculated)</Form.Label>
              <Form.Control
                type="text"
                name="total_price"
                value={codeMiningData.total_price}
                readOnly // ✅ Prevents user from editing
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit">
          {tempId ? "Update" : "Generate"}
        </Button>
      </Form>
    </>
  );
};

export default CodeMiningForm;
