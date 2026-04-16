import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const StatisticsAchievements = () => {

    const [statisticsData, setStatisticsData] = useState(null);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_statistics_achievements`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setStatisticsData(res.data); // ✅ Store full array
        }
      })
      .catch((err) => console.error("Error fetching section data:", err));
  }, []);

  // ✅ Loader check
  if (!Array.isArray(statisticsData)) {
    return <p className="text-center text-muted py-5">Loading...</p>;
  }

//  const statisticsData = [
//   {
//     id: 1,
//     statNumber: "60,000 - 1,00,000",
//     statText: "Devotees",
//     description: "800,000 - 900,000 devotees",
//     note: "📖 Ram Katha Vrindavan 2024"
//   },
//   {
//     id: 2,
//     statNumber: "30,000+",
//     statText: "Daily Devotees",
//     description: "🏛 Bageshwar Dham welcomes a minimum of 30,000 visitors every day."
//   },
//   {
//     id: 3,
//     statNumber: "~500,000",
//     statText: "Devotees",
//     description: "🙏 Special Tuesday Peshi 2023"
//   },
//   {
//     id: 4,
//     statNumber: "5,000+",
//     statText: "Daily Service",
//     description: "🍛 Annapurna Kitchen serves free food to 5,000+ devotees twice daily."
//   },
//   {
//     id: 5,
//     statNumber: "700+",
//     statText: "Kanya Vivah",
//     description: "💍 Started with 17 marriages in 2019, it reached 151 in 2024, and 251 in 2025."
//   },
//   {
//     id: 6,
//     statNumber: "500+",
//     statText: "Students",
//     description: "📚 500+ students every year enrolled in Gurukul."
//   },
//   {
//     id: 7,
//     statNumber: "More than 10 lakh",
//     statText: "Followers",
//     description: "📍 During a story in Patna, 10 lakh (1 million) devotees gathered in one day."
//   },
//   {
//     id: 8,
//     statNumber: "21 Million",
//     statText: "Combined",
//     description: "📱 21 Million combined viewers."
//   },
//   {
//     id: 9,
//     statNumber: "~300,000",
//     statText: "Devotees/day",
//     description: "🎉 ~300,000 devotees/day 🎂 Hanuman Janmotsav viewers"
//   }
// ];





  return (
    <div className="achievements-section my-5">
      <div className="wrapper2 text-center mb-4">
        <div className="section-header">
          <h1 className="section-title">📊 Statistics and Achievements</h1>
          <p>
            On Tuesdays and Saturdays, 60,000–100,000 devotees come to Bageshwar Dham, and on other days, 30,000+ devotees come.
          </p>
        </div>

        <div className="row row-cols-md-3 row-cols-lg-4 g-4">
          {statisticsData.map((stat) => (
            <div key={stat.id} className="col-md-4 col-lg-4 col-12 col-xs-6">
              <div className="stat-card">
                <div className="stat-number">{stat.stat_number}</div>
                <div className="stat-text">{stat.stat_text}</div>
                <div className="stat-description">
                  {stat.description}
                  {stat.note && (
                    <>
                      <br />
                      <small>{stat.note}</small>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default StatisticsAchievements;
