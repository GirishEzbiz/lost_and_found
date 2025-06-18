import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";
import axios from "axios";

const AddBatchModal = ({ showModal, onClose, onSuccess, batches }) => {
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [template, setTemplate] = useState([]);

  const [batchData, setBatchData] = useState({
    batch_name: "",
    template_id: "",
    total_codes: "",
    start_sr_no: "", // Initialize as empty string
    end_sr_no: "", // Initialize as empty string
    expiry_date: "",
    created_by: 1,
  });

  const getTemplate = async () => {
    try {
      const res = await axios.get(`/api/admin/codeMining`);
      setTemplate(res?.data?.data);
    } catch (err) {
      console.log("Error fetching template", err);
    }
  };

  const calculateSerialNumbers = (batches, selectedTemplateTotalCodes) => {
    const maxEndSrNo = batches.length
      ? Math.max(...batches.map((batch) => parseInt(batch.end_sr_no) || 0))
      : 0;

    const startSrNo = maxEndSrNo + 1;
    const endSrNo = startSrNo + selectedTemplateTotalCodes - 1;

    return {
      startSrNo: String(startSrNo).padStart(11, "0"),
      endSrNo: String(endSrNo).padStart(11, "0"),
    };
  };

  useEffect(() => {
    if (showModal) {
      getTemplate();
    }
  }, [showModal]);

  // Validate form inputs
  const validate = () => {
    const validationErrors = {};

    if (!batchData.batch_name.trim())
      validationErrors.batch_name = "Batch name required.";
    if (!batchData.total_codes || batchData.total_codes <= 0)
      validationErrors.total_codes = "Total codes must be positive.";
    if (!String(batchData.start_sr_no).trim())
      validationErrors.start_sr_no = "Start Serial No is required.";
    if (!String(batchData.end_sr_no).trim())
      validationErrors.end_sr_no = "End Serial No is required.";
    if (!batchData.expiry_date)
      validationErrors.expiry_date = "Expiry date is required.";

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle template select
  const handleTemplateSelect = (templateId) => {
    const selected = template.find((tpl) => tpl.id === templateId);
    setBatchData((prev) => ({
      ...prev,
      template_id: selected ? selected.id : "",
    }));

    if (selected) {
      const { startSrNo, endSrNo } = calculateSerialNumbers(
        batches,
        selected.total_codes
      );
      setBatchData((prev) => ({
        ...prev,
        start_sr_no: startSrNo,
        end_sr_no: endSrNo,
        total_codes: selected.total_codes,
      }));
    }

    setErrors((prev) => ({ ...prev, template_id: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...batchData };

    try {
      const res = await fetch("/api/admin/batchs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess?.(); // Callback after success
        onClose(); // Close modal
        setBatchData({
          batch_name: "",
          template_id: "",
          total_codes: "",
          start_sr_no: "",
          end_sr_no: "",
          expiry_date: "",
          created_by: 1,
        });
      } else {
        const err = await res.json();
        setError(err.message || "Error submitting batch.");
      }
    } catch (err) {
      console.log("Save error:", err);
      setError("Error saving the batch.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBatchData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
        <Modal.Title>Create Batch</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {error && <Alert variant="danger">{error}</Alert>}

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="batch_name">
                <Form.Label>Batch Name</Form.Label>
                <Form.Control
                  type="text"
                  name="batch_name"
                  value={batchData.batch_name}
                  onChange={handleChange}
                  isInvalid={!!errors.batch_name}
                  placeholder="Enter batch name"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.batch_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="template_id">
                <Form.Label>Template</Form.Label>
                <Select
                  name="template_id"
                  value={
                    template?.find((tpl) => tpl.id === batchData.template_id)
                      ? {
                          value: batchData.template_id,
                          label: template.find(
                            (tpl) => tpl.id === batchData.template_id
                          ).template_name,
                        }
                      : null
                  }
                  onChange={(selectedOption) => {
                    handleTemplateSelect(selectedOption?.value);
                  }}
                  options={template.map((tpl) => ({
                    value: tpl.id,
                    label: tpl.template_name,
                  }))}
                  isClearable
                  placeholder="Select a template"
                  classNamePrefix="react-select"
                  className={errors.template_id ? "is-invalid" : ""}
                />
                {errors.template_id && (
                  <div className="invalid-feedback d-block">
                    {errors.template_id}
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="start_sr_no">
                <Form.Label>Start Serial No</Form.Label>
                <Form.Control
                  type="text"
                  name="start_sr_no"
                  value={batchData.start_sr_no}
                  onChange={handleChange}
                  isInvalid={!!errors.start_sr_no}
                  placeholder="Start serial no"
                  disabled
                />
                <Form.Control.Feedback type="invalid">
                  {errors.start_sr_no}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="end_sr_no">
                <Form.Label>End Serial No</Form.Label>
                <Form.Control
                  type="text"
                  name="end_sr_no"
                  value={batchData.end_sr_no}
                  onChange={handleChange}
                  isInvalid={!!errors.end_sr_no}
                  placeholder="End serial no"
                  disabled
                />
                <Form.Control.Feedback type="invalid">
                  {errors.end_sr_no}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="total_codes">
                <Form.Label>Total Codes</Form.Label>
                <Form.Control
                  type="number"
                  name="total_codes"
                  value={batchData.total_codes}
                  onChange={handleChange}
                  isInvalid={!!errors.total_codes}
                  disabled
                />
                <Form.Control.Feedback type="invalid">
                  {errors.total_codes}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="expiry_date">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control
                  type="date"
                  name="expiry_date"
                  value={batchData.expiry_date}
                  onChange={handleChange}
                  isInvalid={!!errors.expiry_date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.expiry_date}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button variant="secondary" className="me-2" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ background: "#a22191", border: "none", color: "white" }}>
              Add Batch
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddBatchModal;
