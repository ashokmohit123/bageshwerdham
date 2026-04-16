import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const VirtualPooja = () => {
  const [poojaItems, setPoojaItems] = useState(null);
  const audioRefs = useRef([]); // ✅ Move hooks above any return
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_virtualpooja`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPoojaItems(res.data); // ✅ Store full array
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Loader check
  if (!Array.isArray(poojaItems)) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

  // ✅ Handle play/stop logic
  const togglePooja = (id, divId) => {
    if (activeId === id) {
      stopAll();
      setActiveId(null);
    } else {
      stopAll();
      audioRefs.current[id]?.play();
      showGif(divId);
      setActiveId(id);
    }
  };

  const stopAll = () => {
    audioRefs.current.forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
    document.querySelectorAll(".pooja-gif").forEach((gif) => {
      gif.style.display = "none";
    });
  };

  const showGif = (divId) => {
    document.querySelectorAll(".pooja-gif").forEach((gif) => {
      gif.style.display = "none";
    });
    const target = document.getElementById(divId);
    if (target) target.style.display = "block";
  };

  return (
    <section
      className="virtual-pooja py-5 py-md-5"
      style={{ background: "#fff", color: "#111" }}
    >
      <div className="wrapper2">
        <div className="row g-4 g-md-5 align-items-start">
          {/* Left Side */}
          <div className="col-md-8">
            <div className="temple-container">
              <img
                src="https://bhaktiappproduction.s3.ap-south-1.amazonaws.com/guru_profile_images/2/4422843bg8.jpg"
                className="deity"
                alt="Deity"
                width="100%"
                height="300"
              />

              <div className="virtual-real-bg-pooja">
                <img
                  src="https://app.sanskargroup.in/assets/website_assets/images/pooja-bg.png"
                  alt="Pooja Background"
                />
                <div className="pooja-content">
                  {poojaItems.map((item) => (
                    <div
                      key={item.id}
                      id={item.div_id}
                      className="pooja-gif"
                      style={{ display: "none" }}
                    >
                      <img
                        src={`${BASE_URL}${item.gif}`}
                        alt={item.name}
                        width="100%"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="container mt-3">
              <div className="row pooja-listing-info pooja-btn-info justify-content-center">
                {poojaItems.map((item) => (
                  <div className="col-auto bottom-pooja-btn" key={item.id}>
                    <button onClick={() => togglePooja(item.id, item.div_id)}>
                      <img
                        className="laddu-img"
                        src={`${BASE_URL}${item.button_img}`}
                        alt={item.name}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio Elements */}
            {poojaItems.map((item, index) => (
              <audio
                key={index}
                ref={(el) => (audioRefs.current[item.id] = el)}
                src={`${BASE_URL}${item.audio}`}
                preload="auto"
              />
            ))}
          </div>

          {/* Right Side: Description */}
          <div className="col-md-4">
            <div className="pooja-copy">
              <h3>🛕 Shri Bageshwar Dham Virtual Pooja</h3>
              {poojaItems.map((item) => (
                <div key={item.id} style={{ marginBottom: "20px" }}>
                  <h5 style={{ fontWeight: "bold" }}>{item.name}</h5>
                  <p style={{ fontSize: "16px", lineHeight: "28px" }}>
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VirtualPooja;
