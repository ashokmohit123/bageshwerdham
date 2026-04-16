import React, { useState, useEffect } from "react";
import axios from "axios";

const VisitDhamPlanRoute = ({ BASE_URL }) => {

  const [formData, setFormData] = useState({
    title: "",
    image: "",
    subtitle1: "",
    subtitle2: "",
    airport:"",
    distanceInfo: [
      { distance: "", time: ""}
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

  const handleDistanceRouteChange = (index, field, value) => {
    const updated = [...formData.distanceInfo];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, distanceInfo: updated }));
  };

  const addDistanceRoute = () => {
    setFormData((prev) => ({
      ...prev,
      distanceInfo: [
        ...prev.distanceInfo,
        { icon: "", emoji: "", title: "", description: "" }
      ]
    }));
  };

  const removeDistanceRoute = (index) => {
    const updated = formData.distanceInfo.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, distanceInfo: updated }));
  };

  // ========================================================
  // SIMPLE INPUT CHANGE HANDLER
  // ========================================================

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      setFormData((prev) => ({ ...prev, image: files[0] }));
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
    fd.append("title", formData.title);
    fd.append("subtitle1", formData.subtitle1);
    fd.append("subtitle2", formData.subtitle2);
     fd.append("airport", formData.airport);

    fd.append("distanceInfo", JSON.stringify(formData.distanceInfo));

    fd.append("creation_date", formData.creation_date);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);

    if (formData.image && typeof formData.image !== "string") {
      fd.append("image", formData.image);
    }

    try {
      const apiKey = "12345";
      let res;

      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updatevisitdham_planroute/${editingId}`,
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
          `${BASE_URL}/api/insertvisitdham_planroute`,
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
      title: "",
      subtitle1: "",
      image: "",
      subtitle2: "",
      airport:"",
      distanceInfo: [
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
      .get(`${BASE_URL}/api/selectvisitdham_planroute`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.log(err));
  }, [BASE_URL]);

  // EDIT
  const handleEdit = (row) => {
    setEditingId(row.id);

    setFormData({
      title: row.title,
      subtitle1: row.subtitle1,
      image: row.image,
      subtitle2: row.subtitle2,
       airport: row.airport,
      distanceInfo:
        typeof row.distanceInfo === "string"
          ? JSON.parse(row.distanceInfo)
          : row.distanceInfo || [
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
      await axios.delete(`${BASE_URL}/api/deletevisitdham_planroute/${id}`, {
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
        `${BASE_URL}/api/statusvisitdham_planroute/${id}/status`,
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
        <h3>Visit Dham Plan Route</h3>

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
                  <label>Subtitle 1</label>
                  <input
                    type="text"
                    name="subtitle1"
                    className="form-control"
                    value={formData.subtitle1}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label>Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Subtitle 2</label>
                  <input
                    type="text"
                    name="subtitle2"
                    className="form-control"
                    value={formData.subtitle2}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Airport</label>
                  <input
                    type="text"
                    name="airport"
                    className="form-control"
                    value={formData.airport}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* =========== Staions FORM =========== */}
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="fw-bold">Distance Info</label>

                  {formData.distanceInfo.map((mode, index) => (
                    <div key={index} className="border rounded p-3 mb-3 bg-light">

                      <div className="row g-2">

                        <div className="col-md-2">
                          <label>Distance</label>
                          <input
                            type="text"
                            className="form-control"
                            value={mode.distance}
                            onChange={(e) =>
                              handleDistanceRouteChange(index, "distance", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label>Time</label>
                          <input
                            type="text"
                            className="form-control"
                            value={mode.time}
                            onChange={(e) =>
                              handleDistanceRouteChange(index, "time", e.target.value)
                            }
                          />
                        </div>

                        <div className="col-md-3 d-flex align-items-end">
                          {formData.distanceInfo.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger w-100"
                              onClick={() => removeDistanceRoute(index)}
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
                    onClick={addDistanceRoute}
                  >
                    ➕ Add DistanceRoute
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
        <div className="card-header">Visit Dham Plane Route List</div>
        <div className="card-body">

          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                 <th>Image</th>
                <th>Title</th>
                <th>Subtitle 1</th>
                <th>Subtitle 2</th>
                <th>Airport</th>
                <th>distanceInfo</th>
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
                     <td>
                      <img
                        src={`${BASE_URL}${item.image}`}
                        style={{ width: "90px", height: "70px" }}
                        alt="banner"
                      />
                    </td>
                    <td>{item.title}</td>
                    <td>{item.subtitle1}</td>
                    <td>{item.subtitle2}</td>
                    <td>{item.airport}</td>
                    <td>
                      {Array.isArray(item.distanceInfo)
                        ? item.distanceInfo
                            .map((t) => `${t.distance} ${t.time}`)
                            .join(" | ")
                        : ""}
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
                <h5>Edit Plane Route Dham</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">

                <form onSubmit={handleSubmit}>
                  
                  <div className="row mb-3">
                      <div className="col-md-3">
                      <label>Image</label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleChange}
                      />
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
                      <label>Subtitle 1</label>
                      <input
                        type="text"
                        name="subtitle1"
                        className="form-control"
                        value={formData.subtitle1}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label>Subtitle 2</label>
                      <input
                        type="text"
                        name="subtitle2"
                        className="form-control"
                        value={formData.subtitle2}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                  <label>Airport</label>
                  <input
                    type="text"
                    name="airport"
                    className="form-control"
                    value={formData.airport}
                    onChange={handleChange}
                  />
                </div>
                  
                  </div>

                  {/* EDIT TRAVEL MODES */}
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label className="fw-bold">Distance Info</label>

                      {formData.distanceInfo.map((mode, index) => (
                        <div key={index} className="border rounded p-3 mb-3">

                          <div className="row g-2">

                            <div className="col-md-2">
                              <label>Distance</label>
                              <input
                                type="text"
                                className="form-control"
                                value={mode.distance}
                                onChange={(e) =>
                                  handleDistanceRouteChange(index, "distance", e.target.value)
                                }
                              />
                            </div>

                            <div className="col-md-4">
                              <label>Time</label>
                              <input
                                type="text"
                                className="form-control"
                                value={mode.time}
                                onChange={(e) =>
                                  handleDistanceRouteChange(index, "time", e.target.value)
                                }
                              />
                            </div>

                            <div className="col-md-3 d-flex align-items-end">
                              {formData.distanceInfo.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger w-100"
                                  onClick={() => removeDistanceRoute(index)}
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
                        onClick={addDistanceRoute}
                      >
                        ➕ Add PlaneRoute
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

export default VisitDhamPlanRoute;
