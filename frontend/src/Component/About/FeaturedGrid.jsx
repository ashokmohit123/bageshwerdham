import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// Static data for the featured cards
// const featuredCards = [
//   {
//     id: 1,
//     image: "http://localhost:7000/uploads/1757412721886_about.png",
//     alt: "Coach de transformación empresarial",
//     title: '"Religion is only Sanatan, rest all are sects."',
//     description:
//       "On 4th July 1996, in the village of Garha (Gada), Madhya Pradesh, the revered Gurudev was born, displaying divine qualities from childhood itself.",
//     gradientClass: "g-navy",
//   },
//   {
//     id: 2,
//     image: "http://localhost:7000/uploads/1758362068355-400387254.jpg",
//     alt: "coaching para emprendedores",
//     title: "A Life Dedicated to God and the Nation",
//     description: '"Serve religion. Serve humanity. Serve God."',
//     gradientClass: "g-amber",
//   },
// ];

const FeaturedGrid = () => {

  // Change from null to []
const [featuregrid, setFeatureGrid] = useState([]); 

useEffect(() => {
  axios
    .get(`${BASE_URL}/api/selectabout_featuredgrid`, {
      headers: { apikey: "12345" },
    })
    .then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) {
        setFeatureGrid(res.data); // <- Store the entire array
      }
    })
    .catch((err) => console.error("Error fetching section data:", err));
}, []);



  return (
    <section
      className="py-5 py-md-5"
      style={{ background: "black", color: "#f5f5f7" }}
    >
      <ul className="wrapper2 grid-2">
        {/* Map through the featuredCards array to render each card */}
        {featuregrid.map((card) => (
          <li key={card.id} className={`feature-card ${card.id === 1 ? "feature-card-large" : ""}`}>
            <img
              className="bg"
              src={`${BASE_URL}${card.image}`}
              alt={card.alt}
              loading="lazy"
            />
            <span className={`gradient ${card.gradient_class}`} aria-hidden="true"></span>

            <div className="content">
              <div>
                <h3 className="title">{card.title}</h3>
                <p>{card.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeaturedGrid;
