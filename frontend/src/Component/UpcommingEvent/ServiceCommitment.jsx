import React, { useEffect, useState} from "react";
import { NavLink } from 'react-router-dom';
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;


// ✅ Static array of service data


const ServiceCommitment = () => {

const [servicesData, setServicesData] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_servicecommitments`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setServicesData(res.data); // ✅ Store full array
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Loader check
  if (!Array.isArray(servicesData)) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  


  return (
    <section className='service-commitment-section' style={{ backgroundColor: "#f8f9fa", padding: "40px 0" }}>
      <div className="wrapper2 py-2">
        <h1 className="text-center heading">💠Our Initiative – Service and Commitment</h1>
        <p className="text-center">
          The initiative of Bageshwar Dham is dedicated to the service of society and the upliftment of humanity.
        </p>

        <div className="row mt-4">
          {servicesData.map((service) => (
            <div className="col-md-6 mb-4" key={service.id}>
              <div className="card card-custom">
                <div className="service-commitment-icon">
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <img
                  src={`${BASE_URL}${service.img}`}
                  className="card-img-top"
                  alt={service.title}
                />
                <div className="card-body">
                  <h4 className="card-title">{service.title}</h4>
                  <p className="card-text">{service.description}</p>
                </div>
                <NavLink to="/donate" className="support-btn">🙏 Support Us</NavLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCommitment;
