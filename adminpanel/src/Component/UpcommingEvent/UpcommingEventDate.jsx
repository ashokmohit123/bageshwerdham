import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const UpcommingEventDate = ({ BASE_URL }) => {
 const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    endDate: "",
    location: "",
    dpimage: "",
    image: "",
    status: "active",
    creation_date: "",
    created_by: "admin",
  });
  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/selectupcomming_eventsdate`, {
        headers: { apikey: "12345" },
      });
      const arr = Array.isArray(res.data) ? res.data : [];
      setEventsslide(arr);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

 // In your React component
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("startDate", formData.startDate);
    fd.append("endDate", formData.endDate);
    fd.append("location", formData.location);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    fd.append("creation_date", formData.creation_date);

    if (formData.dpimage) fd.append("dpimage", formData.dpimage);
    if (formData.image) fd.append("image", formData.image);

    let res;
    if (editingId) {
      res = await axios.put(
        `${BASE_URL}/api/updateupcomming_eventsdate/${editingId}`,
        fd,
        {
          headers: {
            apikey: "12345",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const updated = res.data.record;
      setEventsslide((prev) =>
        prev.map((item) => (item.id === editingId ? updated : item))
      );
      alert("✅ Updated successfully");
    } else {
      res = await axios.post(
        `${BASE_URL}/api/insertupcomming_eventsdate`,
        fd,
        {
          headers: {
            apikey: "12345",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const created = res.data.record;
      setEventsslide((prev) => [...prev, created]);
      alert("✅ Data saved successfully: ID " + created.id);
    }
    resetForm();
    setShowForm(false);
    setShowEditModal(false);
  } catch (err) {
    console.error("❌ API Error:", err.response ? err.response.data : err.message);
    alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
  }
};


  const resetForm = () => {
    setFormData({
      title: "",
      startDate: "",
      endDate: "",
      location: "",
      dpimage: "",
      image: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      title: row.title,
      startDate: row.startDate,
      endDate: row.endDate,
      location: row.location,
      dpimage: "",
      image: "",
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/api/deleteupcomming_eventsdate/${id}`, {
        headers: { apikey: "12345" },
      });
      if (res.data.success) {
        setEventsslide((prev) => prev.filter((item) => item.id !== id));
        alert("✅ Deleted successfully");
      } else {
        alert("❌ Failed to delete: " + (res.data.error || "Unknown"));
      }
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusupcomming_eventsdate/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      if (res.data.success) {
        const newStatus = res.data.status;
        setEventsslide((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      } else {
        alert("❌ Failed to update status");
      }
    } catch (err) {
      console.error("Status toggle error:", err.response || err.message);
      alert("Failed to update status");
    }
  };




  
  return (
    <div className="top-banner">
       <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Upcoming Events</h3>
        <button className="btn btn-success btn-sm" onClick={() => setShowForm(!showForm)}>
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add Upcoming Event"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Bageshwar Dham</div>
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
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">DP Image</label>
                  <input
                    name="dpimage"
                    type="file"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Image</label>
                  <input
                    name="image"
                    type="file"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Published Date</label>
                  <input
                    type="date"
                    name="creation_date"
                    className="form-control"
                    value={formData.creation_date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button type="button" className="btn btn-danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Bageshwar Dham List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Location</th>
                <th>DP Image</th>
                <th>Image</th>
                <th>Publish Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsslide.length > 0 ? (
                eventsslide.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.startDate}</td>
                    <td>{item.endDate}</td>
                    <td>{item.location}</td>
                    <td>
                      {item.dpimage && (
                        <img
                          src={`${BASE_URL}${item.dpimage}`}
                          alt="DP"
                          style={{ width: "100px", height: "80px" }}
                        />
                      )}
                    </td>
                    <td>
                      {item.image && (
                        <img
                          src={`${BASE_URL}${item.image}`}
                          alt="alt-image"
                          style={{ width: "100px", height: "80px" }}
                        />
                      )}
                    </td>


                    <td>{item.creation_date?.split("T")[0]}</td>
                    <td>{item.created_by}</td>
                    <td>
                      <button
                        onClick={() => toggleStatus(item.id)}
                        className={`btn btn-sm ${
                          item.status === "active" ? "btn-success" : "btn-danger"
                        }`}
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
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item.id)}
                      >
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Upcomming Event</h5>
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
                      <label className="form-label">Start Date</label>
                      <input
                        type="date"
                        name="startDate"
                        className="form-control"
                        value={formData.startDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">End Date</label>
                      <input
                        type="date"
                        name="endDate"
                        className="form-control"
                        value={formData.endDate}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Location</label>
                      <input
                        type="text"
                        name="location"
                        className="form-control"
                        value={formData.location}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">DP Image</label>
                      <input
                        type="file"
                        name="dpimage"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3 mb-3">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
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

export default UpcommingEventDate;
