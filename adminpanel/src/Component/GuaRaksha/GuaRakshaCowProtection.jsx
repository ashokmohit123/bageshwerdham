import React, { useState, useEffect } from "react";
import axios from "axios";

const GuaRakshaCowProtection = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    images: [""],
    title: "",
    paragraphs: [""],
    wrongNote: "",
    rightNote: "",
    alert: "",
    cta: "",
    bottomText: "",
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

  const handleParagraphChange = (index, value) => {
    const newParas = [...formData.paragraphs];
    newParas[index] = value;
    setFormData((prev) => ({ ...prev, paragraphs: newParas }));
  };

  const addParagraph = () => {
    setFormData((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ""] }));
  };

  const removeParagraph = (index) => {
    const newParas = formData.paragraphs.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, paragraphs: newParas }));
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
    fd.append("paragraphs", JSON.stringify(formData.paragraphs));
    fd.append("wrongNote", formData.wrongNote);
    fd.append("rightNote", formData.rightNote);
    fd.append("alert", formData.alert);
    fd.append("cta", formData.cta);
    fd.append("bottomText", formData.bottomText);
    fd.append("creation_date", formData.creation_date);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);

    try {
      let res;
      const apiKey = "12345";

      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updateguaraksha_cowprotection/${editingId}`,
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
          `${BASE_URL}/api/insertguaraksha_cowprotection`,
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
      paragraphs: [""],
      wrongNote: "",
      rightNote: "",
      alert: "",
      cta: "",
      bottomText: "",
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
      .get(`${BASE_URL}/api/selectguaraksha_cowprotection`, {
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
      paragraphs:
        typeof row.paragraphs === "string"
          ? JSON.parse(row.paragraphs)
          : row.paragraphs || [""],

      wrongNote: row.wrongNote,
      rightNote: row.rightNote,
      alert: row.alert,
      cta: row.cta,
      bottomText: row.bottomText,
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
        `${BASE_URL}/api/deleteguaraksha_cowprotection/${id}`,
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
        `${BASE_URL}/api/statusguaraksha_cowprotection/${id}/status`,
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
        <h3>Gau Raksha Cow Protection</h3>
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

                <div className="col">
                  <label>Wrong Note</label>
                  <input
                    type="text"
                    name="wrongNote"
                    className="form-control"
                    value={formData.wrongNote}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* PARAGRAPHS */}
              <div className="row mb-3">
                <div className="col-md-5">
                  <label>Paragraphs</label>

                  {formData.paragraphs.map((para, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <textarea
                        value={para}
                        rows={2}
                        className="form-control"
                        onChange={(e) =>
                          handleParagraphChange(index, e.target.value)
                        }
                      />
                      {formData.paragraphs.length > 1 && (
                        <button
                          className="btn btn-danger"
                          type="button"
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

                <div className="col">
                  <label>Right Note</label>
                  <input
                    type="text"
                    name="rightNote"
                    value={formData.rightNote}
                    onChange={handleChange}
                    className="form-control"
                  />
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

                <div className="col">
                  <label>Bottom Text</label>
                  <input
                    type="text"
                    name="bottomText"
                    value={formData.bottomText}
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
        <div className="card-header">Cow Protection</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Images</th>
                <th>Title</th>
                <th>Paragraphs</th>
                <th>Wrong Note</th>
                <th>Right Note</th>
                <th>Alert</th>
                <th>Cta</th>
                <th>Bottom Text</th>
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
                      {Array.isArray(item.paragraphs)
                        ? item.paragraphs.join(" | ")
                        : item.paragraphs}
                    </td>

                    <td>{item.wrongNote}</td>
                    <td>{item.rightNote}</td>
                    <td>{item.alert}</td>
                    <td>{item.cta}</td>
                    <td>{item.bottomText}</td>

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
                <h5>Edit Cow Protection</h5>
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

                    <div className="col">
                      <label>Wrong Note</label>
                      <input
                        type="text"
                        name="wrongNote"
                        value={formData.wrongNote}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Paragraphs */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Paragraphs</label>

                      {formData.paragraphs.map((para, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <textarea
                            rows={2}
                            value={para}
                            className="form-control"
                            onChange={(e) =>
                              handleParagraphChange(index, e.target.value)
                            }
                          />
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

                    <div className="col">
                      <label>Bottom Text</label>
                      <input
                        type="text"
                        name="bottomText"
                        value={formData.bottomText}
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

export default GuaRakshaCowProtection;
