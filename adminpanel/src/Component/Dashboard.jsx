import React from "react";

const Dashboard = () => {
  const stats = [
    {
      id: 1,
      title: "Videos",
      value: "3K",
      sub: "Sankirtan 674",
      color: "bg-danger",
      icon: "fa-solid fa-video",
    },
    {
      id: 2,
      title: "Bhajans",
      value: "274",
      sub: "Bhajan",
      color: "bg-success",
      icon: "fa-solid fa-music",
    },
    {
      id: 3,
      title: "News",
      value: "1.4K",
      sub: "News",
      color: "bg-info",
      icon: "fa-solid fa-newspaper",
    },
  ];

  return (
    <div className="container-fluid p-4" style={{ background: "#d9d9dd", minHeight: "100vh" }}>
      <h3 className="text-center mb-4">
        WELCOME TO <span className="text-info">BHAGESHWER BHAM</span>{" "}
        <span className="text-danger">ADMIN</span>
      </h3>

      <div className="row g-4 justify-content-center" style={{display:'none'}}>
        {stats.map((item) => (
          <div className="col-md-3" key={item.id}>
            <div className="d-flex shadow-sm rounded overflow-hidden">
          
              <div className={`${item.color} text-white d-flex align-items-center justify-content-center p-4`}>
                <i className={item.icon} style={{ fontSize: "2rem" }}></i>
              </div>

             
              <div className="bg-white flex-grow-1 p-3 d-flex flex-column justify-content-center">
                <h6 className="mb-1">{item.title}</h6>
                <p className="mb-0">
                  <strong>{item.value}</strong> <br />
                  <small className="text-muted">{item.sub}</small>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
