import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  // const [email, setEmail] = useState("");
  // const [subscribeMessage, setSubscribeMessage] = useState("");

  // Fetch footer data
  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/selectfooter`, {
          headers: { apikey: "12345" },
        });
        setFooterData(res.data);
      } catch (err) {
        console.error("Error fetching footer data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);




  
  // Handle newsletter subscription
  // const handleSubscribe = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.post(`${BASE_URL}/subscribe`, { email });
  //     setSubscribeMessage(res.data.message || "Subscribed successfully!");
  //     setEmail("");
  //   } catch (err) {
  //     console.error("Subscription error:", err);
  //     setSubscribeMessage("Failed to subscribe. Please try again.");
  //   }
  // };

  if (loading) return <div>Loading footer...</div>;
  if (!footerData) return <div>No footer data found!</div>;

  // ✅ If API returns an array
  const { logo, description, socialLinks, quickLinks } =
    Array.isArray(footerData) ? footerData[0] || {} : footerData;

  // ✅ Parse JSON if needed
  const parsedSocialLinks = Array.isArray(socialLinks)
    ? socialLinks
    : JSON.parse(socialLinks || "[]");

  const parsedQuickLinks = Array.isArray(quickLinks)
    ? quickLinks
    : JSON.parse(quickLinks || "[]");

  return (
    <footer className="bg-black text-white py-5">
      <div className="container">
        <div className="row gy-4 justify-content-between">
          {/* Logo & Description */}
          <div className="col-md-3">
            <NavLink to="#" className="d-inline-block mb-3">
              <img src={`${BASE_URL}${logo}`} width="140" alt="Logo" />
            </NavLink>
            <p className="text-white-50 small" style={{fontSize: '16px'}}>{description}</p>
            <div className="d-flex gap-3 mt-3">
              {parsedSocialLinks.map((link, index) => (
                <NavLink key={index} to={link.url} className="text-white-50">
                  <i className={`fab fa-${link.icon} fa-lg`}></i>
                </NavLink>
                
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 col-sm-3 col-12">
            <h5 className="fw-bold mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              {parsedQuickLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <NavLink
                    to={link.url}
                    className="text-white-50 text-decoration-none"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-2 col-sm-3 col-12">
            <h5 className="fw-bold mb-3">Legal Information</h5>
            <ul className="list-unstyled">
              <li>
                <NavLink
                  to="/privacypolicy"
                  className="text-white-50 text-decoration-none"  
                >
                  Privacy Policy
                </NavLink>
              </li>
              
              <li>
                <NavLink
                  to="/termsofservice"
                  className="text-white-50 text-decoration-none"
                >
                  Terms of Service
                </NavLink>
              </li>
              {/* {parsedQuickLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <NavLink
                    to={link.url}
                    className="text-white-50 text-decoration-none"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))} */}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-md-3 get-in-touch">
            <h5 className="fw-bold mb-3">Get In Touch</h5>

           <div className="d-flex align-items-center mb-3">
          <span className="fa fa-map-marker me-3"></span>
          <p className="mb-0 text-white-50" style={{fontSize: '16px'}}>
            Bageshwar Dham, Village Gada, Post Ganj, Tehsil Rajnagar, Chhatarpur, MP, PIN 471001
          </p>
        </div>

         <div className="d-flex align-items-center mb-2">
          <span className="fa fa-envelope me-3"></span>
          <p className="mb-0 text-white-50" style={{fontSize: '16px'}}>
           bageswardhams@gmail.com
          </p>
         
        </div>

         <div className="d-flex align-items-center">
          <span className="fa fa-phone me-3"></span>
          <p className="mb-0 text-white-50" style={{fontSize: '16px'}}>
           +917055005553, +917055005554
          </p>
         
        </div>

            {/* <form className="d-flex flex-column gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-outline-light btn-sm rounded-pill"
              >
                Subscribe
              </button>
              {subscribeMessage && (
                <small className="text-success mt-1">{subscribeMessage}</small>
              )}
            </form> */}
          </div>
        </div>

        <hr className="border-secondary my-4" />
        <div className="text-center text-white-50 small">
          &copy; {new Date().getFullYear()} Bageshwar Dham. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
