import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ReligionSanatan = () => {

    const [religionsanatan, setReligionSanatan] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_religionsanatan`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setReligionSanatan(res.data); // ✅ Store full array
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Loader check
  if (!Array.isArray(religionsanatan)) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }


  return (
    <>
      {religionsanatan.map((quote) => (
        <div
          key={quote.id}
          className="quote-container"
          style={{
            backgroundImage: `url(${BASE_URL}${quote.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: '450px',
            color: 'white',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            paddingLeft: '30px',
            marginBottom: '30px',
          }}
        >
          <div
            className="quote-card"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              padding: '20px',
              borderRadius: '15px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              maxWidth: '700px',
              width: '90%',
              position: 'relative',
              left: '10%',
            }}
          >
            <div className="religion-symbol">
              <span className="text-white text-2xl">{quote.icon}</span>
            </div>
            <div
              className="quote-text"
              style={{
                fontSize: '2.5rem',
                fontWeight: '500',
                marginBottom: '20px',
                color: '#2a71eb',
              }}
            >
              "{quote.text}"
            </div>
            <div
              className="quote-author"
              style={{
                fontSize: '2rem',
                fontStyle: 'italic',
                color: '#444',
              }}
            >
              {quote.author}
            </div>
            <div
              className="quote-footer text-muted"
              style={{ marginTop: '20px', fontSize: '1.1rem' }}
            >
              {quote.footer}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ReligionSanatan;
