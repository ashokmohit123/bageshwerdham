import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;




// ⭐ Static Data Array
// const SHRADDHALU_SEVA_DATA = [
//   {
//     videoUrl: "https://www.youtube.com/embed/61mLH1v6zgc?si=yKkuK_IRMcM2PusA",
//     videoDescription:
//       "Bageshwar Maharaj inaugurated the high-tech Annapurna kitchen at Bageshwar Dham...",
//     title:
//       "🌾 Nourishment of Faith: Two Meals Daily, Serving 5,000+ Devotees 🍽️",
//     paragraphs: [
//       "Every single day, without pause, the Annapurna Kitchen 🍛 serves fresh, sattvic meals 🌿 completely free of charge to over 5,000+ devotees — twice a day 🙏. This sacred meal offering 🛐 not only nourishes the body but also energizes the soul ✨.",
//       "On special days like Tuesdays and Saturdays, the number of devotees reaches into the thousands — yet no one is ever turned away hungry ❗ Here, there is no distinction between rich or poor, known or unknown — only the pure bond of devotion ❤️ exists.",
//     ],
//     images: [
//       "https://www.bageshwardhamsarkar.org/_next/image?url=%2Fimages%2Fannapurna-rasoi-2-1.jpg&w=1200&q=75&dpl=dpl_EGE7gs9xH7sEQ3vN3YwByqvFaZAR",
//       "https://www.bageshwardhamsarkar.org/_next/image?url=%2Fimages%2Fannapurna-rasoi-2-2.jpg&w=1200&q=75&dpl=dpl_EGE7gs9xH7sEQ3vN3YwByqvFaZAR",
//       "https://www.bageshwardhamsarkar.org/_next/image?url=%2Fimages%2Fannapurna-rasoi-2-3.jpg&w=2048&q=75&dpl=dpl_EGE7gs9xH7sEQ3vN3YwByqvFaZAR",
//     ],
//   },
// ];

const ShraddhaluSeva = () => {


   const [annapurnashradhaluseva, setAnnapurnaShradhaluSeva] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectannapurnarasoi_shraddhaluseva`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res && Array.isArray(res.data) && res.data.length > 0) {
          setAnnapurnaShradhaluSeva(res.data);
        } else {
          setError("No valid data found.");
        }
      })
      .catch(() => setError("Error fetching data."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-5">Loading...</p>;
  if (error) return <p className="text-center text-danger py-5">{error}</p>;

  const item = annapurnashradhaluseva[0]; // ⭐ important fix

  if (!item) return <p>No data available.</p>;
  // Use the first (and only) static data item
  const data = annapurnashradhaluseva[0];

  return (
    <section className="shraddhalu-seva">
      <div className="wrapper2 my-3">
        {/* Top Row: Video + Text */}
        <div className="row g-4 mb-4">
          {/* YouTube Video */}
          <div className="col-lg-6 youtube-video">
            <iframe
              src={data.video_url	}
              title="Shraddhalu Seva Video"
              frameBorder="0"
              allowFullScreen
            ></iframe>
            <p className="mt-2">{data.videoDescription}</p>
          </div>

          {/* Text Box */}
          <div className="col-lg-6">
            <div className="content-box">
              <h3 className="text-primary mb-3">{data.title}</h3>

              {data.paragraphs.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="row g-4">
          {data.images.map((img, index) => (
            <div key={index} className="col-md-4">
              <img
                src={`${BASE_URL}/uploads/${img}`}
                alt={`Gallery ${index + 1}`}
                className="img-fluid gallery-img"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShraddhaluSeva;
