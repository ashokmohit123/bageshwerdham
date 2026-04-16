import React, { useState, useEffect } from "react";
import axios from "axios";

const BottomLandingSection = ({ BASE_URL }) => {
  // form data
  const [formData, setFormData] = useState({
    backgroundImage: "",
    heading: "",
    subheading: "",
    buttonText: "",
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Fetch all data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectbottomlandingsection`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Error fetching data", err));
  }, [BASE_URL]);

  // handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("heading", formData.heading);
      fd.append("subheading", formData.subheading);
      fd.append("buttonText", formData.buttonText);
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);
      fd.append(
        "creation_date",
        formData.creation_date || new Date().toISOString().slice(0, 10)
      );
      if (formData.backgroundImage) fd.append("backgroundImage", formData.backgroundImage);

      if (editingId) {
        // Update
        await axios.put(`${BASE_URL}/api/updatebottomlandingsection/${editingId}`, fd, {
          headers: { apikey: "12345", "Content-Type": "multipart/form-data" },
        });
        alert("✅ Updated successfully");
        setShowEditModal(false);
      } else {
        // Insert
        const res = await axios.post(`${BASE_URL}/api/insertbottomlandingsection`, fd, {
          headers: { apikey: "12345", "Content-Type": "multipart/form-data" },
        });
        alert("✅ Data saved successfully: ID " + res.data.id);
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error("❌ API Error:", err.response ? err.response.data : err.message);
      alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  // fetch data helper
  const fetchData = () => {
    axios
      .get(`${BASE_URL}/api/selectbottomlandingsection`, { headers: { apikey: "12345" } })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Error fetching data", err));
  };

  // handle edit
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      heading: row.heading,
      subheading: row.subheading,
      backgroundImage: "",
      buttonText: row.buttonText,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });
    setShowEditModal(true);
  };

  // handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/api/deletebottomlandingsection/${id}`, {
        headers: { apikey: "12345" },
      });
      if (res.data.success) {
        setEventsslide((prev) => prev.filter((event) => event.id !== id));
        alert("✅ Deleted successfully");
      }
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  // toggle status
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusbottomlandingsection/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      setEventsslide((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: res.data.status } : b))
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update status");
    }
  };

  // reset form
  const resetForm = () => {
    setFormData({
      heading: "",
      subheading: "",
      buttonText: "",
      backgroundImage: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Bottom Landing Section</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add Bottom Landing Section"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Bageshwer Dham</div>
          <div className="card-body">
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
                  <label className="form-label">Sub Heading</label>
                  <input
                    type="text"
                    name="subheading"
                    className="form-control"
                    value={formData.subheading}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    className="form-control"
                    value={formData.buttonText}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Background Image</label>
                  <input
                    type="file"
                    name="backgroundImage"
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
                  Submit
                </button>
                <button type="button" className="btn btn-danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">Bageshwer Dham List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Heading</th>
                <th>Background Image</th>
                <th>Sub Heading</th>
                <th>Button Text</th>
                <th>Created By</th>
                <th>Publish Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsslide.length > 0 ? (
                eventsslide.map((item, index) => (
                  <tr key={item.id} className={item.status === "active" ? "active-row" : "inactive-row"}>
                    <td>{index + 1}</td>
                    <td>{item.heading}</td>
                    <td>
                      <img src={`${BASE_URL}${item.backgroundImage}`} width="110" alt="thumb" />
                    </td>
                    <td>{item.subheading}</td>
                    <td>{item.buttonText}</td>
                    <td>{item.created_by}</td>
                    <td>{item.creation_date ? new Date(item.creation_date).toLocaleDateString() : "-"}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${item.status === "active" ? "btn-success" : "btn-danger"}`}
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
                  <td colSpan="9" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Bottom Landing Section</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Heading</label>
                      <input type="text" name="heading" className="form-control" value={formData.heading} onChange={handleChange} />
                    </div>
                    <div className="col">
                      <label className="form-label">Background Image</label>
                      <input type="file" name="backgroundImage" className="form-control" onChange={handleChange} />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Sub Heading</label>
                      <input type="text" name="subheading" className="form-control" value={formData.subheading} onChange={handleChange} />
                    </div>
                    <div className="col">
                      <label className="form-label">Button Text</label>
                      <input type="text" name="buttonText" className="form-control" value={formData.buttonText} onChange={handleChange} />
                    </div>
                    <div className="col">
                      <label className="form-label">Published Date</label>
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

export default BottomLandingSection;
