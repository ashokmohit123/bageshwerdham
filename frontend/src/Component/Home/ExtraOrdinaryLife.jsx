import React, { useEffect, useState } from "react";
import axios from "axios";
import ExtraOrdinaryLifeData from "./ExtraOrdinaryLifeData";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ExtraOrdinaryLife = () => {
  const [lifeData, setLifeData] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectlifedatapillars`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setLifeData(res.data))
      .catch((err) => console.error("❌ Fetch error:", err));
  }, []);

  return (
    <>
      {/* Pass whole array as a prop */}
      <ExtraOrdinaryLifeData lifeData={lifeData} />
    </>
  );
};

export default ExtraOrdinaryLife;
