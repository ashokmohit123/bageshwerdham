import React  from "react";

const BageshwarLeafletMap = () => {
 

  return (
    <div className="container-fluid p-0">
      <h2 className="mb-3 text-center">📍 Bageshwar Dham Sarkar</h2>

      <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28971.315348348675!2d79.77898583188137!3d24.815497539330703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3982ed2e992448d9%3A0x5e1eb1352e11636!2sBageshwar%20dham!5e0!3m2!1sen!2sin!4v1759906629857!5m2!1sen!2sin"
     
      height="450"
        style={{border:0, width: "100%", maxHeight: "450px"}}
      title='Bageshwar Dham Location'
      allowfullscreen="" 
      loading="lazy" 
      referrerpolicy="no-referrer-when-downgrade">   
    </iframe>
    </div>
  );
};

export default BageshwarLeafletMap;
