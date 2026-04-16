// src/components/PrivacyPolicy.js

import React from "react";
import { Link, Element } from "react-scroll";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";


const PrivacyPolicy = () => {
  return (
    <section className="privacy-policy-page">
      {/* Header */}
      <header className="text-white py-5 text-center header-gradient">
        <div className="container">
          <h1 className="fw-bold">Privacy Policy</h1>
          <p>Your privacy matters to us. Learn how we protect your data.</p>
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
              { to: "privacy-policy", label: "Privacy Policy for Bageshwar Dham" },
              { to: "consent", label: "Consent" },
              { to: "information-collect", label: "Information We Collect" },
              { to: "your-information", label: "How do we use your information" },
              { to: "log-files", label: "Log Files" },
              { to: "cookies", label: "Cookies and Web Beacons" },
              { to: "doubleclick", label: "Google DoubleClick DART Cookie" },
              { to: "advertising-partners", label: "Our advertising partners" },
              { to: "advertising-partners-privacy", label: "Advertising Partners' Privacy Policies" },
              { to: "third-party", label: "Third-Party Privacy Policies" },
              { to: "ccpa-rights", label: "CCPA Privacy Rights" },
              { to: "gdpr-rights", label: "GDPR data protection rights" },
              { to: "children-information", label: "Children's information" },
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
        <Element name="privacy-policy" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-info-circle me-2 text-info"></i>Privacy Policy for Bageshwar Dham</h5>
          <p>Bageshwar Dham, whose official website is <a href="https://bageshwardham.co.in">https://bageshwardham.co.in</a>,
, places a high priority on protecting the privacy of our visitors. This privacy policy document outlines the types of 
information we collect, how we record it, and how we use it.</p>
<p>If you have any additional questions or require more information about our Privacy Policy, please do not hesitate to contact us.</p>
<p>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regard to the information
     they shared and/or that we collect through the Bageshwar 
    Dham website. This policy does not apply to any information collected offline or via channels other than this website.</p>
        </Element>

        <Element name="consent" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-database me-2 text-danger"></i>Consent</h5>
          <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
        </Element>

        <Element name="information-collect" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-check-circle me-2 text-success"></i>Information We Collect</h5>
          <p>When you are asked to provide personal information, we will clearly explain why the information is being requested and how
             it will be used.</p>
             <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of your 
                message and/or any attachments you may send us, and any other information you choose to provide.</p>
                <p>When you register for an account, we may ask for your contact information, including details such as your name, company name, address, email address, and phone number.</p>
        </Element>

        <Element name="your-information" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-gavel me-2 text-warning"></i>How do we use your information</h5>
          <p>We use the information we collect in a variety of ways, including:</p>
          <p>- Providing, operating, and maintaining our website</p>
          <p>- Improving, personalizing, and expanding our website</p>
          <p>- Understanding and analyzing how you use our website</p>
          <p>- Communicating with you, including responding to your comments, questions, and requests</p>
          <p>- Sending you emails</p>
          <p>- Finding and preventing fraud</p>

        </Element>

        <Element name="log-files" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-cogs me-2 text-primary"></i>Log Files</h5>
          <p>Bageshwar Dham follows a standard procedure of using log files. These files log visitors when they visit websites. 
            All hosting companies do this and it is part of the analytics of hosting services. The information collected by 
            log files include Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time
             indication, referring/exit pages, and possibly the number of clicks. It is not linked to any personally
              identifiable information. The purpose of this information is to analyze trends, administer the site, track users' 
              movement on the website, and gather demographic information.</p>
        </Element>

        <Element name="cookies" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-lock me-2 text-dark"></i>Cookies and Web Beacons</h5>
          <p>Like any other website, Bageshwar Dham uses 'cookies'. These cookies are used to store information, including visitors'
             preferences and the pages on the website that the visitor accessed or visited. This information is used to optimize the
              user's experience, allowing us to customize our web page content based on visitors' browser type and/or other information.</p>
        </Element>

        <Element name="doubleclick" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-trash-alt me-2 text-secondary"></i>Google DoubleClick DART Cookie</h5>
          <p>Google is one of a third-party vendor on our site. It uses cookies, known as DART cookies, to serve ads to our site 
            visitors based on their visit to www.website.com and other sites on the Internet. However, visitors may choose to
             decline the use of DART cookies by visiting the Google ad and content network privacy policy at the URL –</p>
             <p><a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a></p>
        </Element>

        <Element name="advertising-partners" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-share-alt me-2 text-warning"></i>Our advertising partners</h5>
          <p>Some advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has its own privacy policy that reflects 
            their policies on user data. For easy access, we have hyperlinked to their privacy policies below.</p>
             <p>- Google</p>
            <a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a>
        </Element>

        <Element name="advertising-partners-privacy" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-user-shield me-2 text-info"></i>Advertising Partners' Privacy Policies</h5>
          <p>You may consult this list to find the Privacy Policy for each of the advertising partners of Bageshwar Dham.</p>
          <p>Third-party ad servers or ad networks use technologies such as cookies, JavaScript, or Web Beacons that are used in their respective
             advertisements and links that appear on Bageshwar Dham, and these are sent directly to users' browser. When 
             this happens, they automatically receive your IP address. These technologies are used to measure the effectiveness of their
              advertising campaigns and/or to personalize the content of the advertisements that you see on websites you visit.</p>
            <p>Please note that Bageshwar Dham has no access to or control over these cookies that are used by third-party advertisers.</p>  
        </Element>

        <Element name="third-party" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-envelope me-2 text-danger"></i>Third-Party Privacy Policies</h5>
          <p>Bageshwar Dham's privacy policy does not apply to other advertisers or websites. Therefore, we advise you to consult the respective privacy policies of these third-party ad servers for more detailed information.
            They may include their practices and instructions about how to opt out of certain options.</p>
            <p>You can choose to disable cookies through your individual browser options. More detailed information about cookie management with specific web browsers can be found at the browsers' respective websites.</p>
        </Element>

         <Element name="ccpa-rights" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-user-shield me-2 text-danger"></i>CCPA Privacy Rights (Do Not Sell My Personal Information)</h5>
          <p>Under the CCPA, among other rights, California consumers have the right to:</p>
          <p>Request that a business disclose the categories and specific pieces of personal data that a business has collected about consumers.</p>
          <p>Request that a business delete any personal data about the consumer that a business has collected.</p>
            <p>Request that a business not sell a consumer's personal data.</p>
            <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>
        </Element>

                 <Element name="gdpr-rights" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-shield-alt me-2 text-danger"></i>GDPR data protection rights</h5>
          <p>We want to make sure you are fully aware of all your data protection rights. Every user has the right to:</p>
          <p>Right to access – You have the right to request copies of your personal data. We may charge a small fee for this service.</p>
          <p>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete any information you believe is incomplete.</p>
            <p>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.

The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</p>
            <p>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</p>
            <p>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</p>
            <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>
        </Element>

          <Element name="children-information" className="card shadow-sm mb-4 p-4">
          <h5><i className="fas fa-child me-2 text-danger"></i>Children's information</h5>
          <p>Another priority is protecting children while using the Internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their children's online activity.</p>
          <p>Bageshwar Dham does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>
         
        </Element>
      </section>
    </section>
    
  );
};

export default PrivacyPolicy;
