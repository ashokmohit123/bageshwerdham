// src/components/PrivacyPolicy.js

import React from "react";
import { Link, Element } from "react-scroll";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";


const TermofService = () => {
  return (
    <section className="privacy-policy-page">
      {/* Header */}
      <header className="text-white py-5 text-center header-gradient">
        <div className="container">
          <h1 className="fw-bold">Terms and Conditions</h1>
          <p>You are heartily welcome to Bageshwar Dham!</p>
        </div>
      </header>

      {/* Table of Contents */}
      <section className="container my-5">
        <div className="card shadow-sm p-4">
          <h5>
            <i className="fas fa-list me-2 text-warning"></i>Table of Contents
          </h5>
          <ul className="row list-unstyled mt-3">
            {[
              { to: "terms-and-conditions", label: "Terms and Conditions" },
              { to: "cookies", label: "Cookies" },
              { to: "license", label: "License" },
              { to: "hyperlinking-to-our-content", label: "Hyperlinking to our content" },
              { to: "iframes", label: "iFrames" },
              { to: "material-responsibility", label: "Material Responsibility" },
              { to: "your-privacy", label: "Your Privacy" },
              { to: "reservation-rights", label: "Reservation of Rights" },
              { to: "removing-website", label: "Removing links from our website" },
              { to: "rejection", label: "Rejection" },
              
            ].map((item, index) => (
                <div className="col-md-6">
              <li key={index}>
                <Link
                  to={item.to}
                  smooth={true}
                  duration={500}
                  offset={-100}
                  className="text-decoration-none"
                >
                  <i className="fas fa-circle-dot text-primary me-2"></i>
                  {item.label}
                </Link>
              </li>
              </div>
            ))}
          </ul>
        </div>
      </section>

      {/* Content Sections */}
      <section className="container">
        <Element name="terms-and-conditions" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-info-circle me-2 text-info"></i>Terms and Conditions</h5>
          <p>You are heartily welcome to Bageshwar Dham!</p>
<p>These terms and conditions outline the rules and regulations for the use of Bageshwar Dham's Website https://bageshwardham.co.in.</p>
<p>By accessing this website, we assume you accept these terms and conditions. If you do not agree to all of the terms and conditions stated on this page, please do not continue to use Bageshwar Dham.</p>
<p>The following terminology applies to these Terms and Conditions, Privacy Policy and Disclaimer Notice and all Agreements: "Client",
     "You" and "Your" refers to the person log on this website and compliant to the Company's Terms and Conditions. "Company", "We",
     "Our" and "Us" refers to our Company. "Party", "Parties" or "Us" refers to both the Client and us. All terms refer to the offer,
      acceptance and consideration of payment necessary to undertake the process of providing our assistance to the Client in the most 
      appropriate manner for the express purpose of meeting the Client's needs in respect of provision of the Company's stated services, 
      in accordance with and subject to, prevailing law of Netherlands.</p>
      <p>Any use of the above terminology or other words in the singular, plural, capitalization and/or he/she or they, are treated as interchangeable and as referring to same.</p>
        </Element>

        <Element name="cookies" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-database me-2 text-danger"></i>Cookies</h5>
          <p>We embrace the use of cookies. By accessing Bageshwar Dham, you agree to the use of cookies in accordance with Bageshwar Dham's Privacy Policy.</p>
          <p>Most interactive websites use cookies to collect user information on each visit. Our website uses cookies to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>
        </Element>

        <Element name="license" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-check-circle me-2 text-success"></i>License</h5>
          <p>Unless otherwise stated, Bageshwar Dham and/or its licensors own the intellectual property rights for all material on Bageshwar Dham. All intellectual property rights are reserved. You may access this from Bageshwar
             Dham solely for your own personal use, subject to the restrictions set out in these Terms and Conditions.</p>
             <p>You should not do this:</p>
                <p>- Republishing content from Bageshwar Dham</p>
                <p>- Selling or renting any content from Bageshwar Dham</p>
                <p>- Reproduce, duplicate or copy material from Bageshwar Dham</p>
                <p>- Redistributing content from Bageshwar Dham</p>
                <p>This Agreement shall commence on the date hereof. Our Terms and Conditions were created with the help of <a href="https://www.termsandconditionsgenerator.com/" target="_blank" rel="noopener noreferrer">the Free Terms and Conditions Generator</a>.</p>
                <p>Certain parts of this website offer the opportunity for users to post and exchange their views and information in specific 
                    areas of the website. Bageshwar Dham does not filter, edit, publish or review Comments prior to their appearance on the 
                    website. Comments do not represent the views and opinions of Bageshwar Dham, its agents and/or affiliates. Comments reflect 
                    the views and opinions of the person who posts them. To the extent permitted by applicable laws, Bageshwar Dham shall not be
                     liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or 
                     posting of and/or appearance of the Comments on this website.</p>
                     <p>Bageshwar Dham reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</p>
                     <p>You confirm and represent that:</p>
                     <p>- You have the right to post the Comments on our website and have all necessary licenses and permissions to do so;</p>
                     <p>- The Comments do not infringe any intellectual property right, including without limitation copyright, patent or trademark of any third party;</p>
                     <p>- The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy;</p>
                     <p>- Comments will not be used to solicit business or customers, present commercial activities or illegal activity.</p>
                     <p>You hereby grant Bageshwar Dham a non-privileged license to use, reproduce, edit and permit others to use, reproduce and edit any of your Comments in any form, format or media.</p>
        </Element>

        <Element name="hyperlinking-to-our-content" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-gavel me-2 text-warning"></i>Hyperlinking to our content</h5>
          <p>The following organizations may link to our Website without prior written permission:</p>
          <p>- government agencies;</p>
          <p>- Search engine;</p>
          <p>- news organizations;</p>
          <p>- Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses;</p>
          <p>- System-wide certified network of businesses except not-for-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Website.</p>
          <p>- These organizations may link to our home page, publications or to other Website information, provided that the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement, or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party's Website.</p>
          <p>We may consider and approve other link requests from the following types of organizations:</p>
          <p>- commonly-known consumer and/or business information sources;</p>
          <p>- dot.com community sites;</p>
          <p>- associations or other groups representing charities;</p>
          <p>- online directory distributors;</p>
          <p>- internet portals;</p>
          <p>- accounting, law and consulting firms whose primary clients are businesses; and</p>
          <p>- educational institutions and trade associations.</p>
          <p>We will approve link requests from these organizations if we determine that: (a) the link would not portray us or our accredited businesses in a negative light; (b) the organization does not have a negative track record with us; (c) the benefit to us from the visibility of the hyperlink compensates
             the absence of Bageshwar Dham; and (d) the link is in the context of general resource information.</p>
             <p>These organizations may link to our home page, provided that the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement, or approval of the linking party and its products or services;
                 and (c) fits within the context of the linking party's website.</p>
                 <p>If you are an organization listed in paragraph 2 above and are interested in linking to our website, you must notify us by emailing Bageshwar Dham. Please include your name, organization name, contact information, the URL of your site, a list of URLs from which you intend to link to our website, and a list of the URLs on our site to which you would like to link. Expect 2-3 weeks to receive a response.</p>
                 <p>Approved organizations may be permitted to hyperlink to our website as follows:</p>
                    <p>- By use of our corporate name; or</p>
                    <p>- By using the URL being linked to; or</p>
                    <p>- By use of any other description of our Website being linked to that makes sense within the context and format of content on the linking party's site.</p>
                    <p>No use of Bageshwar Dham's logo or other artwork will be allowed for linking without a trademark license agreement.</p>


        </Element>

        <Element name="iframes" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-cogs me-2 text-primary"></i>iFrames</h5>
          <p>Without prior approval and written permission, you may not create frames around pages of our Website that alter in any way the visual presentation or appearance of our Website.</p>
        </Element>

        <Element name="material-responsibility" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-lock me-2 text-dark"></i>Material Responsibility</h5>
          <p>We will not be responsible for any content appearing on your website. You agree to protect and defend us against all claims arising out of your website. No link(s) should appear on any website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>
        </Element>

        <Element name="your-privacy" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-trash-alt me-2 text-secondary"></i>Your Privacy</h5>
          <p>Please read the privacy policy</p>
        </Element>

        <Element name="reservation-rights" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-share-alt me-2 text-warning"></i>Reservation of Rights</h5>
          <p>We reserve the right to ask you to remove all links or any particular link to our website. You agree to immediately remove all links to our website upon our request. We also reserve the right to change these terms and conditions and its linking policy at any time. By continuously linking to our website, you agree to be bound by these linking terms and conditions.</p>
            
        </Element>

        <Element name="removing-website" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-user-shield me-2 text-info"></i>Removing links from our website</h5>
          <p>If you find any link on our Website objectionable for any reason, you are free to notify us at any time by contacting us. We will consider requests to remove links but we are not obligated to do so or to respond to you directly.</p>
          <p>We do not ensure that the information on this website is correct, nor do we warrant its completeness or accuracy; nor do we promise that the website will always be available or that the material on the website will be kept up to date.</p>  
        </Element>

        <Element name="rejection" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-envelope me-2 text-danger"></i>Rejection</h5>
          <p>To the fullest extent permitted by law, we disclaim all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
            <p>- limit or disclaim our or your liability for death or personal injury;</p>
            <p>- limit or disclaim our or your liability for fraud or fraudulent representations;</p>
            <p>- limit our or your liability in any way that is not permitted under applicable law; or</p>
            <p>- Disclaim any of our or your liability that cannot be disclaimed under applicable law.</p>
            <p>The limitations and prohibitions of liability in this Section and elsewhere: (a) are subject to the preceding paragraph; and (b) apply to all liabilities arising under the disclaimer, including liabilities arising in contract, tort and for breach of statutory duty.</p>
            <p>As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
        </Element>

         
      </section>
    </section>
    
  );
};

export default TermofService;
