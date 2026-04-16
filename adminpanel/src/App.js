import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./Component/Sidebar";
import Dashboard from "./Component/Dashboard";
import TopBanner from "./Component/Home/TopBanner";
import Login from "./Component/Login";
import './App.css';
import EventCarousel from "./Component/Home/EventCarousel";
import LiveKatha from "./Component/Home/LiveKatha";
import LifeDataPillars from "./Component/Home/LifeDataPillars";
import Testimonials from "./Component/Home/Testimonials";
import HomeAbout from "./Component/Home/HomeAbout";
import FavoriteSlider from "./Component/Home/FavoriteSlider";
import UpcommingEvents from "./Component/Home/UpcommingEvents";
import GurudevrRsolutions from "./Component/Home/GurudevrRsolutions";
import GurudevProgram from "./Component/Home/GurudevProgram";
import PodcastSection from "./Component/Home/PodcastSection";
import BottomLandingSection from "./Component/Home/BottomLandingSection";
import Donate from "./Component/Payment/Donate";
import Footer from "./Component/Home/Footer";
import Introduction from "./Component/About/Introduction";
import InspirationMillions from "./Component/About/InspirationMillions";
import LifeIntroduction from "./Component/About/LifeIntroduction";
import AboutEvents from "./Component/About/AboutEvents";
import SantMargDershan from "./Component/About/SantMargDershan";
import DivyaDarabar from "./Component/About/DivyaDarabar";
import WhatsUpSlider from "./Component/About/WhatsUpSlider";
import AboutGurudevResolution from "./Component/About/AboutGurudevResolution";
import MarqueeStrip from "./Component/About/MarqueeStrip";
import FeaturedGrid from "./Component/About/FeaturedGrid";
import UpcommingEventDate from "./Component/UpcommingEvent/UpcommingEventDate";
import UpcommingVirtualPooja from "./Component/UpcommingEvent/UpcommingVirtualPooja";
import UpcommingServiceCommitments from "./Component/UpcommingEvent/UpcommingServiceCommitments";
import UpcommingDivyaMission from "./Component/UpcommingEvent/UpcommingDivyaMission";
import UpcommingReligionSanatan from "./Component/UpcommingEvent/UpcommingReligionSanatan";
import UpcommingStatisticsAchievements from "./Component/UpcommingEvent/UpcommingStatisticsAchievements";
import KanyaVivahVideoSlider from "./Component/KanyaVivah/KanyaVivahVideoSlider";
import KnyaVivahOurPurpose from "./Component/KanyaVivah/KnyaVivahOurPurpose";
import KanyaVivahDates from "./Component/KanyaVivah/KanyaVivahDates";
import KanyaVivahSupport from "./Component/KanyaVivah/KanyaVivahSupport";
import CancerHospitalVideoSlider from "./Component/CancerHospital/CancerHospitalVideoSlider";
import CancerHospitalResearchData from "./Component/CancerHospital/CancerHospitalResearchData";
import CancerHospitalPoojanData from "./Component/CancerHospital/CancerHospitalPoojanData";
import CancerHospitalSahyog from "./Component/CancerHospital/CancerHospitalSahyog";
import GuaRakshaVideoSlider from "./Component/GuaRaksha/GuaRakshaVideoSlider";
import GuaRakshaCowProtection from "./Component/GuaRaksha/GuaRakshaCowProtection";
import GuaRakshaCowThumbnail from "./Component/GuaRaksha/GuaRakshaCowThumbnail";
import GuaRakshaSahayog from "./Component/GuaRaksha/GuaRakshaSahayog";
import VedicGurukulVideoSlider from "./Component/VedicGurukul/VedicGurukulVideoSlider";
import VedicGurukulEducation from "./Component/VedicGurukul/VedicGurukulEducation";
import VedicGurukulSahayog from "./Component/VedicGurukul/VedicGurukulSahayog";
import AnnapurnaRasoiVideoSlider from "./Component/AnnapurnaRasoi/AnnapurnaRasoiVideoSlider";
import AnnaRasoiArpan from "./Component/AnnapurnaRasoi/AnnaRasoiArpan";
import AnnapurnaRasoiShradhaluSeva from "./Component/AnnapurnaRasoi/AnnapurnaRasoiShradhaluSeva";
import AnnapurnaKichenSupport from "./Component/AnnapurnaRasoi/AnnapurnaKichenSupport";
import VisitDhamBanner from "./Component/VisitDham/VisitDhamBanner";
import VisitDhamTravelDham from "./Component/VisitDham/VisitDhamTravelDham";
import VisitDhamTrainRoute from "./Component/VisitDham/VisitDhamTrainRoute";
import VisitDhamPlanRoute from "./Component/VisitDham/VisitDhamPlanRoute";
import ContactUs from "./Component/Contact/ContactUs";
import SignUp from "./Component/SignUp";
import ResetPassword from "./Component/ResetPassword";


const BASE_URL = process.env.REACT_APP_API_BASE_URL;




function App() {
  return (
    
    <Router> 
      <Routes>
         <Route element={<Sidebar />}>
          <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/top-banner" element={<TopBanner BASE_URL={BASE_URL}/>} />
        <Route path="/admin/event-carousel" element={<EventCarousel BASE_URL={BASE_URL} />} />
        <Route path="/admin/livekatha" element={<LiveKatha BASE_URL={BASE_URL} />} />
        <Route path="/admin/lifedatapillars" element={<LifeDataPillars BASE_URL={BASE_URL} />} />
        <Route path="/admin/testimonials" element={<Testimonials BASE_URL={BASE_URL}/>} />
        <Route path="/admin/homeabout" element={<HomeAbout BASE_URL={BASE_URL} />} />
        <Route path="/admin/favoriteslider" element={<FavoriteSlider BASE_URL={BASE_URL} />} />
        <Route path="/admin/upcommingevents" element={<UpcommingEvents BASE_URL={BASE_URL} />} />
        <Route path="/admin/gurudevresolution" element={<GurudevrRsolutions BASE_URL={BASE_URL} />} />
        <Route path="/admin/gurudevprogram" element={<GurudevProgram BASE_URL={BASE_URL} />} />
        <Route path="/admin/podcastsection" element={<PodcastSection BASE_URL={BASE_URL} />} />
        <Route path="/admin/bottomlandingsection" element={<BottomLandingSection BASE_URL={BASE_URL} />} />

        {/* // Admin Panel Routes About start here */}

        <Route path="/admin/introduction" element={<Introduction BASE_URL={BASE_URL} />} />
        <Route path="/admin/inspirationmillions" element={<InspirationMillions BASE_URL={BASE_URL} />} />
        <Route path="/admin/lifeintroduction" element={<LifeIntroduction BASE_URL={BASE_URL} />} />
        <Route path="/admin/aboutevents" element={<AboutEvents BASE_URL={BASE_URL} />} />
        <Route path="/admin/santmargdershan" element={<SantMargDershan BASE_URL={BASE_URL} />} />
        <Route path="/admin/divyadarabar" element={<DivyaDarabar BASE_URL={BASE_URL} />} />
        <Route path="/admin/whatsupslider" element={<WhatsUpSlider BASE_URL={BASE_URL} />} />
        <Route path="/admin/aboutgurudevresolution" element={<AboutGurudevResolution BASE_URL={BASE_URL} />} />
        <Route path="/admin/marqueestrip" element={<MarqueeStrip BASE_URL={BASE_URL} />} />
        <Route path="/admin/featuredgrid" element={<FeaturedGrid BASE_URL={BASE_URL} />} />

        {/* // Admin Panel Routes UpComming Events start here */}

        <Route path="/admin/upcommingeventsdate" element={<UpcommingEventDate BASE_URL={BASE_URL} />} />
        <Route path="/admin/upcommingvirtualpooja" element={<UpcommingVirtualPooja BASE_URL={BASE_URL} />} />
        <Route path="/admin/upcommingservicecommitments" element={<UpcommingServiceCommitments BASE_URL={BASE_URL} />} />
        <Route path="/admin/upcommingdivyamission" element={<UpcommingDivyaMission BASE_URL={BASE_URL} />} />
        <Route path="/admin/upcommingreligionsanatan" element={<UpcommingReligionSanatan BASE_URL={BASE_URL} />} />
        <Route path="/admin/upcommingstatisticsachievements" element={<UpcommingStatisticsAchievements BASE_URL={BASE_URL} />} />


             {/* // Admin Panel Routes Kanyavivah  start here */}
         <Route path="/admin/kanyavivahvideoslider" element={<KanyaVivahVideoSlider BASE_URL={BASE_URL} />} />
         <Route path="/admin/kanyavivahourpurpose" element={<KnyaVivahOurPurpose BASE_URL={BASE_URL} />} />
         <Route path="/admin/kanyavivahdates" element={<KanyaVivahDates BASE_URL={BASE_URL} />} />
          <Route path="/admin/kanyavivahsupport" element={<KanyaVivahSupport BASE_URL={BASE_URL} />} />

           {/* // Admin Panel Routes Cancer Hospital  start here */}

        <Route path="/admin/cancerhospitalvideoslider" element={<CancerHospitalVideoSlider BASE_URL={BASE_URL} />} />
        <Route path="/admin/cancerhospitalresearchdata" element={<CancerHospitalResearchData BASE_URL={BASE_URL} />} />
        <Route path="/admin/cancerhospitalpoojandata" element={<CancerHospitalPoojanData BASE_URL={BASE_URL} />} />
        <Route path="/admin/cancerhospitalsahayog" element={<CancerHospitalSahyog BASE_URL={BASE_URL} />} />

          {/* // Admin Panel Routes Gau Raksha  start here */}

        <Route path="/admin/gaurakshavideoslider" element={<GuaRakshaVideoSlider BASE_URL={BASE_URL} />} />
        <Route path="/admin/gaurakshacowprotection" element={<GuaRakshaCowProtection BASE_URL={BASE_URL} />} />
        <Route path="/admin/gaurakshacowthumbnail" element={<GuaRakshaCowThumbnail BASE_URL={BASE_URL} />} />
          <Route path="/admin/gaurakshasahayog" element={<GuaRakshaSahayog BASE_URL={BASE_URL} />} />

           {/* // Admin Panel Routes Vedic Gurukul  start here */}
           <Route path="/admin/vedicgurukulvideoslider" element={<VedicGurukulVideoSlider BASE_URL={BASE_URL} />} />
            <Route path="/admin/vedicgurukuleducation" element={<VedicGurukulEducation BASE_URL={BASE_URL} />} />
            <Route path="/admin/vedicgurukulsahayog" element={<VedicGurukulSahayog BASE_URL={BASE_URL} />} />

             {/* // Admin Panel Routes Annapurna rasoi  start here */}
              <Route path="/admin/annapurnarasoivideoslider" element={<AnnapurnaRasoiVideoSlider BASE_URL={BASE_URL} />} />
              <Route path="/admin/annarasoiarpan" element={<AnnaRasoiArpan BASE_URL={BASE_URL} />} />
              <Route path="/admin/annarasoishradhaluseva" element={<AnnapurnaRasoiShradhaluSeva BASE_URL={BASE_URL} />} />
              <Route path="/admin/annapurnakichensupport" element={<AnnapurnaKichenSupport BASE_URL={BASE_URL} />} />
             
              {/* // Admin Panel Routes Visit Dham  start here */}
              <Route path="/admin/visitdhambanner" element={<VisitDhamBanner BASE_URL={BASE_URL} />} />
              <Route path="/admin/visittraveldham" element={<VisitDhamTravelDham BASE_URL={BASE_URL} />} />
              <Route path="/admin/visittrainroute" element={<VisitDhamTrainRoute BASE_URL={BASE_URL} />} />
              <Route path="/admin/visitplaneroute" element={<VisitDhamPlanRoute BASE_URL={BASE_URL} />} />


               {/* // Admin Panel Routes Contact Us  start here */}
               <Route path="/admin/contactus" element={<ContactUs BASE_URL={BASE_URL} />} />



        <Route path="/admin/footer" element={<Footer BASE_URL={BASE_URL} />} />
        <Route path="/admin/donate" element={<Donate BASE_URL={BASE_URL} />} />
        {/* <Route path="/admin/login" element={<Login />} /> */}
        <Route path="/admin/signup" element={<SignUp />} />
         <Route path="/admin/resetpassword" element={<ResetPassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
