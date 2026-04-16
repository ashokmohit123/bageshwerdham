import React, { useState, useEffect } from "react";
import axios from "axios";

const InspirationMillions = ({ BASE_URL }) => {
  // ✅ Table data
   const [formData, setFormData] = useState({
   
    icon: "",
    label: "",
    corner: "",
    heading: "",
    description: "",
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
    fd.append("icon", formData.icon);
    fd.append("label", formData.label);
    fd.append("corner", formData.corner);
    fd.append("heading", formData.heading);
    fd.append("description", formData.description);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    fd.append("creation_date", formData.creation_date);

    
    if (editingId) {
      // ✅ Update existing
      const res = await axios.put(
        `${BASE_URL}/api/updateabout_inspirationmillions/${editingId}`,
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
      const res = await axios.post(`${BASE_URL}/api/insertabout_inspirationmillions`, fd, {
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
    axios.get(`${BASE_URL}/api/selectabout_inspirationmillions`, {
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
    icon: row.icon,
    label: row.label,
    corner: row.corner,
    heading: row.heading,
    description: row.description,
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
      await axios.delete(`${BASE_URL}/api/deleteabout_inspirationmillions/${id}`, {
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
      icon: "",
      label: "",
      corner: "",
      heading: "",
      description: "",
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
        `${BASE_URL}/api/statusabout_inspirationmillions/${id}/status`,
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
        <h3>Inspiration Millions</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Inspiration Millions"}
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
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    className="form-control"
                    value={formData.icon}
                    onChange={handleChange}
                  />
                </div>
                 

                 <div className="col-md-3">
                  <label className="form-label">Label</label>
                  <input
                    type="text"
                    name="label"
                    className="form-control"
                    value={formData.label}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Corner</label>
                  <input
                    type="text"
                    name="corner"
                    className="form-control"
                    value={formData.corner}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Heading </label>
                  <input
                    type="text"
                    name="heading"
                    className="form-control"
                    value={formData.heading}
                    onChange={handleChange}
                  />
                </div>
                 </div>
                 <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Description </label>
                  <input
                    type="text"
                    name="description"
                    className="form-control"
                    value={formData.description}
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
                <th>Icon</th>
                 <th>Label</th>
                  <th>Corner</th>
                <th>Heading</th>
                <th>Description</th>
                <th>Creation Date</th>
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
                    <td>{item.icon}</td>
                        <td>{item.label}</td>
                         <td>{item.corner}</td>
                    <td>{item.heading}</td>
                    <td>{item.description}</td>

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
                <h5 className="modal-title">Edit Inspiration Millions</h5>
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
                      <label className="form-label">Icon</label>
                      <input
                        type="text"
                        name="icon"
                        className="form-control"
                        value={formData.icon}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Label</label>
                      <input
                        type="text"
                        name="label"
                        className="form-control"
                        value={formData.label}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Corner</label>
                      <input
                        type="text"
                        name="corner"
                        className="form-control"
                        value={formData.corner}
                        onChange={handleChange}
                      />
                    </div> 

                    <div className="col-md-3">
                      <label className="form-label">Heading</label>
                      <input
                        type="text"
                        name="heading"
                        className="form-control"
                        value={formData.heading}
                        onChange={handleChange}
                      />
                    </div> 

                    <div className="col-md-3">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        value={formData.description}
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

export default InspirationMillions;
