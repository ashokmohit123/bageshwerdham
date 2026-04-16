import React, { useState, useEffect } from "react";
import axios from "axios";

const ContactUs = ({ BASE_URL }) => {

  const [formData, setFormData] = useState({
    description: "",
    banner_image: "",
    address: "",
    email1: "",
    email2:"",
    phone1:"",
    phone2:"",
    website:"",
    social_icons: [
      { icon: "", link: ""}
    ],
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // ========================================================
  // TRAVEL MODES HANDLERS
  // ========================================================

  const handleSocialIconsChange = (index, field, value) => {
    const updated = [...formData.social_icons];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, social_icons: updated }));
  };

  const addSocialIcons = () => {
    setFormData((prev) => ({
      ...prev,
      social_icons: [
        ...prev.social_icons,
        { icon: "", emoji: "", title: "", description: "" }
      ]
    }));
  };

  const removeSocialIcons = (index) => {
    const updated = formData.social_icons.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, social_icons: updated }));
  };

  // ========================================================
  // SIMPLE INPUT CHANGE HANDLER
  // ========================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "banner_image") {
      setFormData((prev) => ({ ...prev, banner_image: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ========================================================
  // SUBMIT FORM
  // ========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("description", formData.description);
    fd.append("address", formData.address);
    fd.append("email1", formData.email1);
     fd.append("email2", formData.email2);
     fd.append("phone1", formData.phone1);
     fd.append("phone2", formData.phone2);
     fd.append("website", formData.website);

    fd.append("social_icons", JSON.stringify(formData.social_icons));

    fd.append("creation_date", formData.creation_date);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);

    if (formData.banner_image && typeof formData.banner_image !== "string") {
      fd.append("banner_image", formData.banner_image);
    }

    try {
      const apiKey = "12345";
      let res;

      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updatecontact_us/${editingId}`,
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
          `${BASE_URL}/api/insertcontact_us`,
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

  // RESET
  const resetForm = () => {
    setFormData({
      description: "",
      address: "",
      email1:"",
      email2:"",
      phone1:"",
      phone2:"",
      website:"",
      banner_image: "",
      social_icons: [
         { name: "", distance: "", time: ""}
      ],
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
      .get(`${BASE_URL}/api/selectcontact_us`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.log(err));
  }, [BASE_URL]);

  // EDIT
  const handleEdit = (row) => {
    setEditingId(row.id);

    setFormData({
      description: row.description,
      address: row.address,
      banner_image: row.banner_image,
      email1: row.email1,
      email2: row.email2,
      phone1: row.phone1,
      phone2: row.phone2,
      website: row.website,
      social_icons:
        typeof row.social_icons === "string"
          ? JSON.parse(row.social_icons)
          : row.social_icons || [
              { icon: "", emoji: "", title: "", description: "" }
            ],
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });

    setShowEditModal(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deletecontact_us/${id}`, {
        headers: { apikey: "12345" },
      });

      setEventsslide((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // STATUS
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statuscontact_us/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: res.data.status } : p
        )
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // ========================================================
  // UI STARTS
  // ========================================================

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between mb-3">
        <h3>Contact Us</h3>

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
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label>banner_image</label>
                  <input
                    type="file"
                    name="banner_image"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Email 1</label>
                  <input
                    type="text"
                    name="email1"
                    className="form-control"
                    value={formData.email1}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Email 2</label>
                  <input
                    type="text"
                    name="email2"
                    className="form-control"
                    value={formData.email2}
                    onChange={handleChange}
                  />
                </div>
              </div>
               <div className="row mb-3">
                 <div className="col">
                  <label>Phone 1</label>
                  <input
                    type="text"
                    name="phone1"
                    className="form-control"
                    value={formData.phone1}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Phone 2</label>
                  <input
                    type="text"
                    name="phone2"
                    className="form-control"
                    value={formData.phone2}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Website</label>
                  <input
                    type="text"
                    name="website"
                    className="form-control"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
               </div>

              {/* =========== Staions FORM =========== */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="fw-bold">Social Icon</label>

                  {formData.social_icons.map((mode, index) => (
                    <div key={index} className="border rounded p-3 mb-3 bg-light">

                      <div className="row g-2">

                        <div className="col-md-2">
                          <label>Icon</label>
                          <input
                            type="text"
                            className="form-control"
                            value={mode.icon}
                            onChange={(e) =>
                              handleSocialIconsChange(index, "icon", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label>Link</label>
                          <input
                            type="text"
                            className="form-control"
                            value={mode.link}
                            onChange={(e) =>
                              handleSocialIconsChange(index, "link", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-3 d-flex align-items-end">
                          {formData.social_icons.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger w-100"
                              onClick={() => removeSocialIcons(index)}
                            >
                              Remove
                            </button>
                          )}
                        </div>

                      </div>

                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addSocialIcons}
                  >
                    ➕ Add SocialIcons
                  </button>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <label>Publish Date</label>
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
                <button className="btn btn-primary" type="submit">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button className="btn btn-danger" type="button" onClick={resetForm}>
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">Visit Dham Contact Us List</div>
        <div className="card-body">

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                
                <th>Description</th>
                <th>Address</th>
                <th>Email1</th>
                <th>Email2</th>
                <th>Phone1</th>
                <th>Phone2</th>
                <th>Website</th>
                <th>social_icons</th>
                 <th>Banner Image</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {eventsslide.length ? (
                eventsslide.map((item, i) => (
                  <tr key={item.id}>
                    <td>{i + 1}</td>
                    
                    <td>{item.description}</td>
                    <td>{item.address}</td>
                    <td>{item.email1}</td>
                    <td>{item.email2}</td>
                    <td>{item.phone1}</td>
                    <td>{item.phone2}</td>
                    <td>{item.website}</td>
                    <td>
                      {Array.isArray(item.social_icons)
                        ? item.social_icons
                            .map((t) => `${t.icon} ${t.link}`)
                            .join(" | ")
                        : ""}
                    </td>
                     <td>
                      <img
                        src={`${BASE_URL}${item.banner_image}`}
                        style={{ width: "90px", height: "70px" }}
                        alt="banner"
                      />
                    </td>
                    <td>{new Date(item.creation_date).toLocaleDateString()}</td>

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
                  <td colSpan="12" className="text-center">
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
                <h5>Edit Contact Us Dham</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">

                <form onSubmit={handleSubmit}>
                  
                  <div className="row mb-3">
                      <div className="col-md-3">
                      <label>banner_image</label>
                      <input
                        type="file"
                        name="banner_image"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <label>Description</label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label>Address</label>
                      <input
                        type="text"
                        name="address"
                        className="form-control"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label>Email 1</label>
                      <input
                        type="text"
                        name="email1"
                        className="form-control"
                        value={formData.email1}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                     <div className="col">
                  <label>Email 2</label>
                  <input
                    type="text"
                    name="email2"
                    className="form-control"
                    value={formData.email2}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>Phone 1</label>
                  <input
                    type="text"
                    name="phone1"
                    className="form-control"
                    value={formData.phone1}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>Phone 2</label>
                  <input
                    type="text"
                    name="phone2"
                    className="form-control"
                    value={formData.phone2}
                    onChange={handleChange}
                  />
                </div>
                <div className="col">
                  <label>Website</label>
                  <input
                    type="text"
                    name="website"
                    className="form-control"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
                  </div>

                  {/* EDIT TRAVEL MODES */}
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label className="fw-bold">Social Icon</label>

                      {formData.social_icons.map((mode, index) => (
                        <div key={index} className="border rounded p-3 mb-3">

                          <div className="row g-2">

                            <div className="col-md-2">
                              <label>Icon</label>
                              <input
                                type="text"
                                className="form-control"
                                value={mode.icon}
                                onChange={(e) =>
                                  handleSocialIconsChange(index, "icon", e.target.value)
                                }
                              />
                            </div>

                            <div className="col-md-4">
                              <label>Link</label>
                              <input
                                type="text"
                                className="form-control"
                                value={mode.link}
                                onChange={(e) =>
                                  handleSocialIconsChange(index, "link", e.target.value)
                                }
                              />
                            </div>

                            <div className="col-md-3 d-flex align-items-end">
                              {formData.social_icons.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger w-100"
                                  onClick={() => removeSocialIcons(index)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                          </div>

                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addSocialIcons}
                      >
                        ➕ Add SocialIcon
                      </button>
                    </div>

                     <div className="col-md-3">
                  <label>Publish Date</label>
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
                    <button className="btn btn-primary" type="submit">Update</button>
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

export default ContactUs;
