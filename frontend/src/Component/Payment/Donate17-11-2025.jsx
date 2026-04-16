import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Donate = () => {
  const [projects, setProjects] = useState([]);
  const [heading, setHeading] = useState("");
  const [bottomBanner, setBottomBanner] = useState("");
  const [topdescription, setTopDescription] = useState("");
  const [qrbanner, setQrBanner] = useState("");
  const [hdfcbankbanner, setHdfcBankBanner] = useState("");
  const [sbibankbanner, setSbiBankBanner] = useState("");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectdonation`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        const data = res.data;
        setProjects(data || []);
        if (data.length > 0) {
          setHeading(data[0].heading || "");
          setBottomBanner(data[0].bottombanner || "");
          setTopDescription(data[0].topdescription || "");
          setQrBanner(data[0].qrbanner || "");
          setHdfcBankBanner(data[0].hdfcbankbanner || "");
          setSbiBankBanner(data[0].sbibankbanner || "");
        }
      })
      .catch((err) => console.error("API fetch error:", err));
  }, []);

//donation payment start here

const handlePayment = async (project, e) => {
    e.preventDefault();

    try {
      // 1️⃣ Create order on backend
      const { data } = await axios.post(`${BASE_URL}/api/createOrder`, {
        projectId: project.id,
        amount: project.amount || 500, // amount in INR
      });

      if (!window.Razorpay) {
        alert("Razorpay SDK not loaded. Check index.html");
        return;
      }

      // 2️⃣ Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount, // in paise
        currency: data.currency,
        name: "Bageshwar Dham",
        description: project.description,
        order_id: data.id,
        handler: async function (response) {
          try {
            // ✅ Save minimal info in DB
            await axios.post(`${BASE_URL}/api/savePayment`, {
              projectId: project.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              amount: data.amount / 100,
              status: "success",
            });

            // ✅ Fetch full payment details from Razorpay via backend
            const paymentDetails = await axios.get(
              `${BASE_URL}/api/payment/${response.razorpay_payment_id}`
            );

            console.log("Full Payment Details:", paymentDetails.data);

            alert(
              `✅ Payment successful for ${project.name}. Amount: ₹${
                paymentDetails.data.amount / 100
              }`
            );
          } catch (err) {
            console.error("Error saving/fetching payment details:", err);
            alert("Payment completed but failed to save/fetch details.");
          }
        },
        prefill: {
          name: "Ashok",
          email: "ashok@example.com",
          contact: "9999999999",
        },
        theme: { color: "#3399cc" },
      };

      // 3️⃣ Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to initiate payment");
    }
  }

//donation payment close here

  return (
    <div className="donate-section">
      <div className="section">
        <h2>{heading}</h2>
        <p>{topdescription}</p>

        <div className="image-row">
          <div className="image-left">
            <img
              src={`${BASE_URL}${qrbanner}`}
              alt="Donation QR"
            />
          </div>
          <div className="image-right">
            <img
              src={`${BASE_URL}${hdfcbankbanner}`}
              alt="Right Top"
            />
           
            <img
              src={`${BASE_URL}${sbibankbanner}`}
              alt="Right Bottom"
            />
          </div>
        </div>
      </div>

      <div className="donation-grid">
        {projects.map((project) => (
  <div className="col-md-3 col-sm-6 col-12" key={project.id}>
    <div className="card-div-info">
      <img className="img-fluid" src={`${BASE_URL}${project.image}`} alt={project.heading} />
      <div className="card-body">
        <h5>{project.name}</h5>
        <p>{project.description}</p>
         <p><strong>Amount:</strong> ₹{project.amount}</p>

        {/* ✅ Different button for each project */}

        <button
  onClick={(e) => handlePayment(project, e)}
  className="btn btn-primary"
>
  Donate ₹{project.amount}
</button>

        {/* <button
          onClick={() => handlePayment(project)}
          className="btn btn-primary"
        >
          Donate to {project.name}
        </button> */}
      </div>
    </div>
  </div>
))}

      </div>

      {bottomBanner && (
        <div className="new-section">
          <img
            src={bottomBanner.startsWith("http") ? bottomBanner : `${BASE_URL}${bottomBanner}`}
            alt="QR code for donations"
          />
        </div>
      )}
    </div>
  );
};

export default Donate;
