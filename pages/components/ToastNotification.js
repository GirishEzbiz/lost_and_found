import Image from "next/image";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastNotification = ({ show, onClose, message, variant }) => {
  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={show} onClose={onClose} bg={variant} autohide delay={3000}>
          <Toast.Header>
            <strong className="me-auto">System</strong>
            <small>Now</small>
          </Toast.Header>
          <Toast.Body style={{ color: "white" }}>{message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default ToastNotification;
