import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from 'react-router-dom';


const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DivyaMission = () => {

    const [missionPoints, setMissionPoints] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_divyamission`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMissionPoints(res.data); // ✅ Store full array
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Loader check
  if (!Array.isArray(missionPoints)) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }


  return (
    <div className="wrapper2 py-3 divya-mission-section">
      <div className="card-header text-center bg-white rounded-4 py-5 header-section">
        <h1 className="mb-0">
          ❤️  Become a part of this divine mission
        </h1>
      </div>
      <div className="card rounded-4 shadow-sm mx-auto" style={{ marginBottom: '40px' }}>
        {/* Main Content */}
        <div className="card-body text-center">
          <h5 className="card-title">
            🙏  Join hands with Bageshwar Dham for the service of humanity and religion
          </h5>
          <hr className="w-25 mx-auto" />
          <div className='divyamission-description my-4'>
            <p>Your contribution can help:</p>
            <ul className="list-unstyled">
              {missionPoints.map(({ id, icon, text, colorClass }) => (
                <li key={id}>
                  <span className={colorClass} style={{ marginRight: "8px" }}>{icon}</span> {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="card-footer text-center bg-white">
          <NavLink to="/donate" className="btn btn-success rounded-pill">
            🙏  Collaborate
          </NavLink>
        </div>

        {/* Footer */}
        <div className="card-footer text-center bg-white border-0">
          <small className="text-muted">
            <div className="text-danger" />🌱 Your contribution is your service — and your service is the path to liberation. 🕉️<div className="text-brown" />
          </small>
        </div>
      </div>
    </div>
  );
};

export default DivyaMission;
