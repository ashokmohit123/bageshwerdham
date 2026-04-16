import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const Donate = () => {
  const [projects, setProjects] = useState([]);
  const [heading, setHeading] = useState("");
  const [topdescription, setTopDescription] = useState("");
  const [qrbanner, setQrBanner] = useState("");
  const [hdfcbankbanner, setHdfcBankBanner] = useState("");
  const [sbibankbanner, setSbiBankBanner] = useState("");
  const [bottomBanner, setBottomBanner] = useState("");

  // ---------- MODAL STATES ----------
  const [openModal, setOpenModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    mobile: ""
  });

  const fixedAmounts = [1100, 5100, 11000];

  // ---------- Fetch Donation Projects ----------
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectdonation`, { headers: { apikey: "12345" } })
      .then((res) => {
        const data = res.data;
        setProjects(data || []);

        if (data.length > 0) {
          setHeading(data[0].heading || "");
          setTopDescription(data[0].topdescription || "");
          setQrBanner(data[0].qrbanner || "");
          setHdfcBankBanner(data[0].hdfcbankbanner || "");
          setSbiBankBanner(data[0].sbibankbanner || "");
          setBottomBanner(data[0].bottombanner || "");
        }
      })
      .catch((err) => console.error("API fetch error:", err));
  }, []);

  // ---------- OPEN MODAL ----------
  const openDonationModal = (project) => {
    setSelectedProject(project);
    setAmount(project.amount); // default amount
    setStep(1);
    setOpenModal(true);
  };

  // ---------- LOAD RAZORPAY ----------
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ---------- PAYMENT ----------
  const handlePayment = async () => {
    if (!amount || !userDetails.email || !userDetails.mobile) {
      alert("Please fill all fields");
      return;
    }

    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      alert("Razorpay SDK load failed");
      return;
    }

    try {
      const order = await axios.post(`${BASE_URL}/api/createOrder`, {
        projectId: selectedProject.id,
        amount: Number(amount)
      });

      const options = {
        key: RAZORPAY_KEY,
        amount: order.data.amount,
        currency: "INR",
        name: "Shri Bageshwar Dham",
        description: selectedProject?.name,
        order_id: order.data.id,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
          contact: userDetails.mobile
        },
        handler: async (response) => {
          await axios.post(`${BASE_URL}/api/savePayment`, {
            projectId: selectedProject.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            amount: amount,
            status: "success"
          });

          alert("Payment Successful!");
          setOpenModal(false);
        },
        theme: { color: "#ff6600" }
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert("Payment initialization failed");
      console.error(err);
    }
  };

  return (
    <>
      <div className="donate-section">

        {/* TOP SECTION */}
        <div className="section">
          <h2>{heading}</h2>
          <p>{topdescription}</p>

          <div className="image-row">
            <div className="image-left">
              <img src={`${BASE_URL}${qrbanner}`} alt="QR" />
            </div>

            <div className="image-right">
              <img src={`${BASE_URL}${hdfcbankbanner}`} alt="HDFC" />
              <img src={`${BASE_URL}${sbibankbanner}`} alt="SBI" />
            </div>
          </div>
        </div>

        {/* DONATION PROJECT CARDS */}
        <div className="donation-grid">
          {projects.map((project) => (
            <div className="col-md-3 col-sm-6 col-12" key={project.id}>
              <div className="card-div-info">
                <img src={`${BASE_URL}${project.image}`} className="img-fluid" alt="bank banner" />

                <div className="card-body">
                  <h5>{project.name}</h5>
                  <p>{project.description}</p>
                  <p><strong>Amount:</strong> ₹{project.amount}</p>

                  <button
                    className="btn btn-primary"
                    onClick={() => openDonationModal(project)}
                  >
                    Donate Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM BANNER */}
        {bottomBanner && (
          <div className="new-section">
            <img src={`${BASE_URL}${bottomBanner}`} alt="Bottom Banner" />
          </div>
        )}
      </div>

      {/* ---------------- MODAL UI ---------------- */}
      {openModal && (
        <div className="rzp-modal-overlay">
          <div className="rzp-modal">

            {/* Step 1 – Amount Selection */}
            {step === 1 && (
              <>
               <h5>Donation Amount</h5>
              <div className="donation-top-header">
                <p><img src="./assets/images/BHAGESHWER-DHAAM_LOGO-300x169.png" width="80px" height="50px" alt="logo"/>SHRI BAGESHWAR JAN SEVA SAMITI GADHA</p>
              </div>
               
               <div className="donation-amout-project">
               <label>{selectedProject?.name}</label>
                <input
                  type="number"
                  className="input"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="₹"
                />

                <label className="pt-4">Select Fixed Amount</label>
                <div className="fixed-row">
                  {fixedAmounts.map((amt) => (
                    <button
                      key={amt}
                      className={`fixed-btn ${amount === amt ? "active" : ""}`}
                      onClick={() => setAmount(amt)}
                    >
                      ₹ {amt}
                    </button>
                  ))}
                </div>

                <button className="next-btn" onClick={() => setStep(2)}>
                  Next
                </button>
                </div>
              </>
            )}

            {/* Step 2 – User Details */}
            {step === 2 && (
              <>
              
                 <h5>Donor Details</h5>
                  <div className="donation-top-header">
                <p><img src="./assets/images/BHAGESHWER-DHAAM_LOGO-300x169.png" width="80px" height="50px" alt="logo"/>SHRI BAGESHWAR JAN SEVA SAMITI GADHA</p>
              </div>
              
 <div className="donation-amout-project">
                <input
                  className="input"
                  placeholder="Full Name"
                  value={userDetails.name}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, name: e.target.value })
                  }
                />

                <input
                  className="input"
                  placeholder="Email"
                  type="email"
                  value={userDetails.email}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, email: e.target.value })
                  }
                />

                <input
                  className="input"
                  placeholder="Mobile"
                  type="number"
                  value={userDetails.mobile}
                  onChange={(e) =>
                    setUserDetails({ ...userDetails, mobile: e.target.value })
                  }
                />

                <div className="btn-row">
                  <button className="back-btn" onClick={() => setStep(1)}>
                    Back
                  </button>

                  <button className="pay-btn" onClick={handlePayment}>
                    Pay ₹{amount}
                  </button>
                </div>
                </div>
              </>
            )}

            <button className="close-modal" onClick={() => setOpenModal(false)}>
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Donate;
