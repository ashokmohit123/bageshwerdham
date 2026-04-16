import React, { useState, useEffect } from "react";
import axios from "axios";

const LifeDataPillars = ({ BASE_URL }) => {
  const [showForm, setShowForm] = useState(false);
  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Corrected Form Data
  const [formData, setFormData] = useState({
    title: "",
    key_name: "",
    image_url: "",
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  // Format date for backend
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // On Input Change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Submit Handler (Insert + Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("key_name", formData.key_name);
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);
      fd.append("creation_date", formatDate(formData.creation_date));

      if (formData.image_url && typeof formData.image_url !== "string") {
        fd.append("image_url", formData.image_url);
      }

      if (editingId) {
        // UPDATE
        const response = await axios.put(
          `${BASE_URL}/api/insertlifedatapillars/${editingId}`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const updatedRow = response.data.data;

        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? updatedRow : item))
        );

        alert("Updated successfully!");
        setShowEditModal(false);

      } else {
        // INSERT
        const res = await axios.post(
          `${BASE_URL}/api/insertlifedatapillars`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setEventsslide((prev) => [
          ...prev,
          { id: res.data.id, ...formData, image_url: res.data.image_url },
        ]);

        alert("Data saved successfully!");
      }

      resetForm();
    } catch (err) {
      console.error("❌ API ERR:", err.response?.data || err.message);
      alert("Error: " + err.response?.data?.error);
    }
  };

  // Reset Form
  const resetForm = () => {
    setFormData({
      title: "",
      key_name: "",
      image_url: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  // Fetch All
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectlifedatapillars`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Fetch error:", err));
  }, [BASE_URL]);

  // Edit Handler
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      title: row.title,
      key_name: row.key_name,
      image_url: row.image_url,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });
    setShowEditModal(true);
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deletelifedatapillars/${id}`, {
        headers: { apikey: "12345" },
      });

      setEventsslide((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Status Toggle
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statuslifedatapillars/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: res.data.status } : b))
      );
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="top-banner">

      {/* PAGE HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h3>Life Data Pillars</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add New"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Update</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Key Name</label>
                  <input
                    type="text"
                    name="key_name"
                    className="form-control"
                    value={formData.key_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Image</label>
                  <input
                    type="file"
                    name="image_url"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <label>Published Date</label>
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
                <button className="btn btn-primary">Submit</button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-danger"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">List</div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Key Name</th>
                <th>Image</th>
                <th>Created By</th>
                <th>Publish Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsslide.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.title}</td>
                  <td>{item.key_name}</td>
                  <td>
                    <img
                      src={`${BASE_URL}${item.image_url}`}
                      style={{ width: "90px", height: "60px", objectFit: "cover" }}
                      alt=""
                    />
                  </td>
                  <td>{item.created_by}</td>
                  <td>{item.creation_date?.split("T")[0]}</td>

                  <td>
                    <button
                      className={`btn btn-sm ${
                        item.status === "active"
                          ? "btn-success"
                          : "btn-danger"
                      }`}
                      onClick={() => toggleStatus(item.id)}
                    >
                      {item.status}
                    </button>
                  </td>

                  <td>
                    <button
                      className="btn btn-info btn-sm me-1"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Data</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row mb-3">
                    <div className="col">
                      <label>Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label>Key Name</label>
                      <input
                        type="text"
                        name="key_name"
                        className="form-control"
                        value={formData.key_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label>Image</label>
                      <input
                        type="file"
                        name="image_url"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label>Published Date</label>
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
                    <button className="btn btn-primary">Update</button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowEditModal(false)}
                      type="button"
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

export default LifeDataPillars;
