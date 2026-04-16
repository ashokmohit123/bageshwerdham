import { useState } from "react";

import {Outlet, NavLink } from "react-router-dom";


const Sidebar = () => {

    const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  return (
    <>
     <div className="d-flex">
      {/* Sidebar */}
        <div className={`sidebar ${collapsed ? "collapsed" : ""}`} id="sidebar">
        <h4 className="text-danger p-3">BAGESHWER LIVE ADMIN</h4>
        <ul className="nav flex-column">
          <li>
            <NavLink to="/admin/dashboard" className="nav-link">
              <i className="fa fa-home"></i> <span>Dashboard</span>
            </NavLink>
          </li>
           <li>
            <NavLink to="/admin/donate" className="nav-link">
              <i className="fa fa-credit-card"></i> <span>Payment</span>
            </NavLink>
          </li>
        <li>
        <NavLink
        to="/admin"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#guruMenu" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="guruMenu"
      >
        <i className="fa fa-home me-2"></i>
        <span>Home</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="guruMenu">
        <li>
          <NavLink to="/admin/top-banner" className="nav-link">Top Banner</NavLink>
        </li>
        <li>
          <NavLink to="/admin/event-carousel" className="nav-link">Events Carousel</NavLink>
        </li>
         <li>
          <NavLink to="/admin/livekatha" className="nav-link">Live Katha</NavLink>
        </li>
        <li>
          <NavLink to="/admin/lifedatapillars" className="nav-link">Life Data Pillars</NavLink>
        </li>
         <li>
          <NavLink to="/admin/testimonials" className="nav-link">Testimonials Slider</NavLink>
        </li>
         <li>
          <NavLink to="/admin/homeabout" className="nav-link">Home About</NavLink>
        </li>
         <li>
          <NavLink to="/admin/favoriteslider" className="nav-link">Favorite Slider</NavLink>
        </li>
         <li>
          <NavLink to="/admin/upcommingevents" className="nav-link">Upcomming Events</NavLink>
        </li>
         <li>
          <NavLink to="/admin/gurudevresolution" className="nav-link">Gurudev Resolution</NavLink>
        </li>
         <li>
          <NavLink to="/admin/gurudevprogram" className="nav-link">Gurudev Program</NavLink>
        </li>
         <li>
          <NavLink to="/admin/podcastsection" className="nav-link">Podcast Section</NavLink>
        </li>
        <li>
          <NavLink to="/admin/bottomlandingsection" className="nav-link">Bottom Landing Section</NavLink>
        </li>
      </ul>
    </li>


          {/* <li>
            <NavLink to="/top-banner" className="nav-link">
              <i className="fa fa-list"></i> <span>Top Banner</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="#" className="nav-link">
              <i className="fa fa-users"></i> <span>Users</span>
            </NavLink>
          </li> */}
          <li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#aboutMenu" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="aboutMenu"
      >
        <i className="fa fa-id-card me-2"></i>
        <span>About</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="aboutMenu">
        <li>
          <NavLink to="/admin/introduction" className="nav-link">Introduction</NavLink>
        </li>
        <li>
          <NavLink to="/admin/inspirationmillions" className="nav-link">Inspiration Millions</NavLink>
        </li>
        <li>
          <NavLink to="/admin/lifeintroduction" className="nav-link">Life Introduction</NavLink>
        </li>
         <li>
          <NavLink to="/admin/aboutevents" className="nav-link">About Events</NavLink>
        </li>
         <li>
          <NavLink to="/admin/santmargdershan" className="nav-link">Sant Marg Dershan</NavLink>
        </li>
         <li>
          <NavLink to="/admin/divyadarabar" className="nav-link">Divya Darabar</NavLink>
        </li>
         <li>
          <NavLink to="/admin/whatsupslider" className="nav-link">Whatsup Slider</NavLink>
        </li>

         <li>
          <NavLink to="/admin/aboutgurudevresolution" className="nav-link">About Gurudev Resolution</NavLink>
        </li>
        <li>
          <NavLink to="/admin/marqueestrip" className="nav-link">Marquee Strip</NavLink>
        </li>
        <li>
          <NavLink to="/admin/featuredgrid" className="nav-link">Featured Grid</NavLink>
        </li>
       
      </ul>
    </li>


 <li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#upcomingEventsMenu" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="upcomingEventsMenu"
      >
        <i className="fa fa-calendar me-2"></i>
        <span>Up Comming Events</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="upcomingEventsMenu">
        <li>
          <NavLink to="/admin/upcommingeventsdate" className="nav-link">Upcomming Events Date</NavLink>
        </li>
        <li>
          <NavLink to="/admin/upcommingvirtualpooja" className="nav-link">Upcomming Virtual Pooja</NavLink>
        </li>   
        <li>
          <NavLink to="/admin/upcommingservicecommitments" className="nav-link">Upcomming Service Commitments</NavLink>
        </li>
         <li>
          <NavLink to="/admin/upcommingdivyamission" className="nav-link">Upcomming Divya Mission</NavLink>
        </li>
         <li>
          <NavLink to="/admin/upcommingreligionsanatan" className="nav-link">Upcomming Religion Sanatan</NavLink>
        </li>
        <li>
          <NavLink to="/admin/upcommingstatisticsachievements" className="nav-link">Upcomming Statics Achievements</NavLink>
        </li>
      </ul>
    </li>




 <li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#kanyavivah" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="oursankalp"  
      >
        <i className="fa fa-female me-2"></i>
        <span>Kanya Vivah</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="kanyavivah">

        {/* kanya vivah submenu items */}
        <li>
          <NavLink to="/admin/kanyavivahvideoslider" className="nav-link">Kanya Vivah Video Slider</NavLink>
        </li>
         <li>
          <NavLink to="/admin/kanyavivahourpurpose" className="nav-link">Kanya Vivah Our Purpose</NavLink>
        </li>
         <li>
          <NavLink to="/admin/kanyavivahdates" className="nav-link">Kanya Vivah Dates</NavLink>
        </li>
         <li>
          <NavLink to="/admin/kanyavivahsupport" className="nav-link">Kanya Vivah Supports</NavLink>
        </li>
        </ul>
    </li>



<li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#cancerhospital" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="oursankalp"
      >
        <i className="fa fa-ambulance me-2"></i>
        <span>Cancer Hospital</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="cancerhospital">

        {/* Cancer Hospital submenu items */}
         <li>
          <NavLink to="/admin/cancerhospitalvideoslider" className="nav-link">Cancer Hospital Video Slider</NavLink>
        </li>
        <li>
          <NavLink to="/admin/cancerhospitalresearchdata" className="nav-link">Cancer Hospital Research Data</NavLink>
        </li>
         <li>
          <NavLink to="/admin/cancerhospitalpoojandata" className="nav-link">Cancer Hospital Poojan Data</NavLink>
        </li>
          <li>
          <NavLink to="/admin/cancerhospitalsahayog" className="nav-link">Cancer Hospital Sahayog</NavLink>
        </li>
        </ul>
    </li>

<li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#guaraksha" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="oursankalp"
      >
        <i className="fa fa-h-square me-2"></i>
        <span>Gua Raksha</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="guaraksha">

         {/* gau raksha submenu items */}
         <li>
          <NavLink to="/admin/gaurakshavideoslider" className="nav-link">Gau Raksha Video Slider</NavLink>
        </li>
         <li>
          <NavLink to="/admin/gaurakshacowprotection" className="nav-link">Gau Raksha Cow Protection</NavLink>
        </li>
        <li>
          <NavLink to="/admin/gaurakshacowthumbnail" className="nav-link">Gau Raksha Cow Thumbnail</NavLink>
        </li>
          <li>
          <NavLink to="/admin/gaurakshasahayog" className="nav-link">Gau Raksha Sahayog</NavLink>
        </li>
        </ul>
     </li>


     <li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#vedicgurukul" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="oursankalp"
      >
        <i className="fa fa-universal-access me-2"></i>
        <span>Vedic Gurukul</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="vedicgurukul">

         {/* Vedic Gurukul submenu items */}
          <li>
          <NavLink to="/admin/vedicgurukulvideoslider" className="nav-link">Vedic Gurukul Video Slider</NavLink>
        </li>
          <li>
          <NavLink to="/admin/vedicgurukuleducation" className="nav-link">Vedic Gurukul Education</NavLink>
        </li>
         <li>
          <NavLink to="/admin/vedicgurukulsahayog" className="nav-link">Vedic Gurukul Sahayog</NavLink>
        </li>
        </ul>
     </li>


      <li>
      {/* Toggle link */}
      <NavLink
        to="#"
        className="nav-link d-flex align-items-center"
        data-bs-toggle="collapse"
        data-bs-target="#annapurnarasoi" // 👈 use data-bs-target instead of href
        aria-expanded="false"
        aria-controls="oursankalp"
      >
        <i className="fa fa-cutlery me-2"></i>
        <span>Annapurna Rasoi</span>
        <i className="fa fa-angle-down ms-auto"></i>
      </NavLink>

      {/* Collapsible submenu */}
      <ul className="collapse list-unstyled ms-3" id="annapurnarasoi">

         {/* Annapurna Rasoi submenu items */}
            <li>
          <NavLink to="/admin/annapurnarasoivideoslider" className="nav-link">Annapurna Rasoi Video Slider</NavLink>
        </li>
         <li>
          <NavLink to="/admin/annarasoiarpan" className="nav-link">Annapurna Rasoi Arpan</NavLink>
        </li>
         <li>
          <NavLink to="/admin/annarasoishradhaluseva" className="nav-link">Annapurna Rasoi Shradhalu Seva</NavLink>
        </li>

        <li>
          <NavLink to="/admin/annapurnakichensupport" className="nav-link">Annapurna Kichen Support</NavLink>
        </li>
        </ul>
     </li>


          <li>
            <NavLink to="/admin/contactus" className="nav-link">
              <i className="fa fa-map-marker"></i> <span>Contact Us</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/footer" className="nav-link">
              <i className="fa fa-cog"></i> <span>Footer</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Main Area */}
      <div className="flex-grow-1">
        {/* Header */}
        <div className={`header ${collapsed ? "collapsed" : ""}`} id="header">
          <button className="btn btn-light" onClick={toggleSidebar}>
            <i className="fa fa-bars"></i>
          </button>
          <div><strong>BAGESHWER LIVE BACKEND</strong></div>
          <div>
            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="fa fa-user"></i> Account
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                {/* <li><NavLink to="#" className="dropdown-item">Profile</NavLink></li> */}
                <li><NavLink to="/admin" className="dropdown-item">Logout</NavLink></li>
              </ul>
            </div>
          </div>
        </div>
          <div className={`content ${collapsed ? "collapsed" : ""}`} id="content">
        <Outlet />
        </div>

</div>
        </div>
      
        </>
  );
};

export default Sidebar;
