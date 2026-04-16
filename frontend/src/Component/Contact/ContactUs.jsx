import React, { useEffect, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import BageshwarLeafletMap from "./BageshwarLeafletMap";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ContactUs = () => {
  const [contactUs, setContactUs] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectcontact_us`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res.data.length > 0) {
          const item = res.data[0];

          setContactUs({
            description: item.description,
            address: item.address,
            email1: item.email1,
            email2: item.email2,
            phone1: item.phone1,
            phone2: item.phone2,
            website: item.website,

            socialIcons:
              typeof item.social_icons === "string"
                ? JSON.parse(item.social_icons)
                : item.social_icons || [],

            // ✅ FIXED — correct API key
            bannerImage: `${BASE_URL}${item.banner_image}`,
          });
        }
      })
      .catch((err) => console.log("Fetch Error:", err));
  }, []);

  if (!contactUs) {
    return <p className="text-center py-5">Loading...</p>;
  }

  return (
    <>
    <section className="contact-section" style={{paddingTop:"20px"}}>
      <div className="wrapper2 py-5">
        <div className="row align-items-center">

          {/* Left Section */}
          <div className="col-lg-8 col-md-12 mb-4">
            <h2 className="contact-heading">
              <i className="fa fa-envelope"></i> Contact Us
            </h2>

            <p>{contactUs.description}</p>

            <div className="contact-info mt-4">

              <div className="contact-item">
                <i className="fa fa-map-marker"></i>
                <span>
                  <strong>Visit Us:</strong><br />
                  {contactUs.address}
                </span>
              </div>

              <div className="contact-item">
                <i className="fa fa-envelope"></i>
                <span>
                  <strong>Email Us:</strong><br />
                  <a href={`mailto:${contactUs.email1}`}>{contactUs.email1}</a><br />
                  <a href={`mailto:${contactUs.email2}`}>{contactUs.email2}</a>
                </span>
              </div>

              <div className="contact-item">
                <i className="fa fa-phone"></i>
                <span>
                  <strong>Call Us:</strong><br />
                  <NavLink to={`tel:${contactUs.phone1}`}>{contactUs.phone1}</NavLink><br />
                  <NavLink to={`tel:${contactUs.phone2}`}>{contactUs.phone2}</NavLink>
                </span>
              </div>

              <div className="contact-item">
                <i className="fa fa-globe"></i>
                <span>
                  <strong>Website:</strong><br />
                  <NavLink to={contactUs.website}>{contactUs.website}</NavLink>
                </span>
              </div>

              <div className="social-icons mt-3">
                {contactUs.socialIcons.map((item, i) => (
                  <NavLink key={i} to={item.link}>
                    <i className={`${item.icon} fa-lg`} />
                  </NavLink>
                ))}
              </div>

            </div>
          </div>

          {/* Right Image */}
          <div className="col-lg-4 col-md-12 mb-4 whatsapp-banner text-center">
            <img
              className="img-fluid rounded-4 shadow"
              src={contactUs.bannerImage}   // ✅ FIXED
              alt="Banner"
              style={{ width: "100%",  objectFit: "cover" }}
            />
          </div>

        </div>
      </div>
      
    </section>

     {/* Map */}
      <div className="container-fluid map-container p-0 m-0 mb-5">

        <BageshwarLeafletMap />
       
      </div>
    </>
    
  );
};

export default ContactUs;
