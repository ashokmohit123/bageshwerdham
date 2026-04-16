import React, { useEffect, useState } from "react";
import Slider from "react-slick"; // npm install react-slick slick-carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const GurudevProgram = () => {
  const [filter, setFilter] = useState("all");
  const [programData, setProgramData] = useState([]);
  const [categories, setCategories] = useState(["all"]); // ✅ dynamic categories

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectgurudevprogram`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        const data = res.data || [];
        setProgramData(data);

        // ✅ Extract unique categories dynamically
        const uniqueCategories = [
          "all",
          ...new Set(data.map((item) => item.category)),
        ];
        setCategories(uniqueCategories);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
      });
  }, []);

  const filteredPrograms =
    filter === "all"
      ? programData
      : programData.filter((item) => item.category === filter);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section className="theme--light pb-10 md:pb-20 pt-10 md:pt-20 relative overflow-hidden">
      <div className="wrapper2 gurudev-program-info flex flex-col items-center justify-center overflow-visible">
        {/* Header */}
        <div className="relative mb-10 max-w-3xl text-center md:mb-20 text-black">
          <div className="mb-4 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-contrast"></span>
            <span className="font-mono text-xs uppercase font-bold">Katha</span>
          </div>
          <h3 className="text-6xl" style={{ fontSize: "2.5rem", fontWeight: "700" }}>
            🕉️ Explore Gurudev &amp; Programs
          </h3>
          <p className="text-2xl" style={{ fontSize: "20px" }}>
            Turn any hour of the day into an opportunity for transformation with
            resources from the number one personal development program of all
            time.
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-header flex justify-between items-center mb-6 w-full max-w-6xl mt-5">
          {/* Left side - category tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-2 rounded-md border-0 transition whitespace-nowrap ${
                  filter === cat
                    ? "bg-black text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                onClick={() => setFilter(cat)}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>

          {/* Right side - Show All button */}
          <button
            className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 ml-4"
            onClick={() => alert("Redirecting to Show All")}
          >
            Show All →
          </button>
        </div>

        {/* Carousel */}
        <Slider {...settings}>
          {filteredPrograms.map((program) => (
            <a
              key={program.id}
              href={program.video}
              className="product-card block p-2"
            >
              <div className="product-image">
                <img
                  src={`${BASE_URL}${program.image}`}
                  alt={program.title}
                  loading="lazy"
                  className="rounded-lg w-full h-64 object-cover"
                />
              </div>
              <div className="product-info mt-2">
                <div className="product-details">
                  <div className="product-category capitalize text-sm text-gray-500">
                    {program.category}
                  </div>
                  <div className="product-title font-bold text-lg">
                    {program.title}
                  </div>
                  <div className="product-price text-gray-700">
                    {program.place}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default GurudevProgram;
