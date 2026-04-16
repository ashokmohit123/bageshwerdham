import React, { useState, useEffect } from "react";
import axios from "axios";

const WhatsUpSlider = ({ BASE_URL }) => {
  // ✅ Table data
  const [formData, setFormData] = useState({
    href: "",
    title: "",
    name: "",
    bullets: [],  // Initialize as an array
    image: "",
    status: "active",
    creation_date: "",
    created_by: "admin", // Default example
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null); // track edit mode
  const [showEditModal, setShowEditModal] = useState(false); // modal state

  // ✅ Fetch data from API
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectabout_whatsupslider`, {
        headers: {
          apikey: "12345", // 👈 same key jo backend me hai
        },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Error fetching data", err));
  }, [BASE_URL]);

  // ✅ Handle form changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // ✅ Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("href", formData.href);
      fd.append("title", formData.title);
      fd.append("name", formData.name);
      fd.append("bullets", JSON.stringify(formData.bullets)); // Correctly stringify the bullets array
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);
      fd.append("creation_date", formData.creation_date);

      if (formData.image) {
        fd.append("image", formData.image);
      }

      const apiUrl = `${BASE_URL}/api/insertabout_whatsupslider`;
      console.log("Making request to:", apiUrl);

      if (editingId) {
        // ✅ Update existing
        const res = await axios.put(
          `${BASE_URL}/api/updateabout_whatsupslider/${editingId}`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );

        setEventsslide((prev) =>
          prev.map((item) =>
            item.id === editingId ? res.data.record : item
          )
        );
        alert("✅ Updated successfully");
        setShowEditModal(false);
      } else {
        // ✅ Add new
        const res = await axios.post(
          `${BASE_URL}/api/insertabout_whatsupslider`,
          fd,
          {
            headers: { apikey: "12345", "Content-Type": "multipart/form-data" },
          }
        );
        setEventsslide((prev) => [...prev, res.data.record]);
        alert("✅ Data saved successfully: ID " + res.data.record.id);
      }

      resetForm();
    } catch (err) {
      console.error("❌ API Error:", err.response ? err.response.data : err.message);
      alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  // ✅ Edit handler (open modal)
  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      href: row.href,
      title: row.title,
      name: row.name,
      bullets: Array.isArray(row.bullets) ? row.bullets : row.bullets.split("\n"), // Ensure it's an array
      image: row.image,
      creation_date: row.creation_date?.split("T")[0],
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });
    setShowEditModal(true);
  };

  // ✅ Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deleteabout_whatsupslider/${id}`, {
        headers: { apikey: "12345" },
      });
      setEventsslide((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      href: "",
      title: "",
      name: "",
      bullets: [], // Initialize as an empty array
      image: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  // ✅ Status Toggle Function
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusabout_whatsupslider/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: res.data.status } : b
        )
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update status");
    }
  };


  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>About Whatsup Slider</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add About Whatsup Slider"}
        </button>
      </div>

      {/* ✅ Form */}
      {formData && (
        <div className="card mb-4">
          <div className="card-header">Bageshwer Dham</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col-md-3">
                  <label className="form-label">Href</label>
                  <input
                    type="text"
                    name="href"
                    className="form-control"
                    value={formData.href}
                    onChange={handleChange}
                  />
                </div>
                  <div className="col-md-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Bullets</label>
                 <textarea
                        name="bullets"
                        className="form-control"
                        rows="4"
                        value={formData.bullets.join("\n")}
                        onChange={(e) =>
                        setFormData({ ...formData, bullets: e.target.value.split("\n") })
                        }
                    ></textarea>
                </div>
                 

                <div className="col-md-3">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    name="image"
                    className="form-control"
                    onChange={handleChange}
                  />
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
                  Submit
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
        <div className="card-header">Bageshwer Whatsup Slider</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Href</th>
                <th>Title</th>
                  <th>Name</th>
                <th>Bullets</th>
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
                    <td>{item.href}</td>
                         <td>{item.title}</td>
                         <td>{item.name}</td>
                         <td>

                             <ul style={{ paddingLeft: "15px" }}>
                            {Array.isArray(item.bullets)
                            ? item.bullets.map((b, i) => <li key={i}>{b}</li>)
                            : item.bullets}
                        </ul>
                                                </td>
                        
                      <td>

                          <img
                        src={`${BASE_URL}${item.image}`}
                        alt="thumbnail"
                        style={{ width: "100px", height: "80px" }}
                      />
                    </td>
                

                    <td>
                      {item.creation_date
}
                    </td>
                    <td>{item.created_by}</td>
                     <td>
                      <button
                        className={`btn btn-sm ${
                          item.status === "active" ? "btn-success" : "btn-danger"
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
                <h5 className="modal-title">Edit Bageshwer Whatsup Slider</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <label className="form-label">Href</label>
                      <input
                        type="text"
                        name="href"
                        className="form-control"
                        value={formData.href}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col-md-3">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Bullets</label>
                       <textarea
                        name="bullets"
                        className="form-control"
                        rows="4"
                        value={formData.bullets.join("\n")}
                        onChange={(e) =>
                        setFormData({ ...formData, bullets: e.target.value.split("\n") })
                        }
                    ></textarea>
                      {/* <input
                        type="text"
                        name="bullets"
                        className="form-control"
                        value={formData.bullets}
                        onChange={handleChange}
                      /> */}
                    </div>
                   
                   
                     <div className="col-md-3">
                      <label className="form-label">Images</label>
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

export default WhatsUpSlider;
