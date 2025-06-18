import { useState } from "react";
import Swal from "sweetalert2";

export default function RazorpayButton() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    const res = await fetch("/api/brand/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: 500, currency: "INR" }), // ₹5
    });

    const order = await res.json();
    
    const options = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Your Company",
      description: "Test Transaction",
      order_id: order.id,
      handler: function (response) {
        Swal.fire({
          icon: "success",
          title: "Payment Successful!",
          text: "Your transaction was completed successfully.",
          confirmButtonColor: "#3085d6",
        });
     
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
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{ padding: "10px 20px", background: "blue", color: "white" }}
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}
