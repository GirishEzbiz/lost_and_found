import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner, Form, Alert } from "react-bootstrap";
import axios from "axios"; // Handle HTTP requests
import { useRouter } from "next/router";
import logger from "lib/logger";
 
const RenewCodeMiningModal = ({ show, handleClose, tokenData, id }) => {
 

  const router = useRouter();
  const [codeMiningData, setCodeMiningData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(null);
  const [selectedYears, setSelectedYears] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const [newExpiryDate, setNewExpiryDate] = useState(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const fetchCodeMiningData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/codeMining?brand_id=${tokenData?.brand_id}`
        );
        const data = await response.json();

        if (tokenData) {
          const filteredData = data.filter(
            (d) => d.brand_id === tokenData?.brand_id
          );

        
          const dd = filteredData.find((d) => d.id == id);
          setCodeMiningData(dd);

          if (filteredData.length > 0) {
            const serviceToDate = new Date(filteredData[0]?.service_to);

            const today = new Date();
            setDaysLeft(
              Math.ceil((serviceToDate - today) / (1000 * 60 * 60 * 24))
            );
            setNewExpiryDate(serviceToDate);
          }
        }
      } catch (error) {
        console.log("error fetching codemining data",error);
    }
     finally {
        setLoading(false);
      }
    };

    if (show) fetchCodeMiningData();
  }, [show, tokenData]);
  useEffect(() => {
    if (!codeMiningData) return;

    const totalCodes = codeMiningData.total_code_generated || 0;
    setTotalAmount(totalCodes * 10 * selectedYears);

    if (codeMiningData.service_to) {
      const currentExpiry = new Date(codeMiningData.service_to);
      currentExpiry.setFullYear(currentExpiry.getFullYear() + selectedYears);
      setNewExpiryDate(currentExpiry);
    }
  }, [selectedYears, codeMiningData]);

  const cgst = totalAmount * 0.09;
  const sgst = totalAmount * 0.09;
  const grandTotal = totalAmount + cgst + sgst;

  const handlePayment = async () => {


    setLoading(true);
    try {
      const body = {
        amount: 500,
        currency: "INR",
        brand_id: tokenData?.brand_id, // Send brand_id along with payment request
      };

   
      const res = await fetch("/api/brand/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const order = await res.json();
      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: process.env.COMPANY_NAME,
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response) {


          const verifyBody = {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            batchId: id,
            brand_id: tokenData?.brand_id, // Include brand_id here too
            years: selectedYears,
            grandTotal,
          };



          const verifyResponse = await axios.post(
            "/api/brand/verifyPayment",
            verifyBody
          );

          if (verifyResponse.status === 200) {
            setMessage("Payment successful! Subscription renewed.");
            router.push("/admin/code-mining"); // Redirect after success
          } else {
            setMessage("Payment verification failed.");
          }
        },
        prefill: {
          name: "John Doe",
          email: "john@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      setLoading(false);
    } catch (error) {
      logger.error({ 
          message: "Payment Error", 
          stack: error.stack, 
          function: "processPayment" 
      });
  }
  
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Renew Subscription</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <div>
            {/* Expiry Alert */}
            <Alert variant="warning" className="text-center">
                Expired on {new Date(codeMiningData.service_to).toLocaleDateString("en-GB")} ({daysLeft} Days Left)
              </Alert>

            {/* Information Section */}
            <div className="border p-3 rounded mb-3">
              <div className="d-flex justify-content-between">
                <p>
                  <strong>SKU Name:</strong> {codeMiningData.sku_name}
                </p>
                <p>
                  <strong>From Range:</strong> {codeMiningData.from_range}
                </p>
              </div>

              <div className="d-flex justify-content-between">
                <p>
                  <strong>Total Codes:</strong>{" "}
                  {codeMiningData.total_code_generated}
                </p>
                <p>
                  <strong>To Range:</strong> {codeMiningData.to_range}
                </p>
              </div>
            </div>

            {/* Year Selection */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Extend for:</strong>
              </Form.Label>
              <div className="d-flex align-items-center">
                <Form.Control
                  as="select"
                  value={selectedYears}
                  onChange={(e) => setSelectedYears(Number(e.target.value))}
                  style={{ width: "50%" }} // Dropdown width 50%
                >
                  {[1, 2, 3, 4, 5].map((year) => (
                    <option key={year} value={year}>
                      {year} {year === 1 ? "Year" : "Years"}
                    </option>
                  ))}
                </Form.Control>
                <p className="ms-3 mt-2">
                  <strong>Extended to:</strong>{" "}
                  {newExpiryDate
                    ? newExpiryDate.toLocaleDateString("en-GB")
                    : "N/A"}
                </p>
              </div>
            </Form.Group>

            {/* Payment Details */}

            <div className="border p-3 rounded mb-3">
              <div className="d-flex justify-content-between">
                <p>
                  <strong>Base Amount:</strong> ₹{totalAmount.toFixed(2)}
                </p>
                <p>
                  <strong>CGST (9%):</strong> ₹{cgst.toFixed(2)}
                </p>
              </div>
              <div className="d-flex justify-content-between">
                <p>
                  <strong>SGST (9%):</strong> ₹{sgst.toFixed(2)}
                </p>
                <p>
                  <strong>Grand Total:</strong> ₹{grandTotal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Footer Button */}
            <div className="text-center">
              <Button variant="success" onClick={handlePayment}>
                Make Payment
              </Button>
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default RenewCodeMiningModal;
