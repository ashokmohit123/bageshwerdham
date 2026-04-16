import React, { useState, useEffect } from "react";
import axios from "axios";

const VedicGurukulEducation = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
     title: "",
    images: [""],
    sections: [""],
    alert: "",
    cta: "",
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // ========================================================
  // IMAGE HANDLERS (MISSING EARLIER) — NOW FIXED
  // ========================================================

  const handleImageChange = (index, file) => {
    const newImages = [...formData.images];

    // Store file OR url
    newImages[index] = file;

    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  const removeImage = (index) => {
    const newImgs = formData.images.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, images: newImgs }));
  };

  // ========================================================
  // PARAGRAPH HANDLERS
  // ========================================================

  const handleSectionsChange = (index, value) => {
    const newParas = [...formData.sections];
    newParas[index] = value;
    setFormData((prev) => ({ ...prev, sections: newParas }));
  };

  const addSections = () => {
    setFormData((prev) => ({ ...prev, sections: [...prev.sections, ""] }));
  };

  const removeSections = (index) => {
    const newParas = formData.sections.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, sections: newParas }));
  };

  // ========================================================
  // SIMPLE INPUT CHANGE HANDLER
  // ========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ========================================================
  // SUBMIT FORM
  // ========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    // Convert image File[] → JSON string of filenames
    formData.images.forEach((imgFile) => {
    if (imgFile) {
      fd.append("images", imgFile);
    }
  });

    fd.append("title", formData.title);
    fd.append("sections", JSON.stringify(formData.sections));
    fd.append("alert", formData.alert);
    fd.append("cta", formData.cta);
    fd.append("creation_date", formData.creation_date);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);

    try {
      let res;
      const apiKey = "12345";

      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updatevedicgurukul_education/${editingId}`,
          fd,
          { headers: { apikey: apiKey } }
        );

        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? res.data : item))
        );

        alert("Updated Successfully");
        setShowEditModal(false);
      } else {
        res = await axios.post(
          `${BASE_URL}/api/insertvedicgurukul_education`,
          fd,
          { headers: { apikey: apiKey } }
        );

        setEventsslide((prev) => [...prev, res.data]);
        alert("Saved Successfully");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      images: [""],
      title: "",
      sections: [""],
      alert: "",
      cta: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // FETCH DATA
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvedicgurukul_education`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.log(err));
  }, [BASE_URL]);

  // LOAD DATA IN EDIT FORM
  const handleEdit = (row) => {
    setEditingId(row.id);

    setFormData({
      images:
        typeof row.images === "string"
          ? JSON.parse(row.images)
          : row.images || [""],

      title: row.title,
      sections:
        typeof row.sections === "string"
          ? JSON.parse(row.sections)
          : row.sections || [""],

      alert: row.alert,
      cta: row.cta,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });

    setShowEditModal(true);
  };

  // DELETE RECORD
  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/deletevedicgurukul_education/${id}`,
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // TOGGLE STATUS
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusvedicgurukul_education/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: res.data.status } : p))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // ========================================================
  // UI STARTS HERE
  // ========================================================

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between mb-3">
        <h3>Vedic Gurukul Education</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Form" : "Add Data"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Edit Data</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col">
                  <label>Images</label>
                  {formData.images.map((img, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(index, e.target.files[0])
                        }
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => removeImage(index)}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className="btn btn-secondary btn-sm"
                    type="button"
                    onClick={addImage}
                  >
                    ➕ Add Image
                  </button>
                </div>

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

              
              </div>

              {/* Sections */}
              <div className="row mb-3">
                <div className="col-md-5">
                  <label>Sections</label>

                  {formData.sections.map((para, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <textarea
                        value={para}
                        rows={2}
                        className="form-control"
                        onChange={(e) =>
                          handleSectionsChange(index, e.target.value)
                        }
                      />
                      {formData.sections.length > 1 && (
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => removeSections(index)}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addSections}
                  >
                    ➕ Add sections
                  </button>
                </div>

               

                <div className="col">
                  <label>Alert</label>
                  <input
                    type="text"
                    name="alert"
                    className="form-control"
                    value={formData.alert}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label>Cta</label>
                  <input
                    type="text"
                    name="cta"
                    value={formData.cta}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

              

                <div className="col-md-3">
                  <label>Published Date</label>
                  <input
                    type="date"
                    name="creation_date"
                    value={formData.creation_date}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-primary" type="submit">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button className="btn btn-danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">Vedic Gurukul Education</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Images</th>
                <th>Title</th>
                <th>Sections</th>
              
                <th>Alert</th>
                <th>Cta</th>
              
                <th>Publish Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {eventsslide.length ? (
                eventsslide.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                   <td>
                {Array.isArray(item.images)
                    ? item.images.map((img, i) => <img key={i} src={`${BASE_URL}/uploads/${img}`} width="60" alt={`img-${i}`} />)
                    : <img src={`${BASE_URL}/uploads/${item.images}`} width="60" alt={`img-${item.id}`} />}
                </td>

                    <td>{item.title}</td>

                    <td>
                      {Array.isArray(item.sections)
                        ? item.sections.join(" | ")
                        : item.sections}
                    </td>

                  
                    <td>{item.alert}</td>
                    <td>{item.cta}</td>
                   

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
                        className="btn btn-info btn-sm me-1"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Vedic Gurukul Education</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* Images */}
                  <div className="row mb-3">
                    <div className="col">
                      <label>Images</label>

                      {formData.images.map((img, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageChange(index, e.target.files[0])
                            }
                          />
                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeImage(index)}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addImage}
                      >
                        ➕ Add Image
                      </button>
                    </div>

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

                   
                  </div>

                  {/* Sections */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Sections</label>

                      {formData.sections.map((para, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <textarea
                            rows={2}
                            value={para}
                            className="form-control"
                            onChange={(e) =>
                              handleSectionsChange(index, e.target.value)
                            }
                          />
                          {formData.sections.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeSections(index)}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addSections}
                      >
                        ➕ Add Sections
                      </button>
                    </div>

                    <div className="col">
                      <label>Alert</label>
                      <input
                        type="text"
                        name="alert"
                        value={formData.alert}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col">
                      <label>Cta</label>
                      <input
                        type="text"
                        name="cta"
                        value={formData.cta}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>

                   
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-primary">Update</button>
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

export default VedicGurukulEducation;
