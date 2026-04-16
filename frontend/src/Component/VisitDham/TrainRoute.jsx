import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TrainRoute = () => {
  const [trainRoute, setTrainRoute] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvisitdham_trainroute`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res.data.length > 0) {
          const item = res.data[0];

          setTrainRoute({
            title: item.title,
            subtitle1: item.subtitle1,
            subtitle2: item.subtitle2,
            stations:
              typeof item.stations === "string"
                ? JSON.parse(item.stations)
                : item.stations || [],
            image: `${BASE_URL}${item.image}`,
          });
        }
      })
      .catch((err) => console.log("Fetch Error:", err));
  }, []);

  if (!trainRoute) {
    return <p className="text-center py-5">Loading...</p>;
  }

  return (
    <section className="bageshwar-dham-train-route py-10 md:py-20">
      <div className="wrapper2 py-4">
        <div className="row card-container">

          {/* LEFT IMAGE */}
          <div className="col-md-6 left">
            <div className="image-card">
              <img src={trainRoute.image} alt="Train Route" />
            </div>
          </div>

          {/* RIGHT DETAILS */}
          <div className="col-md-6 right">
            <div className="info-card">
              <h5 className="mb-3">
                <i className="fa fa-train"></i> {trainRoute.title}
              </h5>

              <p>{trainRoute.subtitle1}</p>
              <p>{trainRoute.subtitle2}</p>

              {/* LOOP STATIONS */}
              {trainRoute.stations.map((s, i) => (
                <div className="details-card" key={i}>
                  <h6>🚉 {i + 1}. {s.name}</h6>
                  <ul>
                    <li>📍 Distance: {s.distance}</li>
                    <li>🚖🛺 Travel Time: {s.time}</li>
                  </ul>
                </div>
              ))}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TrainRoute;
