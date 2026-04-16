import React, { useState, useEffect } from "react";
import axios from "axios";

const GurudevrRsolutions = ({ BASE_URL }) => {
  // ✅ Table data
   const [formData, setFormData] = useState({
   
     title: "",
    image: "",
    video: "",
    description: "",
    stats: "",
    buttons: "",
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
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("stats", formData.stats);
    fd.append("buttons", formData.buttons);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    fd.append("creation_date", formData.creation_date);

    if (formData.image) {
      fd.append("image", formData.image);
    }
    if (formData.video) {
      fd.append("video", formData.video);
    }

    if (editingId) {
      // ✅ Update existing
      const res = await axios.put(
        `${BASE_URL}/api/updategurudevresolutions/${editingId}`,
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
      const res = await axios.post(`${BASE_URL}/api/insertgurudevresolutions`, fd, {
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
    axios.get(`${BASE_URL}/api/selectgurudevresolutions`, {
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
    title: row.title,
    description: row.description,
    stats: row.stats,
    buttons: row.buttons,
    image: row.image,
    video: row.video,
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
      await axios.delete(`${BASE_URL}/api/deletegurudevresolutions/${id}`, {
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
      title: "",
      description: "",
      stats: "",
      buttons: "",
      image: "",
      video: "",
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
        `${BASE_URL}/api/statusgurudevresolutions/${id}/status`,
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
        <h3>Gurudev Rsolutions</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Gurudev Rsolution"}
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
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Description</label>
                  <textarea
                    rows="3"
                    cols="20"
                    name="description"
                    className="form-control"
                    value={formData.description}
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
               
              </div>
              <div className="row mb-3">

               

                  <div className="col-md-3">
                  <label className="form-label">Stats</label>
                  <input
                    type="text"
                    name="stats"
                    className="form-control"
                    value={formData.stats}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Buttons</label>
                  <input
                    type="text"
                    name="buttons"
                    className="form-control"
                    value={formData.buttons}
                    onChange={handleChange}
                  />
                </div>
                
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
        <div className="card-header">Bageshwer Dham List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Description</th>
                 <th>Image</th>
                  <th>Video</th>
                  <th>Stats</th>
                 <th>Buttons</th>
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
                    <td>{item.title}</td>
                    <td>{item.description}</td>

                    <td>

                          <img
                        src={`${BASE_URL}${item.image}`}
                        alt="thumbnail"
                        style={{ width: "100px", height: "80px" }}
                      />
                    </td>
                    <td>
                      {item.video && (
                        <video
                          src={`${BASE_URL}${item.video}`}
                          controls
                          style={{ width: "100px", height: "80px" }}
                        />
                      )}
                    </td>

                    <td>
                      {item.stats}
                    </td>
                    <td>
                      {item.buttons}
                    </td>
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
                <h5 className="modal-title">Edit Gurudev Resolution</h5>
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
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Description</label>
                      <textarea
                        rows="3"
                        cols="20"
                        name="description"
                        className="form-control"
                        value={formData.description}
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
                     
                    
                  </div>
                  <div className="row mb-3">
                   
                   
                    
                   <div className="col">
                      <label className="form-label">Stats</label>
                      <input
                        type="text"
                        name="stats"
                        className="form-control"
                        value={formData.stats}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Button</label>
                      <input
                        type="text"
                        name="buttons"
                        className="form-control"
                        value={formData.buttons}
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

export default GurudevrRsolutions;
