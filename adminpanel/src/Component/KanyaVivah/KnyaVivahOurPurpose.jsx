import React, { useState, useEffect } from "react";
import axios from "axios";

const KnyaVivahOurPurpose = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    videoUrl: "",
    infoText: "",
    title: "",
    purposeTitle: "",
    purposeText: "",
    journeyTitle: "",
    journeyText: "",
    creation_date: "",
    created_by: "admin", // Default example
    status: "active"
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null); // track edit mode
  const [showEditModal, setShowEditModal] = useState(false); // modal state

  // Handle form data change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Handle form submission (Create/Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
fd.append("videoUrl", formData.videoUrl);
fd.append("infoText", formData.infoText);
fd.append("title", formData.title);
fd.append("purposeTitle", formData.purposeTitle);
fd.append("purposeText", formData.purposeText);
fd.append("journeyTitle", formData.journeyTitle);
fd.append("journeyText", formData.journeyText);
fd.append("status", formData.status);
fd.append("created_by", formData.created_by);
fd.append("creation_date", formData.creation_date);

    try {
      const apiKey = "12345"; // Make sure this matches your backend key

      let res;
      if (editingId) {
        // Update request
        res = await axios.put(
          `${BASE_URL}/api/updatekanyavivah_ourpurpose/${editingId}`,
          fd,
          {
            headers: {
              apikey: apiKey, // Send the API key here
            },
          }
        );

        if (res.data) {
          setEventsslide(prev => prev.map(item => item.id === editingId ? res.data : item));
          alert("✅ Updated successfully");
          setShowEditModal(false);
        } else {
          throw new Error("Error: API response does not contain valid data.");
        }
      } else {
        // Create request
        res = await axios.post(
          `${BASE_URL}/api/insertkanyavivah_ourpurpose`,
          fd,
          {
            headers: {
              apikey: apiKey, // Send the API key here
            },
          }
        );

        if (res.data) {
          setEventsslide(prev => [...prev, res.data]);
          alert("✅ Data saved successfully: ID " + res.data.id);
        } else {
          throw new Error("Error: API response does not contain valid data.");
        }
      }
      resetForm();
    } catch (err) {
      console.error("❌ API Error:", err);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  // Reset the form
  const resetForm = () => {
    setFormData({
      videoUrl: "",
      infoText: "",
      title: "",
      purposeTitle: "",
      purposeText: "",
      journeyTitle: "",
      journeyText: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectkanyavivah_ourpurpose`, {
        headers: {
          apikey: "12345", // Ensure this API key matches the backend
        },
      })
      .then(res => setEventsslide(res.data))  // Now response contains only the record data
      .catch(err => console.error("Error fetching data", err));
  }, [BASE_URL]);

  // Edit handler
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      videoUrl: row.videoUrl,
      infoText: row.infoText,
      title: row.title,
      purposeTitle: row.purposeTitle,
      purposeText: row.purposeText,
      journeyTitle: row.journeyTitle,
      journeyText: row.journeyText,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });
    setShowEditModal(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deletekanyavivah_ourpurpose/${id}`, {
        headers: { apikey: "12345" },
      });
      setEventsslide(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  // Status Toggle Function
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statuskanyavivah_ourpurpose/${id}/status`,
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
        <h3>Kanya Vivah Our Purpose</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Kanya Vivah Our Purpose"}
        </button>
      </div>

      {/* ✅ Form */}
      {formData && (
        <div className="card mb-4">
          <div className="card-header">Bageshwer Dham</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">

                 <div className="col">
                  <label className="form-label">Video</label>
                  <input
                    type="text"
                    name="videoUrl"
                    className="form-control"
                    value={formData.videoUrl}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Info Text</label>
                  <input
                    type="text"
                    name="infoText"
                    className="form-control"
                    value={formData.infoText}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                 <div className="col">
                  <label className="form-label">Purpose Title</label>
                  <input
                    type="text"
                    name="purposeTitle"
                    className="form-control"
                    value={formData.purposeTitle}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label className="form-label">Purpose Text</label>
                  <input
                    type="text"
                    name="purposeText"
                    className="form-control"
                    value={formData.purposeText}
                    onChange={handleChange}
                  />
                </div>
                
                
               
              </div>
              <div className="row mb-3">
                 <div className="col">
                  <label className="form-label">Journey Title</label>
                  <input
                    type="text"
                    name="journeyTitle"
                    className="form-control"
                    value={formData.journeyTitle}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label className="form-label">Journey Text</label>
                  <input
                    type="text"
                    name="journeyText"
                    className="form-control"
                    value={formData.journeyText}
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
        <div className="card-header">Bageshwer Dham Our Purpose List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                 <th>Video Url</th>
                <th>Info Text</th>
                <th>Title</th>
                <th>Purpose Title</th>
                <th>Purpose Text</th>
                <th>Journey Title</th>
                <th>Journey Text</th> 
                <th>Publish Date</th>
                <th>Created By</th>
                 <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>

             {eventsslide.map((item, index) => (
                item && item.id ? (
                    <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      {item.videoUrl}
                    </td>
                    <td>{item.infoText}</td>
                    <td>{item.title}</td>
                    <td>{item.purposeTitle}</td>
                    <td>{item.purposeText}</td>
                    <td>{item.journeyTitle}</td>
                    <td>{item.journeyText}</td>
                    
                    <td>
                      {item.creation_date
                        ? new Date(item.creation_date).toLocaleDateString()
                        : "-"}
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
                ) : (
                    <div key="no-item">No item available</div>
                )
                ))}
             
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{maxWidth: '1400px'}}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Our Purpose</h5>
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
                      <label className="form-label">Video Url</label>
                     <input
                    type="text"
                    name="videoUrl"
                    className="form-control"
                    value={formData.videoUrl}
                    onChange={handleChange}
                       />
                    </div>
                    <div className="col">
                      <label className="form-label">Info Text</label>
                      <input
                        type="text"
                        name="infoText"
                        className="form-control"
                        value={formData.infoText}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Purpose Title</label>
                      <input
                        type="text"
                        name="purposeTitle"
                        className="form-control"
                        value={formData.purposeTitle}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Purpose Text</label>
                      <input
                        type="text"
                        name="purposeText"
                        className="form-control"
                        value={formData.purposeText}
                        onChange={handleChange}
                      />
                    </div>
                   
                   
                  </div>
                  <div className="row mb-3">
                       <div className="col">
                      <label className="form-label">Journey Title</label>
                      <input
                        type="text"
                        name="journeyTitle"
                        className="form-control"
                        value={formData.journeyTitle}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Journey Text</label>
                      <input
                        type="text"
                        name="journeyText"
                        className="form-control"
                        value={formData.journeyText}
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

export default KnyaVivahOurPurpose;
