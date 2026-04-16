import React from 'react';
import { NavLink } from 'react-router-dom';

const TopHeader = () => {
  return (
    <>
      <section className="top-section-hear">
        <div className="wrapper">
          <nav className="navbar navbar-expand-lg navbar-dark px-4 fixed-top">
            <div className="container" style={{ maxWidth: "1600px" }}>
              <NavLink className="navbar-brand fw-bold" to="/">
                <img
                  src="./assets/images/BHAGESHWER-DHAAM_LOGO-300x169.png"
                  height="80"
                  width="150"
                  alt="Bageshwar Dham"
                  title=""
                  style={{ maxHeight: "88px" }}
                />
              </NavLink>
              <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navMenu"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navMenu">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-3">
                  <li>
                    <NavLink className="nav-link" to="/" end>
                      Home
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="nav-link" to="/about">
                      About Us
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="nav-link" to="/commingevent">
                      Events
                    </NavLink>
                  </li>
                  <li className="nav-item dropdown">
                    <button
                      className="nav-link dropdown-toggle btn btn-link" // Use button for dropdown toggle
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                     Our Sankalp
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="programsDropdown">
                      <li>
                        <NavLink className="dropdown-item" to="/kanyavivah">
                          Kanya Vivah
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/cancerhospital">
                          Cancer Hospital
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/guaraksha">
                          Gua Raksha
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/vedicgurukul">
                          Vedic Gurukul
                        </NavLink>
                      </li>
                      <li>
                        <NavLink className="dropdown-item" to="/annapurnarasoi">
                          Annapurna Rasoi
                        </NavLink>
                      </li>
                    </ul>
                  </li>
                   <li>
                    <NavLink className="nav-link" to="/visitdham">
                      Visit Dham
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="nav-link" to="/contactus">
                      Contact
                    </NavLink>
                  </li>
                </ul>

                <div className="d-flex align-items-center gap-3">
                  <div id="google_translate_element"></div>
                  <NavLink className="btn btn-start donate-top" to="/donate">
                   🙏 Donate
                  </NavLink>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </>
  );
};

export default TopHeader;
