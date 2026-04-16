import React, { useEffect, useState } from "react";
import axios from "axios";
import TopBanner from "./TopBanner";
import EventSliders from "./EventSlides";
import LiveKatha from "./LiveKatha";
import ExtraOrdinaryLife from "./ExtraOrdinaryLife";
import TestimonialSlider from "./TestimonialSlider";
import AboutSection from "./AboutSection";
import FavoriteThingSlider from "./FavoriteThingSlider";
import UpcomingEvents from "./UpcommingEvent";
import GurudevResolution from "./GurudevResolution";
import GurudevProgram from "./GurudevProgram";
import PodcastSection from "./PodcastSection";
import BottomLandingSection from "./BottomLandingSection";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    if (!BASE_URL) {
      console.error("❌ BASE_URL is missing. Check your .env file.");
      return;
    }

    axios
      .get(`${BASE_URL}/api/selecthomeabout`, {
        headers: { apikey: "12345" },
      })
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setAboutData(res.data[0]);
        }
      })
      .catch((err) => console.error("Error fetching About Section:", err));
  }, []);

  return (
    <>
      <TopBanner />
      <EventSliders />
      <LiveKatha />
      <ExtraOrdinaryLife />
      <TestimonialSlider />

      {aboutData && (
        <AboutSection
          heading={aboutData.heading}
          imageSrc={`${BASE_URL}${aboutData.imageSrc}`}
          description={aboutData.description}
          buttonText={aboutData.buttonText}
          logos={`${aboutData.logos}`}
          // logos={(() => {
          //   try {
          //     return aboutData.logos
          //       ? JSON.parse(aboutData.logos)
          //       : [];
          //   } catch {
          //     return Array.isArray(aboutData.logos)
          //       ? aboutData.logos
          //       : [];
          //   }
          // })()}
          videoSrc={`${BASE_URL}${aboutData.videoSrc}`}
          eventTitle={aboutData.eventTitle}
          eventLink={aboutData.eventLink}
          resolutionsHeading={aboutData.resolutionsHeading}
          resolutionsDescription={aboutData.resolutionsDescription}
          stats={(() => {
            try {
              return aboutData.stats
                ? JSON.parse(aboutData.stats)
                : [];
            } catch {
              return Array.isArray(aboutData.stats)
                ? aboutData.stats
                : [];
            }
          })()}
        />
      )}

      <FavoriteThingSlider />
      <UpcomingEvents />
      <GurudevResolution />
      <GurudevProgram />
      <PodcastSection />
      <BottomLandingSection/>
    
    
    </>
  );
};

export default Home;
