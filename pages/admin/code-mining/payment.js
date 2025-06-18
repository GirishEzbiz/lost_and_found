import React from "react";
import { Modal, Button, Table } from "react-bootstrap";

const PaymentModal = ({ show, handleClose, totalAmount, selectedYears }) => {
  const cgst = totalAmount * 0.09;
  const sgst = totalAmount * 0.09;
  const grandTotal = totalAmount + cgst + sgst;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Payment Summary</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Table bordered>
          <tbody>
            <tr>
              <td>
                <strong>Years Selected:</strong>
              </td>
              <td>
                {selectedYears} {selectedYears === 1 ? "Year" : "Years"}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Base Amount:</strong>
              </td>
              <td>₹{totalAmount?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>CGST (9%):</strong>
              </td>
              <td>₹{cgst?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>SGST (9%):</strong>
              </td>
              <td>₹{sgst?.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Grand Total:</strong>
              </td>
              <td>
                <strong>₹{grandTotal?.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success">Pay Now</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentModal;
