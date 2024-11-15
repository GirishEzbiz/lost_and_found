import React, { useState } from "react";
import { Modal, Button, Table, Form } from "react-bootstrap";

export default function QrGenerate() {
  // State for form fields
  const [title, setTitle] = useState("");
  const [validity, setValidity] = useState("");
  const [numOfQr, setNumOfQr] = useState("");

  // State for managing the list of QR entries
  const [qrList, setQrList] = useState([]);

  // State for managing modal visibility
  const [showModal, setShowModal] = useState(false);

  // Toggle modal visibility
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Add new entry to the list
    setQrList([...qrList, { title, validity, numOfQr }]);

    // Reset form fields and close the modal
    setTitle("");
    setValidity("");
    setNumOfQr("");
    handleCloseModal();
  };

  return (
    <div className="container mt-4">
      <h3>QR Code List</h3>

      {/* Button to trigger the modal */}
      <Button variant="primary" onClick={handleShowModal}>
        Add QR Code
      </Button>

      {/* Table for listing QR codes */}
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Validity</th>
            <th>Number of QR</th>
          </tr>
        </thead>
        <tbody>
          {qrList.length > 0 ? (
            qrList.map((qr, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{qr.title}</td>
                <td>{qr.validity}</td>
                <td>{qr.numOfQr}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No QR Codes Available
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Modal for the QR code form */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFormSubmit}>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formValidity">
              <Form.Label>Validity</Form.Label>
              <Form.Control
                type="date"
                value={validity}
                onChange={(e) => setValidity(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="formNumOfQr">
              <Form.Label>Number of QR Codes</Form.Label>
              <Form.Control
                type="number"
                value={numOfQr}
                onChange={(e) => setNumOfQr(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="mt-3">
              Add
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
