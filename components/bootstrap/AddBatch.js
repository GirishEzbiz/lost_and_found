// pages/admin/add-batch.js (or your relevant path)

import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Form, Button, Row, Col, Alert, Container, Card } from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import Link from "next/link";
import { MdOutlineKeyboardBackspace } from "react-icons/md";


const AddBatch = () => {
    const router = useRouter();

    const [errors, setErrors] = useState({});
    const [error, setError] = useState("");
    const [template, setTemplate] = useState([]);


    const [batchData, setBatchData] = useState({
        batch_name: "",
        template_id: "",
        total_codes: "",
        start_sr_no: "",
        end_sr_no: "",
        expiry_date: "",
        created_by: 1,
    });


    const getTemplate = async () => {

        try {
            const res = await axios.get(`/api/admin/codeMining`);
            setTemplate(res.data);
        } catch (err) {
            console.log("Error fetching template", err);
        }

    }
    useEffect(() => {
        getTemplate();
    }, [])


    const validate = () => {
        const validationErrors = {};
       
        if (!batchData.batch_name.trim()) validationErrors.batch_name = "Batch name required.";
        if (!batchData.total_codes || batchData.total_codes <= 0)
            validationErrors.total_codes = "Total codes must be positive.";
        if (!batchData.start_sr_no.trim()) validationErrors.start_sr_no = "Start Serial No is required.";
        if (!batchData.end_sr_no.trim()) validationErrors.end_sr_no = "End Serial No is required.";
        if (!batchData.expiry_date) validationErrors.expiry_date = "Expiry date is required.";

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            ...batchData
        };



        try {
            const res = await fetch("/api/admin/batchs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/batchs");
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
        <Container fluid className="p-6">
            <Row className="align-items-center my-4">
                <Col>
                    <h3>Create Batch</h3>
                </Col>
                <Col className="text-end">
                    <Link href="/admin/batchs" passHref>
                        <Button variant="danger" className=""> <MdOutlineKeyboardBackspace className="me-2 fs-4" />Back</Button>
                    </Link>
                </Col>
            </Row>
            <Card className="shadow-sm ">
                <Card.Body>
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
                                            template.find((tpl) => tpl.id === batchData.template_id)
                                                ? {
                                                    value: batchData.template_id,
                                                    label: template.find((tpl) => tpl.id === batchData.template_id)
                                                        .template_name,
                                                }
                                                : null
                                        }
                                        onChange={(selectedOption) => {
                                            const selectedTemplate = template.find((tpl) => tpl.id === selectedOption?.value);
                                          
                                            setBatchData((prev) => ({
                                              ...prev,
                                              template_id: selectedTemplate ? selectedTemplate.id : "",
                                            }));
                                          
                                            setErrors((prev) => ({
                                              ...prev,
                                              template_id: "",
                                            }));
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

                        <Button type="submit" variant="primary">
                            Add Batch
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>

    );
};

export default AddBatch;
