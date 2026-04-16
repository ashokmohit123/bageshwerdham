import React, { useState, useEffect } from "react";
import axios from "axios";

const UpcommingEvents = ({ BASE_URL }) => {

  // FORM STATE  
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    image: "",
    event_date: "",
    place: "",
    timezone: "",
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // ------------------------------
  // HANDLE INPUT CHANGES
  // ------------------------------
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ------------------------------
  // SUBMIT FORM
  // ------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("event_date", formatDate(formData.event_date));
      fd.append("place", formData.place);
      fd.append("timezone", formData.timezone);
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);
      fd.append("creation_date", formatDate(formData.creation_date));

      if (formData.image) fd.append("image", formData.image);

      let res;

      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updateupcommingevents/${editingId}`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setEventsslide((prev) =>
          prev.map((item) =>
            item.id === editingId ? res.data.record : item
          )
        );

        alert("Updated successfully");
        setShowEditModal(false);

      } else {
        res = await axios.post(
          `${BASE_URL}/api/insertupcommingevents`,
          fd,
          {
            headers: { apikey: "12345", "Content-Type": "multipart/form-data" },
          }
        );

        setEventsslide((prev) => [...prev, res.data.record]);
        alert("Data saved successfully: ID " + res.data.record.id);
      }

      resetForm();
      setShowForm(false);

    } catch (err) {
      console.error("API Error:", err.response ? err.response.data : err.message);
      alert("Error saving: " + (err.response?.data?.error || err.message));
    }
  };

  // ------------------------------
  // FETCH ALL RECORDS
  // ------------------------------
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcommingevents`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Fetch error", err));
  }, [BASE_URL]);

  // ------------------------------
  // HANDLE EDIT
  // ------------------------------
  const handleEdit = (row) => {
    setEditingId(row.id);

    setFormData({
      title: row.title,
      place: row.place,
      event_date: row.event_date?.split("T")[0],
      timezone: row.timezone,
      image: "",
      creation_date: row.creation_date?.split("T")[0],
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });

    setShowEditModal(true);
  };

  // ------------------------------
  // DELETE RECORD
  // ------------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deleteupcommingevents/${id}`, {
        headers: { apikey: "12345" },
      });

      setEventsslide((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting");
    }
  };

  // ------------------------------
  // RESET FORM
  // ------------------------------
  const resetForm = () => {
    setFormData({
      title: "",
      image: "",
      event_date: "",
      place: "",
      timezone: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });

    setEditingId(null);
  };

  // ------------------------------
  // STATUS TOGGLE
  // ------------------------------
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusupcommingevents/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: res.data.status } : item
        )
      );
    } catch (err) {
      console.error("Status error:", err);
      alert("Failed to update status");
    }
  };

  // ===========================================================
  // COMPONENT UI
  // ===========================================================

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Upcoming Events</h3>

        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add Event"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Edit Event</div>
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
                  <label>Place</label>
                  <input
                    type="text"
                    name="place"
                    className="form-control"
                    value={formData.place}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Timezone</label>
                  <select
                    name="timezone"
                    className="form-control"
                    value={formData.timezone}
                    onChange={handleChange}
                  >
                    <option value="">-- Select --</option>
                    <option value="EST">EST</option>
                    <option value="GMT">GMT</option>
                    <option value="IST">IST</option>
                    <option value="CST">CST</option>
                    <option value="PST">PST</option>
                    <option value="JST">JST</option>
                    <option value="AEST">AEST</option>
                  </select>
                </div>

                <div className="col">
                  <label>Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3">
                  <label>Event Date</label>
                  <input
                    type="date"
                    name="event_date"
                    className="form-control"
                    value={formData.event_date}
                    onChange={handleChange}
                  />
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
                <button className="btn btn-primary">Submit</button>
                <button className="btn btn-danger" onClick={resetForm}>
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">Events List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Date</th>
                <th>Place</th>
                <th>Timezone</th>
                <th>Image</th>
                <th>Publish Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {eventsslide.length > 0 ? (
                eventsslide.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.title}</td>
                    <td>{item.event_date?.split("T")[0]}</td>
                    <td>{item.place}</td>
                    <td>{item.timezone}</td>

                    <td>
                      <img
                        src={`${BASE_URL}${item.image}`}
                        width="90"
                        height="70"
                        alt="img"
                      />
                    </td>

                    <td>{item.creation_date?.split("T")[0]}</td>
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

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Event</h5>
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
                      <label>Date</label>
                      <input
                        type="date"
                        name="event_date"
                        className="form-control"
                        value={formData.event_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label>Place</label>
                      <input
                        type="text"
                        name="place"
                        className="form-control"
                        value={formData.place}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label>Image</label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
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
                    <button className="btn btn-primary">Update</button>
                    <button
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

export default UpcommingEvents;
