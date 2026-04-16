import React, { useState } from "react";


const DonationModal = ({ open, onClose }) => {

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [user, setUser] = useState({ name: "", email: "", mobile: "" });

  const fixedAmounts = [1100, 5100, 11000];

  const loadRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    script.onload = () => openPayment();
  };

  const openPayment = () => {
    let finalAmount = Number(amount);

    const options = {
      key: "YOUR_RAZORPAY_KEY",
      amount: finalAmount * 100,
      currency: "INR",
      name: "Shri Bageshwar Dham",
      description: "Donation Payment",
      prefill: {
        name: user.name,
        email: user.email,
        contact: user.mobile,
      },
      handler: function (response) {
        alert("Payment Success: " + response.razorpay_payment_id);
      },
      theme: { color: "#ff6600" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        {/* ---------- STEP 1 : Amount Selection ---------- */}
        {step === 1 && (
          <>
            <div className="modal-header">
              <h3>Donation Amount</h3>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="section">
              <label>Enter Custom Amount</label>
              <input
                type="number"
                className="input"
                placeholder="₹"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <label>Select Fixed Amount</label>
              <div className="fixed-amounts">
                {fixedAmounts.map((amt) => (
                  <button
                    key={amt}
                    className={`amount-btn ${amount === String(amt) ? "active" : ""}`}
                    onClick={() => setAmount(String(amt))}
                  >
                    ₹ {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="footer">
              <button
                className="next-btn"
                onClick={() => amount && setStep(2)}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* ---------- STEP 2 : User Details ---------- */}
        {step === 2 && (
          <>
            <div className="modal-header">
              <h3>Your Details</h3>
              <button className="close-btn" onClick={onClose}>×</button>
            </div>

            <div className="section">
              <input
                className="input"
                type="text"
                placeholder="Full Name"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
              <input
                className="input"
                type="number"
                placeholder="Mobile Number"
                value={user.mobile}
                onChange={(e) => setUser({ ...user, mobile: e.target.value })}
              />
            </div>

            <div className="footer">
              <button className="back-btn" onClick={() => setStep(1)}>Back</button>
              <button
                className="next-btn"
                onClick={() => loadRazorpay()}
              >
                Pay ₹ {Number(amount).toLocaleString()}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default DonationModal;
