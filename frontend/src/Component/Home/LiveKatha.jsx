import React, { useEffect, useState } from "react";
import axios from "axios";
import LiveKathaSection from "./LiveKathaSection"; // your component

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LiveKathaContainer = () => {
  const [kathas, setKathas] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectlivekatha`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        setKathas(res.data);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      });
  }, []);

  return (
    <div>
      {kathas.length > 0 ? (
        kathas.map((item) => (
          <LiveKathaSection
            key={item.id}
            videoSrc={`${BASE_URL}${item.video_url}`}
            title={item.title}
            description={item.description}
            buttonText="Start now"
            // onButtonClick={() => alert(`Play: ${item.title}`)}
          />
        ))
      ) : (
        <p>No live katha found</p>
      )}
    </div>
  );
};

export default LiveKathaContainer;
