import React from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RazorpayButton = () => {
  const handlePayment = async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/api/createOrder`, {
        amount: 50000, // 500 INR in paise
        currency: "INR",
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID, // ✅ frontend key
        amount: data.amount,
        currency: data.currency,
        name: "Bageshwar Dham",
        description: "Test Transaction",
        order_id: data.id,
        handler: function (response) {
          alert("Payment successful: " + response.razorpay_payment_id);
        },
        prefill: {
          name: "Ashok",
          email: "ashok@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  return (
    <button onClick={handlePayment} className="btn btn-primary" style={{marginTop: '200px'}}>
      Pay with Razorpay
    </button>
  );
};

export default RazorpayButton;
