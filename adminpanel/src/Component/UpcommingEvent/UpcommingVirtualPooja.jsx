import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const UpcommingVirtualPooja = ({ BASE_URL }) => {
   const [formData, setFormData] = useState({
    name: "",
    button_img: null,
    gif: null,
    audio: null,
    div_id: "",
    description: "",
    status: "active",
    creation_date: "",
    created_by: "admin",
  });
  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
   const [showEditModal, setShowEditModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/selectupcomming_virtualpooja`,
        { headers: { apikey: "12345" } }
      );
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
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("div_id", formData.div_id);
      fd.append("description", formData.description);
      fd.append("status", formData.status);
      fd.append("created_by", formData.created_by);
      fd.append("creation_date", formData.creation_date);

      if (formData.button_img) fd.append("button_img", formData.button_img);
      if (formData.gif) fd.append("gif", formData.gif);
      if (formData.audio) fd.append("audio", formData.audio);

      let res;
      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updateupcomming_virtualpooja/${editingId}`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        res = await axios.post(
          `${BASE_URL}/api/insertupcomming_virtualpooja`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      const record = res.data.record;
      if (editingId) {
        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? record : item))
        );
        alert("✅ Updated successfully");
      } else {
        setEventsslide((prev) => [...prev, record]);
        alert("✅ Inserted successfully: ID " + record.id);
      }

      setFormData({
        name: "",
        button_img: null,
        gif: null,
        audio: null,
        div_id: "",
        description: "",
        status: "active",
        creation_date: "",
        created_by: "admin",
      });
     resetForm();
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("❌ API Error:", err.response ? err.response.data : err.message);
      alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

const resetForm = () => {
    setFormData({
      name: "",
      button_img: "",
      gif: "",
      audio: "",
      div_id: "",
      description: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };


  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      name: row.name,
      button_img: null,
      gif: null,
      audio: null,
      div_id: row.div_id,
      description: row.description,
      status: row.status,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by || "admin",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this?")) return;
    try {
      const res = await axios.delete(
        `${BASE_URL}/api/deleteupcomming_virtualpooja/${id}`,
        { headers: { apikey: "12345" } }
      );
      if (res.data.success) {
        setEventsslide((prev) => prev.filter((item) => item.id !== id));
        alert("✅ Deleted");
      }
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("❌ Delete failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusupcomming_virtualpooja/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      if (res.data.success) {
        const newStatus = res.data.status;
        setEventsslide((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error("❌ Status Error:", err);
    }
  };


  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h3>Upcoming Virtual Pooja</h3>
        <button className="btn btn-success btn-sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Close Form" : "Add Virtual Pooja"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Virtual Pooja Form</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row">
                <div className="col-md-3">
                  <label>Name</label>
                  <input
                    name="name"
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label>Button Image</label>
                  <input
                    name="button_img"
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label>GIF</label>
                  <input
                    name="gif"
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label>Audio</label>
                  <input
                    name="audio"
                    type="file"
                    accept="audio/*"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-3">
                  <label>Div Id</label>
                  <input
                    name="div_id"
                    type="text"
                    className="form-control"
                    value={formData.div_id}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-5">
                  <label>Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <div className="col-md-4">
                  <label>Publish Date</label>
                  <input
                    name="creation_date"
                    type="date"
                    className="form-control"
                    value={formData.creation_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mt-3 text-end">
                <button type="submit" className="btn btn-primary me-2">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">Virtual Pooja List</div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Button Image</th>
                <th>GIF</th>
                <th>Audio</th>
                <th>Div Id</th>
                <th>Description</th>
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
                    <td>{item.name}</td>
                    <td>
                      {item.button_img && <img src={`${BASE_URL}${item.button_img}`} style={{ width: "80px" }} alt="btn" />}
                    </td>
                    <td>
                      {item.gif && <img src={`${BASE_URL}${item.gif}`} style={{ width: "80px" }} alt="gif" />}
                    </td>
                    <td>
                      {item.audio && (
                        <audio controls>
                          <source src={`${BASE_URL}${item.audio}`} type="audio/mpeg" />
                          Your browser does not support audio.
                        </audio>
                      )}
                    </td>
                    <td>{item.div_id}</td>
                    <td>{item.description}</td>
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
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
   

      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Virtual Pooja</h5>
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
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3">
                      <label className="form-label">Button Image</label>
                      <input
                        type="file"
                        name="button_img"
                        accept="image/*"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3">
                      <label className="form-label">Gif</label>
                      <input
                        type="file"
                        accept="image/*"
                        name="gif"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                      <div className="col-md-3">
                    <label className="form-label">Audio</label>
                    <input
                        name="audio"
                        type="file"
                        accept="audio/*"
                        className="form-control"
                        onChange={handleChange}
                    />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Div Id</label>
                      <input
                        type="text"
                        name="div_id"
                        className="form-control"
                        value={formData.div_id}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        value={formData.description}
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

export default UpcommingVirtualPooja;
