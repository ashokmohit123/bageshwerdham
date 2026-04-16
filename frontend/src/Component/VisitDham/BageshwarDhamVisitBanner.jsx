import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BageshwarDhamVisitBanner = () => {
  const [visitbannerData, setVisitBannerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvisitdham_banner`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        console.log("API Response:", res.data);

        // Case 1: data is inside res.data.data
        if (Array.isArray(res.data.data)) {
          setVisitBannerData(res.data.data);
        }
        // Case 2: direct array
        else if (Array.isArray(res.data)) {
          setVisitBannerData(res.data);
        }
      })
      .catch((err) => console.log("Error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-5">Loading...</p>;

  const banner = visitbannerData[0];

  if (!banner) return <p>No banner found</p>;

  console.log("Final Banner Used:", banner);

  return (
    <section
      className="bageshwar-dham-visit-banner"
      style={{
        backgroundImage: `url('${BASE_URL}${banner.image}')`, // check this in console
        backgroundSize: "cover",
        backgroundPosition: banner.position || "center",
        height: banner.height || "800px",
      }}
    ></section>
  );
};

export default BageshwarDhamVisitBanner;
