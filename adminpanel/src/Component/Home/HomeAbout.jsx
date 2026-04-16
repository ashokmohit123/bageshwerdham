import React, { useState, useEffect } from "react";
import axios from "axios";



const HomeAbout = ({ BASE_URL }) => {
 
// submit form data
   const [formData, setFormData] = useState({
    heading: "",
    imageSrc: "",
    description: "",
    buttonText: "",
    logos: "",
    videoSrc: "",
    eventTitle: "",
    eventLink: "",
    resolutionsHeading: "",
    resolutionsDescription: "",
    stats: "",
    creation_date: "",
    created_by: "admin", // Default example
    status: "active"
  });

  

 const handleChange = (e) => {
  const { name, value, files } = e.target;
  setFormData({
    ...formData,
    [name]: files ? files[0] : value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const fd = new FormData();
    fd.append("heading", formData.heading);
    //fd.append("imageSrc", formData.imageSrc);
    fd.append("description", formData.description);
    fd.append("buttonText", formData.buttonText);
    // fd.append("logos", JSON.stringify(formData.logos));
    // fd.append("videoSrc", formData.videoSrc);
    fd.append("eventTitle", formData.eventTitle);
    fd.append("eventLink", formData.eventLink);
    fd.append("resolutionsHeading", formData.resolutionsHeading);
    fd.append("resolutionsDescription", formData.resolutionsDescription);
    fd.append("stats", JSON.stringify(formData.stats));
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    fd.append("creation_date", formData.creation_date);

    // ✅ Attach files if selected
  if (formData.imageSrc) {
    fd.append("imageSrc", formData.imageSrc);
  }
  if (formData.logos) {
    fd.append("logos", formData.logos);
  }
  if (formData.videoSrc) {
    fd.append("videoSrc", formData.videoSrc);
  }

   if (editingId) {
  const response = await axios.put(
    `${BASE_URL}/api/updatehomeabout/${editingId}`,
    fd,
    {
      headers: {
        apikey: "12345",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const updatedHomeAbout = response.data.data;

  if (updatedHomeAbout) {
    setEventsslide((prev) =>
      prev.map((item) =>
        item.id === editingId ? updatedHomeAbout : item
      )
    );
  }

  alert("✅ Updated successfully");
  setShowEditModal(false);
} else {
      // ✅ Add new
      const res = await axios.post(`${BASE_URL}/api/inserthomeabout`, fd, {
        headers: {
          apikey: "12345",
          "Content-Type": "multipart/form-data",
        },
      });
console.log(res.data);
      // ✅ Append new row to eventsslide
    setEventsslide((prev) => [
  ...prev,
  {
    id: res.data.id,
    ...formData,
    imageSrc: res.data.imageSrc,
    videoSrc: res.data.videoSrc,
    logos: res.data.logos,
  },
]);

      alert("✅ Data saved successfully: ID " + res.data.id);
    }

    resetForm();
  } catch (err) {
    console.error("❌ API Error:", err.response ? err.response.data : err.message);
    alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
  }
};


//select all data table

 const [eventsslide, setEventsslide] = useState([]);

  // ✅ Fetch data from API
  useEffect(() => {
    axios.get(`${BASE_URL}/api/selecthomeabout`, {
      headers: {
        "apikey": "12345" // 👈 same key jo backend me hai
      }
      
    })

    
    .then(res => setEventsslide(res.data))
    .catch(err => console.error("Error fetching data", err));
  }, [BASE_URL]);

  const [editingId, setEditingId] = useState(null); // track edit mode
  const [showEditModal, setShowEditModal] = useState(false); // modal state


   // ✅ Edit handler (open modal)
   
   
 
  const handleEdit = (row) => {
  setEditingId(row.id);
  setFormData({
    heading: row.heading ,
    imageSrc: row.imageSrc,
    buttonText: row.buttonText,
    description: row.description,
    eventLink: row.eventLink,
    eventTitle: row.eventTitle,
    resolutionsHeading: row.resolutionsHeading,
    resolutionsDescription: row.resolutionsDescription,
    stats: row.stats,
    logos: row.logos,
    videoSrc: row.videoSrc,
    creation_date: row.creation_date?.split("T")[0] || "",
    created_by: row.created_by || "admin",
    status: row.status || "active",
  });
  setShowEditModal(true);
};


  

  // ✅ Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deletehomeabout/${id}`, {
        headers: { apikey: "12345" },
      });
    //  alert("✅ Deleted successfully");
    setEventsslide(prev => prev.filter(event => event.id !== id));

      //fetchBanners();
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
     heading: "",
    imageSrc: "",
    description: "",
    buttonText: "",
    logos: [],
    videoSrc: "",
    eventTitle: "",
    eventLink: "",
    resolutionsHeading: "",
    resolutionsDescription: "",
    stats:"",
    creation_date: "",
    created_by: "admin", // Default example
    status: "active"
    });
    setEditingId(null);
  };



// ✅ Status Toggle Function
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statushomeabout/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: res.data.status } : b
        )
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update status");
    }
  };


  return (
    <div className="top-banner">
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Home About Section</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Home About"}
        </button>
      </div>

      {/* Add Event Form */}
      {formData && (
         <div className="card mb-4">
      <div className="card-header">Bageshwer Dham</div>
      <div className="card-body">
        <form onSubmit={handleSubmit} enctype="multipart/form-data">
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Heading</label>
              <input type="text" name="heading" className="form-control" placeholder="Enter Heading"
                value={formData.heading} onChange={handleChange} />
            </div>

             <div className="col">
              <label className="form-label">Image Source</label>
              <input type="file" name="imageSrc" className="form-control" placeholder="Enter Image Source"
                 onChange={handleChange} />
            </div>
             <div className="col">
              <label className="form-label">Logos</label>
              <input type="file" name="logos" className="form-control" placeholder="Enter Logos"
                onChange={handleChange} />
            </div>
             <div className="col">
              <label className="form-label">Video Source</label>
              <input type="file" name="videoSrc" className="form-control" placeholder="Enter Video Source"
                onChange={handleChange} />
            </div>
             <div className="col">
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-control" placeholder="Enter Description"
                value={formData.description} onChange={handleChange} />
            </div>
         
          </div>

          <div className="row mb-3">
              <div className="col">
              <label className="form-label">Event Title</label>
              <input type="text" name="eventTitle" className="form-control" placeholder="Enter Event Title"
                value={formData.eventTitle} onChange={handleChange} />
            </div>
            <div className="col">
              <label className="form-label">Event Link</label>
              <input type="text" name="eventLink" className="form-control" placeholder="Enter Event Link"
                value={formData.eventLink} onChange={handleChange} />
            </div>
           <div className="col">
            <label className="form-label">Resolutions Heading</label>
            <input
                type="text"
                name="resolutionsHeading"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>

            <div className="col">
            <label className="form-label">Resolutions Description</label>
            <input
                type="text"
                name="resolutionsDescription"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>
             <div className="col">
            <label className="form-label">Stats</label>
            <input
                type="text"
                name="stats"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>
             <div className="col">
            <label className="form-label">Button Text</label>
            <input
                type="text"
                name="buttonText"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>
            <div className="col">
              <label className="form-label">Published Date</label>
              <input type="date" name="creation_date" className="form-control"
                value={formData.creation_date} onChange={handleChange} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn btn-danger">Cancel</button>
          </div>

        </form>
      </div>
    </div>
  
    
      )}

      {/* Festival Guru List Table */}
      <div className="card">
        <div className="card-header">Bageshwer Dham List</div>
        <div className="card-body" style={{overflowX:"scroll", width:"1596px" }}>
           
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Heading</th>
             <th>Description</th>
            <th>Event Title</th>
            <th>Event Link</th> 
            <th>Resolutions Heading</th>
            <th>Resolutions Description</th>
             <th>Images</th>
            <th>Logo</th>
            <th>Video</th>
            <th>Stats</th> 
            <th>Button Text</th>
            <th>Created By</th>
            <th>Publish Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {eventsslide.length > 0 ? (
            eventsslide
            //.filter((item) => item.status === "active") // ✅ sirf active rows dikhayega
            .map((item, index) => (
              <tr key={item.id} className={item.status === "active" ? "active-row" : "inactive-row"}>
                <td>{index + 1}</td>
                <td>{item.heading}</td>
                <td>{item.description}</td>
                {/* <td>{item.imageSrc}</td>
                <td>{item.logos}</td>
                <td>{item.videoSrc}</td> */}
                <td>{item.eventTitle}</td>
                <td>{item.eventLink}</td>
                <td>{item.resolutionsHeading}</td>
                <td>{item.resolutionsDescription}</td>
               
                <td>
                    <img
              src={`${BASE_URL}${item.imageSrc}`}
              width="50"
              alt="thumb"
            />
                
                </td>
                <td>
                    <img src={`${BASE_URL}${item.logos}`} width="50" alt="thumb" />
                </td>
                <td>
            <video
                src={`${BASE_URL}${item.videoSrc}`}
                width="120"
                height="80"
                style={{ borderRadius: "10px", width: "120px", height: "60px", objectFit: "cover" }}
            >
                Your browser does not support the video tag.
            </video>
            </td>
                 
                 <td>{item.stats}</td>
                 <td>{item.buttonText}</td>
                <td>{item.created_by}</td>
                <td>
                  {item.creation_date
                    ? new Date(item.creation_date).toLocaleDateString()
                    : "-"}
                </td>
               
              <td>
                <button
                  className={`btn btn-sm ${
                    item.status === "active" ? "btn-success" : "btn-danger"
                  }`}
                  onClick={() => toggleStatus(item.id)}
                >
                  {item.status === "active" ? "Active" : "Inactive"}
                </button>
              </td>
               
                <td className="text-nowrap">
                  <button className="btn btn-sm btn-info me-1" onClick={() => handleEdit(item)}>
                    <i className="fa fa-edit"></i>
                  </button>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleDelete(item.id)}>
                    <i className="fa fa-trash"></i>
                  </button>
                 
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>
   
    </div>
      </div>

 {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Testimonial</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Heading</label>
                      <input
                        type="text"
                        name="heading"
                        className="form-control"
                        value={formData.heading}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Event Title</label>
                      <input
                        type="text"
                        name="eventTitle"
                        className="form-control"
                        value={formData.eventTitle}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                    <div className="row mb-3">
                     <div className="col">
                      <label className="form-label">Event Link</label>
                      <input
                        type="text"
                        name="eventLink"
                        className="form-control"
                        value={formData.eventLink}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label className="form-label">Resolutions Heading</label>
                      <input
                        type="text"
                        name="resolutionsHeading"
                        className="form-control"
                        value={formData.resolutionsHeading}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label className="form-label">Resolutions Description</label>
                      <input
                        type="text"
                        name="resolutionsDescription"
                        className="form-control"
                        value={formData.resolutionsDescription}
                        onChange={handleChange}
                      />
                    </div>
                    </div>
                    <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        name="imageSrc"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Video</label>
                      <input
                        type="file"
                        name="videoSrc"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Logo</label>
                      <input
                        type="file"
                        name="logos"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                     <div className="col">
                      <label className="form-label">Stats</label>
                      <input
                        type="text"
                        name="stats"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Button Text</label>
                      <input
                        type="text"
                        name="buttonText"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Published Date</label>
                      <input
                        type="date"
                        name="creation_date"
                        className="form-control"
                        value={formData.creation_date}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary">
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default HomeAbout;
