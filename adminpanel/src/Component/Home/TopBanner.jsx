import React, { useState, useEffect } from "react";
import axios from "axios";

const TopBanner = ({ BASE_URL }) => {
  const [showForm, setShowForm] = useState(false);
  const [banners, setBanners] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    banner: "",
    video_url: "",
    video_title: "",
    creation_date: "",
    created_by: "admin",
    status: "active"
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, files, value } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("video_title", formData.video_title);
      fd.append("creation_date", formData.creation_date);
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);

      if (formData.banner) fd.append("banner", formData.banner);
      if (formData.video_url) fd.append("video_url", formData.video_url);

      if (editingId) {
        // UPDATE
        const res = await axios.put(
          `${BASE_URL}/api/topbanner/${editingId}`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setBanners((prev) =>
          prev.map((item) =>
            item.id === editingId ? res.data.data : item
          )
        );

        alert("Updated successfully!");
        setShowEditModal(false);

      } else {
        // INSERT
        const res = await axios.post(
          `${BASE_URL}/api/topbanner`,
          fd,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "multipart/form-data",
            },
          }
        );

        setBanners((prev) => [
          ...prev,
          res.data.data,
        ]);

        alert("Data added successfully!");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  // Fetch all
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/topbanner`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setBanners(res.data))
      .catch((err) => console.error(err));
  }, [BASE_URL]);

  // Edit
  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      banner: "",
      video_url: "",
      video_title: item.video_title,
      creation_date: item.creation_date?.split("T")[0] || "",
      created_by: item.created_by,
      status: item.status,
    });
    setShowEditModal(true);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    await axios.delete(`${BASE_URL}/api/topbanner/${id}`, {
      headers: { apikey: "12345" },
    });

    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // Reset form
  const resetForm = () =>
    setFormData({
      title: "",
      banner: "",
      video_url: "",
      video_title: "",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });

  // Status Toggle
  const toggleStatus = async (id) => {
    const res = await axios.patch(
      `${BASE_URL}/api/topbanner/${id}/status`,
      {},
      { headers: { apikey: "12345" } }
    );

    setBanners((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: res.data.status } : item
      )
    );
  };

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between">
        <h3>Bageshwer Dham </h3>

        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="fa fa-plus"></i> {showForm ? "Close Form" : "Add Banner"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card mt-3">
          <div className="card-header">Add Banner</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col">
                  <label>Title</label>
                  <textarea
                    name="title"
                    className="form-control"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Banner Image</label>
                  <input type="file" name="banner" className="form-control" onChange={handleChange} />
                </div>

                <div className="col">
                  <label>Video File</label>
                  <input type="file" name="video_url" className="form-control" onChange={handleChange} />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label>Video Title</label>
                  <input
                    type="text"
                    name="video_title"
                    className="form-control"
                    value={formData.video_title}
                    onChange={handleChange}
                  />
                </div>

                <div className="col">
                  <label>Publish Date</label>
                  <input type="date" name="creation_date" className="form-control" value={formData.creation_date} onChange={handleChange} />
                </div>
              </div>

              <button className="btn btn-primary">Submit</button>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card mt-4">
        <div className="card-header">Banner List</div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Banner</th>
                <th>Video</th>
                <th>Video Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {banners.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1}</td>
                  <td>{item.title}</td>
                  <td>
                    <img src={`${BASE_URL}${item.banner}`} width="120" height="60" style={{ objectFit: "cover" }} alt="banner"/>
                  </td>

                  <td>
                    <video
                      src={`${BASE_URL}${item.video_url}`}
                      width="120"
                      height="70"
                      controls
                    />
                  </td>

                  <td>{item.video_title}</td>

                  <td>{item.creation_date?.split("T")[0]}</td>

                  <td>
                    <button
                      className={`btn btn-sm ${item.status === "active" ? "btn-success" : "btn-danger"}`}
                      onClick={() => toggleStatus(item.id)}
                    >
                      {item.status}
                    </button>
                  </td>

                  <td>
                    <button className="btn btn-info btn-sm me-1" onClick={() => handleEdit(item)}>
                      Edit
                    </button>
                    <button className="btn btn-warning btn-sm" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Banner</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <div className="col">
                      <label>Title</label>
                      <textarea
                        className="form-control"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="col">
                      <label>Change Banner</label>
                      <input
                        type="file"
                        name="banner"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col">
                      <label>Change Video</label>
                      <input
                        type="file"
                        name="video_url"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <button className="btn btn-primary">Update</button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TopBanner;
