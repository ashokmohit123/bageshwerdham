import React, { useState, useEffect } from "react";
import axios from "axios";

const UpcommingReligionSanatan = ({ BASE_URL }) => {
  const [showForm, setShowForm] = useState(false); // FIXED
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    backgroundImage: "",
    text: "",
    author: "",
    footer: "",
    icon: "",
    status: "active",
    creation_date: "",
    created_by: "admin",
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const resetForm = () => {
    setFormData({
      backgroundImage: "",
      text: "",
      author: "",
      footer: "",
      icon: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("text", formData.text);
      fd.append("author", formData.author);
      fd.append("footer", formData.footer);
      fd.append("icon", formData.icon);
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);
      fd.append("creation_date", formData.creation_date);

      if (formData.backgroundImage instanceof File) {
        fd.append("backgroundImage", formData.backgroundImage);
      }

      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/api/updateupcomming_religionsanatan/${editingId}`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );

        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? res.data.record : item))
        );

        alert("Updated Successfully");
        setShowEditModal(false);
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/insertupcomming_religionsanatan`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );

        setEventsslide((prev) => [...prev, res.data.record]);
        alert("Data Saved Successfully");
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const [eventsslide, setEventsslide] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectupcomming_religionsanatan`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error(err));
  }, [BASE_URL]);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      backgroundImage: row.backgroundImage,
      text: row.text,
      author: row.author,
      footer: row.footer,
      icon: row.icon,
      creation_date: row.creation_date?.split("T")[0],
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deleteupcomming_religionsanatan/${id}`, {
        headers: { apikey: "12345" },
      });

      setEventsslide((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusupcomming_religionsanatan/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((x) => (x.id === id ? { ...x, status: res.data.status } : x))
      );
    } catch {
      alert("Status update failed");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h3>Upcoming Religion Events</h3>

        <button
          className="btn btn-success"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fa fa-plus" /> {showForm ? "Close Form" : "Add New"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add Event</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row">
                <div className="col-md-3">
                  <label>Background Image</label>
                  <input type="file" name="backgroundImage" className="form-control" onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Text</label>
                  <input type="text" name="text" className="form-control" value={formData.text} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Author</label>
                  <input type="text" name="author" className="form-control" value={formData.author} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Footer</label>
                  <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Icon</label>
                  <input type="text" name="icon" className="form-control" value={formData.icon} onChange={handleChange} />
                </div>

                <div className="col-md-3">
                  <label>Publish Date</label>
                  <input type="date" name="creation_date" className="form-control" value={formData.creation_date} onChange={handleChange} />
                </div>
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">Records</div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>#</th>
              <th>Background</th>
              <th>Text</th>
              <th>Author</th>
              <th>Footer</th>
              <th>Icon</th>
              <th>Date</th>
              <th>Creator</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {eventsslide.map((item, i) => (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td><img src={`${BASE_URL}${item.backgroundImage}`} width="100"  alt="img"/></td>
                <td>{item.text}</td>
                <td>{item.author}</td>
                <td>{item.footer}</td>
                <td>{item.icon}</td>
                <td>{item.creation_date}</td>
                <td>{item.created_by}</td>

                <td>
                  <button
                    className={`btn btn-sm ${
                      item.status === "active" ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() => toggleStatus(item.id)}
                  >
                    {item.status}
                  </button>
                </td>

                <td>
                  <button className="btn btn-info btn-sm me-1" onClick={() => handleEdit(item)}>
                    Edit
                  </button>

                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content p-3">
              <h5>Edit Record</h5>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <label>Background Image</label>
                    <input type="file" name="backgroundImage" className="form-control" onChange={handleChange} />
                  </div>

                  <div className="col-md-3">
                    <label>Text</label>
                    <input type="text" name="text" className="form-control" value={formData.text} onChange={handleChange} />
                  </div>

                  <div className="col-md-3">
                    <label>Author</label>
                    <input type="text" name="author" className="form-control" value={formData.author} onChange={handleChange} />
                  </div>

                  <div className="col-md-3">
                    <label>Footer</label>
                    <input type="text" name="footer" className="form-control" value={formData.footer} onChange={handleChange} />
                  </div>

                  <div className="col-md-3">
                    <label>Icon</label>
                    <input type="text" name="icon" className="form-control" value={formData.icon} onChange={handleChange} />
                  </div>

                  <div className="col-md-3">
                    <label>Date</label>
                    <input type="date" name="creation_date" className="form-control" value={formData.creation_date} onChange={handleChange} />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button className="btn btn-primary me-2">Update</button>
                  <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcommingReligionSanatan;
