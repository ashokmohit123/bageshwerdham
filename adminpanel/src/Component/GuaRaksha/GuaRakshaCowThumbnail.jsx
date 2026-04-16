import React, { useState, useEffect } from "react";
import axios from "axios";

const GuaRakshaCowThumbnail = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    images: [""],
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
          `${BASE_URL}/api/updateguaraksha_cowthumbnails/${editingId}`,
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
          `${BASE_URL}/api/insertguaraksha_cowthumbnails`,
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
      .get(`${BASE_URL}/api/selectguaraksha_cowthumbnails`, {
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
        `${BASE_URL}/api/deleteguaraksha_cowthumbnails/${id}`,
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
        `${BASE_URL}/api/statusguaraksha_cowthumbnails/${id}/status`,
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
        <h3>Gau Raksha Cow Thumbnails</h3>
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

              {/* PARAGRAPHS */}
              
            

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
        <div className="card-header">Cow Protection Thumbnail</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Images</th>
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
                <h5>Edit Cow Protection Thumbnail</h5>
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
                   
                  </div>

                  {/* Paragraphs */}
                

                 
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuaRakshaCowThumbnail;
