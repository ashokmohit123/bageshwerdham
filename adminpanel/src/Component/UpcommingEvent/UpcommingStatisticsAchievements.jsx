import React, { useState, useEffect } from "react";
import axios from "axios";

const UpcommingStatisticsAchievements = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    stat_number: "",
    stat_text: "",
    description: "",
    note: "",
    status: "active",
    creation_date: "",
    created_by: "admin"
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
      for (let key in formData) {
        fd.append(key, formData[key]);
      }

      if (editingId) {
        const res = await axios.put(`${BASE_URL}/api/updateupcomming_statistics_achievements/${editingId}`, formData, {
  headers: { apikey: "12345", "Content-Type": "application/json" },
});

        setEventsslide(prev =>
          prev.map(item =>
            item.id === editingId ? res.data.record : item
          )
        );
        alert("✅ Updated successfully");
        setShowEditModal(false);
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/insertupcomming_statistics_achievements`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );
        setEventsslide(prev => [...prev, res.data.record]);
        alert("✅ Data saved successfully");
      }

      resetForm();
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      alert("❌ Error saving data");
    }
  };

  const resetForm = () => {
    setFormData({
      stat_number: "",
      stat_text: "",
      description: "",
      note: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      stat_number: row.stat_number,
      stat_text: row.stat_text,
      description: row.description,
      note: row.note,
      creation_date: row.creation_date?.split("T")[0],
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/deleteupcomming_statistics_achievements/${id}`, {
        headers: { apikey: "12345" },
      });
      setEventsslide(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusupcomming_statistics_achievements/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      setEventsslide(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: res.data.status } : item
        )
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_statistics_achievements`, {
        headers: { apikey: "12345" }
      })
      .then(res => setEventsslide(res.data))
      .catch(err => console.error("Error fetching data", err));
  }, [BASE_URL]);

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Upcoming Statistics Achievements</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add Upcoming Statistics Achievement"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Bageshwer Dham</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label>Stat Number</label>
                  <input type="text" name="stat_number" className="form-control" value={formData.stat_number} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label>Stat Text</label>
                  <input type="text" name="stat_text" className="form-control" value={formData.stat_text} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label>Description</label>
                  <input type="text" name="description" className="form-control" value={formData.description} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label>Note</label>
                  <input type="text" name="note" className="form-control" value={formData.note} onChange={handleChange} />
                </div>
                <div className="col-md-3">
                  <label>Published Date</label>
                  <input type="date" name="creation_date" className="form-control" value={formData.creation_date} onChange={handleChange} />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary">Submit</button>
                <button type="button" className="btn btn-danger" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Table */}
      <div className="card">
        <div className="card-header">Bageshwer Upcoming Statistics Achievements</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Stat Number</th>
                <th>Stat Text</th>
                <th>Description</th>
                <th>Note</th>
                <th>Published Date</th>
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
                    <td>{item.stat_number}</td>
                    <td>{item.stat_text}</td>
                    <td>{item.description}</td>
                    <td>{item.note}</td>
                    <td>{item.creation_date}</td>
                    <td>{item.created_by}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${item.status === "active" ? "btn-success" : "btn-danger"}`}
                        onClick={() => toggleStatus(item.id)}
                      >
                        {item.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-info me-1" onClick={() => handleEdit(item)}>
                        <i className="fa fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-warning" onClick={() => handleDelete(item.id)}>
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="text-center">No data found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Upcoming Statistics Achievements</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label>Stat Number</label>
                      <input type="text" name="stat_number" className="form-control" value={formData.stat_number} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                      <label>Stat Text</label>
                      <input type="text" name="stat_text" className="form-control" value={formData.stat_text} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                      <label>Description</label>
                      <input type="text" name="description" className="form-control" value={formData.description} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                      <label>Note</label>
                      <input type="text" name="note" className="form-control" value={formData.note} onChange={handleChange} />
                    </div>
                    <div className="col-md-3">
                      <label>Published Date</label>
                      <input type="date" name="creation_date" className="form-control" value={formData.creation_date} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary">Update</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
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

export default UpcommingStatisticsAchievements;
