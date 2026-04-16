import React, { useState, useEffect } from "react";
import axios from "axios";

const VedicGurukulVideoSlider = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    selectedType: "",
    videoimg: "",
    title: "",
    alt: "",
    status: "active",
    creation_date: "",
    created_by: "admin"
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ✅ Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      for (let key in formData) {
        fd.append(key, formData[key]);
      }

      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/api/updatevedicgurukul_videoslider/${editingId}`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );

        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? res.data.record : item))
        );
        alert("✅ Updated successfully");
        setShowEditModal(false);
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/insertvedicgurukul_videoslider`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );
        setEventsslide((prev) => [...prev, res.data.record]);
        alert("✅ Data saved successfully");
      }

      resetForm();
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      alert("❌ Error saving data");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      selectedType: "",
      videoimg: "",
      title: "",
      alt: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  // ✅ Edit handler
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      selectedType: row.type,
      videoimg: row.videoimg,
      title: row.title,
      alt: row.alt,
      creation_date: row.creation_date?.split("T")[0],
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });
    setShowEditModal(true);
  };

  // ✅ Delete record
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/deletevedicgurukul_videoslider/${id}`, {
        headers: { apikey: "12345" },
      });
      setEventsslide((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  // ✅ Toggle active/inactive status
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusvedicgurukul_videoslider/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      setEventsslide((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: res.data.status } : item
        )
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update status");
    }
  };

  // ✅ Fetch all data
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectvedicgurukul_videoslider`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Error fetching data", err));
  }, [BASE_URL]);

  // ✅ Helper: validate media type
  const getMediaElement = (item) => {
    if (!item.videoimg) return "No file";

    const fileUrl = `${BASE_URL}${item.videoimg}`;
    const ext = item.videoimg.split(".").pop().toLowerCase();

    if (item.type === "video" || ["mp4", "mov", "avi", "webm"].includes(ext)) {
      return (
        <video
          width="150"
          controls
          onError={(e) => (e.target.outerHTML = "<span>Video not supported</span>")}
        >
          <source src={fileUrl} type={`video/${ext}`} />
          Your browser does not support video playback.
        </video>
      );
    } else if (item.type === "image" || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <img src={fileUrl} alt={item.alt || "Image"} width="100" />;
    } else {
      return <span>Unsupported file</span>;
    }
  };

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Vedic Gurukul Video Slider</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add Media"}
        </button>
      </div>

      {/* ✅ Add Form */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Update Media</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-3">
                  <label>Select Media Type</label>
                  <select
                    className="form-select"
                    value={formData.selectedType}
                    onChange={(e) => setFormData({ ...formData, selectedType: e.target.value })}
                  >
                    <option value="">Select Type</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                <div className="col-md-3">
                  <label>Upload File</label>
                  <input
                    type="file"
                    name="videoimg"
                    className="form-control"
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label>Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label>Alt</label>
                  <input
                    type="text"
                    name="alt"
                    className="form-control"
                    value={formData.alt}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
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
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button type="button" className="btn btn-danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Table */}
      <div className="card">
        <div className="card-header">All Media</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Preview</th>
                <th>Title</th>
                <th>Alt</th>
                <th>Published Date</th>
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
                    <td>{item.type}</td>
                    <td>{getMediaElement(item)}</td>
                    <td>{item.title}</td>
                    <td>{item.alt}</td>
                    <td>{item.creation_date}</td>
                    <td>{item.created_by}</td>
                    <td>
                      <button
                        className={`btn btn-sm ${item.status === "active" ? "btn-success" : "btn-danger"}`}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Media</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label>Select Media Type</label>
                      <select
                        className="form-select"
                        value={formData.selectedType}
                        onChange={(e) =>
                          setFormData({ ...formData, selectedType: e.target.value })
                        }
                      >
                        <option value="">Select Type</option>
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label>Upload File</label>
                      <input
                        type="file"
                        name="videoimg"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label>Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-3">
                      <label>Alt</label>
                      <input
                        type="text"
                        name="alt"
                        className="form-control"
                        value={formData.alt}
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

export default VedicGurukulVideoSlider;
