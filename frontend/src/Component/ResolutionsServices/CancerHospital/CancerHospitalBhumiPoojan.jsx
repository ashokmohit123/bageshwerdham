import React, { useState, useEffect } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const CancerHospitalBhumiPoojan = () => {
  const [poojanData, setPoojanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoojanData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/selectcancerhospital_poojandata`, {
          headers: { apikey: "12345" },
        });

        // ✅ Handle if API returns an array instead of object
        const data = Array.isArray(res.data) ? res.data[0] : res.data;

        // ✅ Normalize nested JSON fields if backend returns stringified values
        const normalize = (field) => {
          try {
            return typeof field === "string" ? JSON.parse(field) : field || [];
          } catch {
            return [];
          }
        };

        const formatted = {
          instagram: data.instagram || {
            icon: data.instagram_icon || "",
            title: data.instagram_title || "",
            description: data.instagram_description || "",
            link: data.instagram_link || "#",
          },
          description: normalize(data.description),
          videos: normalize(data.videos),
          pmImage: data.pm_image || "",
          features: {
            title: data.features_title || "",
            list: normalize(data.features_list),
          },
          projectImages: normalize(data.project_images)?.map((src, i) => ({
            id: i + 1,
            src: typeof src === "string" ? src : src.src,
            alt: src.alt || "Project Image",
          })),
        };

        setPoojanData(formatted);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPoojanData();
  }, []);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (!poojanData) {
    return <div className="text-center py-5">No data found.</div>;
  }

  return (
    <section className="cancer-hospital-bhumi-poojan">
      <div className="wrapper2 py-5 section">
        <div className="row g-4">
          {/* Instagram Box */}
          {poojanData.instagram && (
            <div className="col-md-6">
              <div className="instagram-box shadow text-center p-3 bg-white rounded">
                {poojanData.instagram.icon && (
                  <img
                    src={poojanData.instagram.icon}
                    width="50"
                    alt="Instagram"
                  />
                )}
                <h5 className="mt-3">{poojanData.instagram.title}</h5>
                <p>{poojanData.instagram.description}</p>
                {poojanData.instagram.link && (
                  <NavLink
                    to={poojanData.instagram.link}
                    className="btn btn-primary btn-sm"
                  >
                    Visit Instagram
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Hindi Description */}
          {Array.isArray(poojanData.description) && (
            <div className="col-md-6">
              <div className="p-3 bg-white shadow rounded">
                {poojanData.description.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Videos */}
          {Array.isArray(poojanData.videos) &&
            poojanData.videos.map((video, index) => (
              <div key={video.id || index} className="col-md-6 youtube-thumb">
                <iframe
                  height="415"
                  src={video.url}
                  frameBorder="0"
                  allowFullScreen
                  title={video.title || `Video-${index + 1}`}
                ></iframe>
              </div>
            ))}

          {/* PM Modi Image */}
          {poojanData.pmImage && (
            <div className="col-md-6">
              <img
                src={`${BASE_URL}${poojanData.pmImage}`}
                alt="PM Modi"
                className="img-fluid rounded shadow"
              />
            </div>
          )}

          {/* Features List */}
          {poojanData.features && (
            <div className="col-md-6 features bg-white shadow rounded p-4">
              <h5>{poojanData.features.title}</h5>
              <ul>
                {Array.isArray(poojanData.features.list) &&
                  poojanData.features.list.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
              </ul>
            </div>
          )}

          {/* Project Images */}
          {Array.isArray(poojanData.projectImages) &&
            poojanData.projectImages.map((img) => (
              <div key={img.id} className="col-md-6">
                <img
                  src={`${BASE_URL}${img.src}`}
                  alt={img.alt}
                  className="img-fluid rounded shadow"
                />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default CancerHospitalBhumiPoojan;
