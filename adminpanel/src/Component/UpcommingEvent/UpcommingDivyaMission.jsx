import React, { useState, useEffect } from "react";
import axios from "axios";

const UpcommingDivyaMission = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    icon: "",
    text: "",
    color_class: "",
    status: "active",
    creation_date: "",
    created_by: "admin",
  });

  const [records, setRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // modal state

  // ✅ Fetch existing records
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_divyamission`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setRecords(res.data))
      .catch((err) =>
        console.error("❌ Error fetching Divya Mission data:", err)
      );
  }, [BASE_URL]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      icon: "",
      text: "",
      color_class: "",
      status: "active",
      creation_date: "",
      created_by: "admin",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ✅ Submit (Insert / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/api/updateupcomming_divyamission/${editingId}`,
          formData,
          {
            headers: { apikey: "12345" },
          }
        );
        setRecords((prev) =>
          prev.map((r) => (r.id === editingId ? res.data.record : r))
        );
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/insertupcomming_divyamission`,
          formData,
          {
            headers: { apikey: "12345" },
          }
        );
        setRecords((prev) => [...prev, res.data.record]);
      }
      alert("✅ Data saved successfully: ID ");
      resetForm();
    } catch (err) {
      console.error("❌ Submit error:", err.response || err.message);
      alert("❌ Failed to save data");
    }
  };

  // ✅ Edit handler
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      icon: row.icon,
      text: row.text,
      color_class: row.color_class,
      status: row.status,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by || "admin",
    });
    setShowForm(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      await axios.delete(
        `${BASE_URL}/api/deleteupcomming_divyamission/${id}`,
        {
          headers: { apikey: "12345" },
        }
      );
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("❌ Failed to delete");
    }
  };

  // ✅ Toggle status
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusupcomming_divyamission/${id}/status`,
        {},
        {
          headers: { apikey: "12345" },
        }
      );
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: res.data.status } : r
        )
      );
    } catch (err) {
      console.error("❌ Status Toggle Error:", err);
      alert("❌ Failed to toggle status");
    }
  };
  return (
    <div className="top-banner">
       <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Upcoming Divya Mission</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add New"}
        </button>
      </div>

      {/* ✅ Form Section */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">
            {editingId ? "Edit" : "Add"} Divya Mission
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Icon</label>
                  <input
                    type="text"
                    name="icon"
                    className="form-control"
                    value={formData.icon}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Text</label>
                  <input
                    type="text"
                    name="text"
                    className="form-control"
                    value={formData.text}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Color Class</label>
                  <input
                    type="text"
                    name="color_class"
                    className="form-control"
                    value={formData.color_class}
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
                  {editingId ? "Update" : "Submit"}
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

      {/* ✅ Table Section */}
      <div className="card">
        <div className="card-header">All Divya Missions</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Icon</th>
                <th>Text</th>
                <th>Color Class</th>
                <th>Published Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.icon}</td>
                    <td>{item.text}</td>
                    <td>{item.color_class}</td>
                    <td>{item.creation_date?.split("T")[0]}</td>
                    <td>{item.created_by}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          item.status === "active"
                            ? "btn-success"
                            : "btn-secondary"
                        }`}
                        onClick={() => toggleStatus(item.id)}
                      >
                        {item.status}
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
                  <td colSpan="8" className="text-center">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* ✅ Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Upcomming Divya Mission</h5>
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
                      <label className="form-label">Text</label>
                      <input
                        type="text"
                        name="text"
                        className="form-control"
                        value={formData.text}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3">
                      <label className="form-label">Color Class</label>
                      <input
                        type="text"
                        name="color_class"
                        className="form-control"
                        value={formData.color_class}
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

export default UpcommingDivyaMission;
