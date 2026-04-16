import React, { useState, useEffect } from "react";
import axios from "axios";

const AboutEvents = ({ BASE_URL }) => {
  // ✅ Table data
   const [formData, setFormData] = useState({
   
     href: "",
    brand_alt: "",
    brand_src: "",
    video: "",
    image: "",
    caption: "",
    figure_bg: "",
    type: "",
    status: "active",
    creation_date: "",
    created_by: "admin" // Default example
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
    fd.append("href", formData.href);
    fd.append("brand_alt", formData.brand_alt);
    fd.append("brand_src", formData.brand_src);
    // fd.append("video", formData.video);
    // fd.append("image", formData.image);
    fd.append("caption", formData.caption);
    fd.append("figure_bg", formData.figure_bg);
    fd.append("type", formData.type);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    fd.append("creation_date", formData.creation_date);

    if (formData.video) {
      fd.append("video", formData.video);
    }

    if (formData.image) {
      fd.append("image", formData.image);
    }
    

    if (editingId) {
      // ✅ Update existing
      const res = await axios.put(
        `${BASE_URL}/api/updateabout_events/${editingId}`,
        fd,
        { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
      );

      setEventsslide((prev) =>
        prev.map((item) =>
          item.id === editingId ? res.data.record : item
        )
      );
      
      alert("✅ Updated successfully");
      setShowEditModal(false);

    } else {
      // ✅ Add new
      const res = await axios.post(`${BASE_URL}/api/insertabout_events`, fd, {
        headers: { apikey: "12345", "Content-Type": "multipart/form-data" },
      });

      setEventsslide((prev) => [...prev, res.data.record]);

      alert("✅ Data saved successfully: ID " + res.data.record.id);
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
    axios.get(`${BASE_URL}/api/selectabout_events`, {
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
    href: row.href,
    brand_alt: row.brand_alt,
    brand_src: row.brand_src,
    video: row.video,
    image: row.image,
    caption: row.caption,
    figure_bg: row.figure_bg,
    type: row.type,
    creation_date: row.creation_date?.split("T")[0],
    created_by: row.created_by || "admin",
    status: row.status || "active",
  });
  setShowEditModal(true);
};


  

  // ✅ Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deleteabout_events/${id}`, {
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
      href: "",
      brand_alt: "",
      brand_src: "",
      video: "",
      image: "",
      caption: "",
      figure_bg: "",
      type: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };



// ✅ Status Toggle Function
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusabout_events/${id}/status`,
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>About Events</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add About Events"}
        </button>
      </div>

      {/* ✅ Form */}
      {formData && (
        <div className="card mb-4">
          <div className="card-header">Bageshwer Dham</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Href</label>
                  <input
                    type="text"
                    name="href"
                    className="form-control"
                    value={formData.href}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Brand Alt</label>
                  <input
                    type="text"
                    name="brand_alt"
                    className="form-control"
                    value={formData.brand_alt}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Brand Src</label>
                  <input
                    type="text"
                    name="brand_src"
                    className="form-control"
                    value={formData.brand_src}
                    onChange={handleChange}
                  />
                </div>

                

                 <div className="col-md-3">
                  <label className="form-label">Video</label>
                  <input
                    type="file"
                    name="video"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Image </label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                 <div className="col-md-3">
                  <label className="form-label">Caption</label>
                  <input
                    type="text"
                    name="caption"
                    className="form-control"
                    value={formData.caption}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Figure Bg</label>
                  <input
                    type="text"
                    name="figure_bg"
                    className="form-control"
                    value={formData.figure_bg}
                    onChange={handleChange}
                  />
                </div>

                 <div className="col-md-3">
                  <label className="form-label">Type</label>
                  <input
                    type="text"
                    name="type"
                    className="form-control"
                    value={formData.type}
                    onChange={handleChange}
                  />
                </div>
                 
               
              </div>
              <div className="row mb-3">
                 <div className="col-md-3">
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
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Table */}
      <div className="card">
        <div className="card-header">Bageshwer About Events List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Href</th>
                 <th>Brand Alt</th>
                  <th>Brand Src</th>
                 <th>Video</th>
                 <th>Image</th>
                <th>Caption</th>
                <th>Figure Bg</th>
                 <th>Type</th>
                <th>Publish Date</th>
                <th>Created By</th>
                 <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsslide.length > 0 ? (
                eventsslide.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.href}</td>
                     <td>{item.brand_alt}</td>
                    <td>{item.brand_src}</td>
                    <td>
                        <video
                        src={`${BASE_URL}${item.video}`}
                        width="120"
                        height="80"
                        style={{ borderRadius: "10px", width: "120px", height: "60px", objectFit: "cover" }}
                        ></video>
                        </td>
                        
                      <td>

                          <img
                        src={`${BASE_URL}${item.image}`}
                        alt="thumbnail"
                        style={{ width: "100px", height: "80px" }}
                      />
                    </td>
                  <td>{item.caption}</td>
                   <td>{item.figure_bg}</td>
                    <td>{item.type}</td>

                    <td>
                      {item.creation_date
}
                    </td>
                    <td>{item.created_by}</td>
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
                    <td>
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">
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
                <h5 className="modal-title">Edit About Events</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Href</label>
                      <input
                        type="text"
                        name="href"
                        className="form-control"
                        value={formData.href}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label">Brand Alt</label>
                      <input
                        type="text"
                        name="brand_alt"
                        className="form-control"
                        value={formData.brand_alt}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3">
                      <label className="form-label">Brand Src</label>
                      <input
                        type="text"
                        name="brand_src"
                        className="form-control"
                        value={formData.brand_src}
                        onChange={handleChange}
                      />
                    </div>

                    
                   
                     <div className="col-md-3">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3">
                      <label className="form-label">Video</label>
                      <input
                        type="file"
                        name="video"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Caption</label>
                      <input
                        type="text"
                        name="caption"
                        className="form-control"
                        value={formData.caption}
                        onChange={handleChange}
                      />
                    </div> 

                    <div className="col-md-3">
                      <label className="form-label">Figure Bg</label>
                      <input
                        type="text"
                        name="figure_bg"
                        className="form-control"
                        value={formData.figure_bg}
                        onChange={handleChange}
                      />
                    </div> 

                     <div className="col-md-3">
                      <label className="form-label">Type</label>
                      <input
                        type="text"
                        name="type"
                        className="form-control"
                        value={formData.type}
                        onChange={handleChange}
                      />
                    </div> 
                    
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-3">
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

export default AboutEvents;
