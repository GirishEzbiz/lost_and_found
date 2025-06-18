import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios"; // Handle HTTP requests
import Support from "pages/support";
import GoBack from "../backButton";
import { Button, Form, Card, Alert } from "react-bootstrap";

const RenewSubscription = () => {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const GST_RATE = 0.18; // 18% GST
  const [selectedYears, setSelectedYears] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0); // Initialize correctly
  const [isChecked, setIsChecked] = useState(false); // To track checkbox state
  const [gstin, setGstin] = useState(""); // To store GSTIN input value
  const [error, setError] = useState(""); // General error
  const [gstinError, setGstinError] = useState(""); // GSTIN input error

  useEffect(() => {
    if (id) {
      fetchItemDetails();
    }
  }, [id]);

  useEffect(() => {
    const subtotal = selectedYears * 10;
    const gstAmount = subtotal * GST_RATE;
    setTotalAmount(subtotal + gstAmount);
  }, [selectedYears]); // Recalculate on selection change

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/getItems?item_id=${id}`);
      const data = await response.json();

      if (data.length > 0) {
        setItem(data[0]);
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      setMessage("Failed to fetch item details.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Checkbox Change
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    if (!isChecked) {
      setError(""); // Clear error when checked
    }
  };

  // ✅ Validate GSTIN
  const validateGstin = (gstin) => {
    const gstinRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  // ✅ Handle GSTIN Input Change
  const handleGstinChange = (e) => {
    const input = e.target.value.toUpperCase();
    setGstin(input);

    // Validate GSTIN Format
    if (!validateGstin(input)) {
      setGstinError(
        "Invalid GSTIN number! Please enter a valid 15-digit GSTIN."
      );
    } else {
      setGstinError(""); // Clear error if valid
    }
  };

  // ✅ Handle Subscription Change
  const handleSubscriptionChange = (event) => {
    const years = parseInt(event.target.value, 10);
    setSelectedYears(years);
    const subtotal = years * 10;
    const gstAmount = subtotal * GST_RATE;
    setTotalAmount(subtotal + gstAmount);
  };

  // ✅ Validate Before Payment
  const validateAndProceedToPayment = () => {
    if (isChecked && gstin.trim() === "" && !validateGstin(gstin)) {
      setGstinError("Invalid GSTIN! Please enter a correct GSTIN number.");
      return;
    }

    // If everything is fine, proceed with payment
    handlePayment();
  };

  // ✅ Handle Payment with Razorpay
  const handlePayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/createOrder", {
        amount: totalAmount * 100, // Convert to paisa (₹1 = 100 paisa)
        currency: "INR",
        receipt: `receipt_${id}_${Date.now()}`,
        gstin: gstin,
      });

      const { orderId } = response.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: totalAmount * 100,
        currency: "INR",
        name: process.env.COMPANY_NAME,
        description: `Subscription renewal for ${item.item_name}`,
        order_id: orderId,
        handler: async function (response) {
          const verifyResponse = await axios.post("/api/verifyPayment", {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            itemId: id,
            years: selectedYears,
            totalAmount,
            gstin: gstin,
          });

          if (verifyResponse.status === 200) {
            setMessage("Payment successful! Subscription renewed.");
            router.push("/dashboard/items"); // Redirect after success
          } else {
            setMessage("Payment verification failed.");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      console.error("Payment error:", error);
      setMessage("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center bg-white p-3">
        <GoBack />
        <div className="w-100">
          <h4 className="mb-0 text-black" style={{ marginLeft: "5%" }}>
            Renew Subscription
          </h4>
        </div>
      </div>

      <div className="container py-5 mb-15">
        {loading ? (
          <p>Loading...</p>
        ) : item ? (
          <Card className="p-4 shadow">
            {(() => {
              const expiryDate = new Date(item.expiry_date);
              const today = new Date();
              const diffTime = expiryDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

              let bgColor = "";
              let borderColor = "";
              let leftBorderColor = "";
              let iconColor = "";
              let heading = "";
              let headingColor = "";
              let message = "";

              if (diffDays < 0) {
                // ❌ Already expired
                bgColor = "#fff4f4";
                borderColor = "#f08080";
                leftBorderColor = "#ff4d4f";
                iconColor = "#f44336";
                heading = "❌ Protection Expired!";
                headingColor = "#d32f2f";
                message = `Your subscription for ${
                  item.item_name
                } expired on ${expiryDate.toLocaleDateString()}.`;
              } else if (diffDays <= 14) {
                // ⚠ Expiring within 2 weeks
                bgColor = "#fffbe6";
                borderColor = "#ffe58f";
                leftBorderColor = "#faad14";
                iconColor = "#fa8c16";
                heading = "⚠ Protection Expiring Soon!";
                headingColor = "#d48806";
                message = `Your subscription for ${
                  item.item_name
                } will expire on ${expiryDate.toLocaleDateString()}.`;
              } else {
                // ✅ More than 2 weeks left
                bgColor = "#e6f7ff";
                borderColor = "#91d5ff";
                leftBorderColor = "#1890ff";
                iconColor = "#1890ff";
                heading = "✅ Protection Active";
                headingColor = "#096dd9";
                message = `Your subscription for ${
                  item.item_name
                } is active until ${expiryDate.toLocaleDateString()}.`;
              }

              return (
                <div
                  className="d-flex align-items-start p-3 mb-3"
                  style={{
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderLeft: `4px solid ${leftBorderColor}`,
                    borderRadius: "12px",
                    maxWidth: "400px",
                    margin: "0 auto",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    className="me-3"
                    style={{ fontSize: "24px", color: iconColor }}
                  >
                    <i className="bi bi-bell-fill"></i>
                  </div>
                  <div>
                    <h6
                      style={{
                        color: headingColor,
                        fontWeight: 600,
                        marginBottom: "4px",
                      }}
                    >
                      {heading}
                    </h6>
                    <p
                      className="mb-1"
                      style={{ color: "#666", fontSize: "14px" }}
                    >
                      {message}
                    </p>
                  </div>
                </div>
              );
            })()}

            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Extend Protection</Form.Label>
                <Form.Select
                  onChange={handleSubscriptionChange}
                  value={selectedYears}
                >
                  <option value={1}>1 Year - ₹10</option>
                  <option value={2}>2 Years - ₹20</option>
                  <option value={3}>3 Years - ₹30</option>
                  <option value={4}>4 Years - ₹40</option>
                  <option value={5}>5 Years - ₹50</option>
                </Form.Select>
              </Form.Group>

              <div className="border p-3 rounded bg-light">
                <h5 className="fw-bold">
                  Total Payable: ₹{totalAmount.toFixed(2)}
                </h5>
              </div>

              <Card className="text-center p-4">
                <Form>
                  <Form.Check
                    type="checkbox"
                    label="I have a GSTIN"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                  />
                  {error && (
                    <Alert variant="danger" className="mt-3">
                      {error}
                    </Alert>
                  )}

                  {isChecked && (
                    <Form.Group controlId="gstin" className="mt-3">
                      <Form.Control
                        type="text"
                        value={gstin}
                        onChange={handleGstinChange}
                        placeholder="Enter GSTIN Number"
                      />
                      {gstinError && (
                        <Alert variant="danger" className="mt-2">
                          {gstinError}
                        </Alert>
                      )}
                    </Form.Group>
                  )}
                </Form>
              </Card>

              <Button
                variant="success"
                type="button"
                className="w-100 mt-3"
                onClick={validateAndProceedToPayment}
                disabled={loading}
              >
                {loading ? "Processing..." : `Pay ₹${totalAmount.toFixed(2)}`}
              </Button>
            </Form>
          </Card>
        ) : (
          <p>Item not found.</p>
        )}
      </div>
    </>
  );
};

export default RenewSubscription;
