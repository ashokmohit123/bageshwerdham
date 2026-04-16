import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CowThumbnail = () => {
  const [thumbnailImages, setThumbnailImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCowThumbnails = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/selectguaraksha_cowthumbnails`,
          {
            headers: { apikey: "12345" },
          }
        );

        // ✔ Flatten all image arrays into a single array
        const allImages = res.data.flatMap((item) => item.images);

        setThumbnailImages(allImages);
      } catch (err) {
        console.error("❌ Error fetching thumbnails:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCowThumbnails();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (!thumbnailImages.length) {
    return <div className="text-center py-5">No data found.</div>;
  }

  // Split images into 3 columns
  const chunkArray = (arr, chunkSize) => {
    const temp = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      temp.push(arr.slice(i, i + chunkSize));
    }
    return temp;
  };

  const columns = chunkArray(
    thumbnailImages,
    Math.ceil(thumbnailImages.length / 3)
  );

  return (
    <section className="cow-info-thumbnail">
      <div className="wrapper2">
        <div className="row">
          {columns.map((col, colIndex) => (
            <div key={colIndex} className="col-lg-4 col-md-4 col-sm-6 col-xs-6">
              {col.map((img, i) => (
                <img
                  key={i}
                  width="100%"
                  src={`${BASE_URL}/uploads/${img}`}
                  className="img-fluid mb-2"
                  alt={`thumb-${i}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CowThumbnail;
