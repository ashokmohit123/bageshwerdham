import React, { useState, useEffect } from "react";
import axios from "axios";

const CancerHospitalResearchData = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    video_url: "",
    paragraphs: [""], // ✅ Always an array
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false); // ✅ Separate state for form toggle

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // ✅ Handle paragraph input changes
  const handleParagraphChange = (index, value) => {
    const newParas = [...formData.paragraphs];
    newParas[index] = value;
    setFormData((prev) => ({ ...prev, paragraphs: newParas }));
  };

  // ✅ Add a new paragraph field
  const addParagraph = () => {
    setFormData((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ""] }));
  };

  // ✅ Remove a paragraph field
  const removeParagraph = (index) => {
    const newParas = formData.paragraphs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, paragraphs: newParas }));
  };

  // ✅ Submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("subtitle", formData.subtitle);
    fd.append("video_url", formData.video_url);
    fd.append("paragraphs", JSON.stringify(formData.paragraphs)); // ✅ Send as JSON string
    fd.append("status", formData.status);
    fd.append("created_by", formData.created_by);
    fd.append("creation_date", formData.creation_date);

    try {
      const apiKey = "12345";
      let res;

      if (editingId) {
        // Update
        res = await axios.put(
          `${BASE_URL}/api/updatecancerhospital_researchdata/${editingId}`,
          fd,
          { headers: { apikey: apiKey } }
        );

        if (res.data) {
          setEventsslide((prev) =>
            prev.map((item) => (item.id === editingId ? res.data : item))
          );
          alert("✅ Updated successfully");
          setShowEditModal(false);
        }
      } else {
        // Create
        res = await axios.post(
          `${BASE_URL}/api/insertcancerhospital_researchdata`,
          fd,
          { headers: { apikey: apiKey } }
        );

        if (res.data) {
          setEventsslide((prev) => [...prev, res.data]);
          alert("✅ Data saved successfully: ID " + res.data.id);
        }
      }

      resetForm();
    } catch (err) {
      console.error("❌ API Error:", err);
      alert("❌ Error: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      video_url: "",
      paragraphs: [""], // ✅ Reset array
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // ✅ Fetch data on mount
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectcancerhospital_researchdata`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Error fetching data", err));
  }, [BASE_URL]);

  // ✅ Edit handler
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      title: row.title,
      subtitle: row.subtitle,
      video_url: row.video_url,
      paragraphs: Array.isArray(row.paragraphs)
        ? row.paragraphs
        : typeof row.paragraphs === "string"
        ? JSON.parse(row.paragraphs || "[]")
        : [""],
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });
    setShowEditModal(true);
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/deletecancerhospital_researchdata/${id}`, {
        headers: { apikey: "12345" },
      });
      setEventsslide((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("❌ Error deleting record");
    }
  };

  // ✅ Toggle status
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statuscancerhospital_researchdata/${id}/status`,
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

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Cancer Hospital Research Data</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <i className="fa fa-plus"></i>{" "}
          {showForm ? "Close Form" : "Add Cancer Hospital Research Data"}
        </button>
      </div>

      {/* ✅ Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Edit Research Data</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col">
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
                <div className="col">
                  <label className="form-label">Sub Title</label>
                  <input
                    type="text"
                    name="subtitle"
                    className="form-control"
                    value={formData.subtitle}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Video URL</label>
                  <input
                    type="text"
                    name="video_url"
                    className="form-control"
                    value={formData.video_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* ✅ Paragraph Fields */}
              <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Paragraphs</label>
                {formData.paragraphs.map((para, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <textarea
                      value={para}
                      onChange={(e) =>
                        handleParagraphChange(index, e.target.value)
                      }
                      className="form-control"
                      placeholder={`Paragraph ${index + 1}`}
                      rows="2"
                    ></textarea>
                    {formData.paragraphs.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeParagraph(index)}
                      >
                        ✖
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={addParagraph}
                >
                  ➕ Add Paragraph
                </button>
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

      {/* ✅ Table */}
      <div className="card">
        <div className="card-header">Cancer Hospital Research List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Sub Title</th>
                <th>Video URL</th>
                <th>Paragraphs</th>
                <th>Publish Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {eventsslide.length > 0 ? (
                eventsslide.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.subtitle}</td>
                    <td>{item.video_url}</td>
                    <td>
                      {Array.isArray(item.paragraphs)
                        ? item.paragraphs.join(" | ")
                        : item.paragraphs}
                    </td>
                    <td>
                      {item.creation_date
                        ? new Date(item.creation_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>{item.created_by}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${
                          item.status === "active"
                            ? "btn-success"
                            : "btn-danger"
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
                <h5 className="modal-title">Edit Cancer Hospital</h5>
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
                      <label className="form-label">Sub Title</label>
                      <input
                        type="text"
                        name="subtitle"
                        className="form-control"
                        value={formData.subtitle}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                  <label className="form-label">Video URL</label>
                  <input
                    type="text"
                    name="video_url"
                    className="form-control"
                    value={formData.video_url}
                    onChange={handleChange}
                  />
                </div>
                  </div>

                  {/* ✅ Paragraph Fields */}
                  <div className="row mb-3">
                  <div className="col-md-7">
                    <label className="form-label">Paragraphs</label>
                    {formData.paragraphs.map((para, index) => (
                      <div key={index} className="d-flex gap-2 mb-2">
                        <textarea
                          value={para}
                          onChange={(e) =>
                            handleParagraphChange(index, e.target.value)
                          }
                          className="form-control"
                          rows="2"
                        ></textarea>
                        {formData.paragraphs.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            onClick={() => removeParagraph(index)}
                          >
                            ✖
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={addParagraph}
                    >
                      ➕ Add Paragraph
                    </button>
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

export default CancerHospitalResearchData;
