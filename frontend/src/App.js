
import './App.css';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Component/Home/Home';
import "@fortawesome/fontawesome-free/css/all.min.css";
import RazorpayButton from './Component/Home/RazorpayButton ';
import Donate from './Component/Payment/Donate';
import TopHeader from './Component/Home/TopHeader';
import Footer from './Component/Footer';
import About from './Component/About/About';
import CommingEvent from './Component/UpcommingEvent/CommingEvent';
import KanyaVivah from './Component/ResolutionsServices/KanyaVivah/KanyaVivah';
import CancerHospital from './Component/ResolutionsServices/CancerHospital/CancerHospital';
import GuaRaksha from './Component/ResolutionsServices/GuaRaksha/GuaRaksha';
import VedicGurukul from './Component/ResolutionsServices/VedicGurukul/VedicGurukul';
import AnnapurnaRasoi from './Component/ResolutionsServices/AnnapurnaRasoi.jsx/AnnapurnaRasoi';
import ContactUs from './Component/Contact/ContactUs';
import ScrollToTop from './Component/ScrollToTop';
import VisitDham from './Component/VisitDham/VisitDham';
import PrivacyPolicy from './Component/LegalInformation/PrivacyPolicy';
import TermofService from './Component/LegalInformation/TermofService';



function App() {
  return (
   <>
  
   <Router>
    <ScrollToTop />
     <TopHeader />
     <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/about" element={<About />} />
       <Route path="/razorpaybutton" element={<RazorpayButton />} />
       <Route path="/donate" element={<Donate />} />
       <Route path="/commingevent" element={<CommingEvent />} />
       <Route path="/kanyavivah" element={<KanyaVivah />} />
       <Route path="/cancerhospital" element={<CancerHospital />} />
       <Route path="/guaraksha" element={<GuaRaksha />} />
       <Route path="/vedicgurukul" element={<VedicGurukul />} />
       <Route path="/annapurnarasoi" element={<AnnapurnaRasoi />} />
       <Route path="/contactus" element={<ContactUs />} />
       <Route path="/visitdham" element={<VisitDham />} />
       <Route path="/privacypolicy" element={<PrivacyPolicy />} />
       <Route path="/termsofservice" element={<TermofService />} />

     </Routes>
       <Footer />
   </Router>
   </>
  );
}

export default App;

   
