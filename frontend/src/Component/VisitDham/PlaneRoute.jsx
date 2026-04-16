import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;


const PlaneRoute = () => {

 const [planeRoute, setPlaneRoute] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvisitdham_planroute`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res.data.length > 0) {
          const item = res.data[0];

          setPlaneRoute({
            title: item.title,
            subtitle1: item.subtitle1,
            subtitle2: item.subtitle2,
            airport: item.airport,
            distanceInfo:
              typeof item.distanceInfo === "string"
                ? JSON.parse(item.distanceInfo)
                : item.distanceInfo || [],
            image: `${BASE_URL}${item.image}`,
          });
        }
      })
      .catch((err) => console.log("Fetch Error:", err));
  }, []);

  if (!planeRoute) {
    return <p className="text-center py-5">Loading...</p>;
  }

  return (
    <section className="bageshwar-dham-train-route py-10 md:py-20">
      <div className="wrapper2 py-4">
        <div className="row card-container">

          {/* LEFT — TEXT */}
          <div className="col-md-6 left">
            <div className="info-card">
              <h5 className="mb-3">
                <i className="fa fa-plane"></i> {planeRoute.title}
              </h5>

              <p>{planeRoute.subtitle1}</p>
              <p>{planeRoute.subtitle2}</p>

              {/* AIRPORT INFO */}
              <div className="details-card">
                <h6>✈️ 1. {planeRoute.airport}</h6>
              </div>

              {/* DISTANCE INFO */}
             <div className="details-card">
                <h6>Distance from the airport:</h6>

                {planeRoute.distanceInfo.length > 0 ? (
                  <ul>
                    <li>📍 Distance: {planeRoute.distanceInfo[0].distance}</li>
                    <li>🚖🛺 Travel Time: {planeRoute.distanceInfo[0].time}</li>
                  </ul>
                ) : (
                  <p>No distance data found</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT — IMAGE */}
          <div className="col-md-6 right">
            <div className="image-card">
              <img
                src={planeRoute.image}
                alt="Plane Route"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PlaneRoute;
