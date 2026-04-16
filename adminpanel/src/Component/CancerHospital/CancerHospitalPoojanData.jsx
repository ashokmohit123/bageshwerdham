import React, { useState, useEffect } from "react";
import axios from "axios";

const CancerHospitalPoojanData = ({ BASE_URL }) => {
  // ------------------- STATES -------------------
  const [instagram, setInstagram] = useState({
    icon: "",
    title: "",
    description: "",
    link: "",
  });
  const [description, setDescription] = useState([""]);
  const [videos, setVideos] = useState([{ title: "", url: "" }]);
  const [pmImage, setPmImage] = useState(null);
  const [featuresTitle, setFeaturesTitle] = useState("👉 Key Features of the Project");
  const [features, setFeatures] = useState([""]);
  const [projectImages, setProjectImages] = useState([{ src: null, alt: "" }]);

  const [poojanData, setPoojanData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  

  // ------------------- HANDLERS -------------------
  const handleInstagramChange = (e) => {
    const { name, value } = e.target;
    setInstagram((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (index, value) => {
    const newDesc = [...description];
    newDesc[index] = value;
    setDescription(newDesc);
  };
  const addDescription = () => setDescription([...description, ""]);

  const handleVideoChange = (index, field, value) => {
    const newVideos = [...videos];
    newVideos[index][field] = value;
    setVideos(newVideos);
  };
  const addVideo = () => setVideos([...videos, { title: "", url: "" }]);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const addFeature = () => setFeatures([...features, ""]);

  const handleProjectImageChange = (index, field, value) => {
    const newImages = [...projectImages];
    newImages[index][field] = value;
    setProjectImages(newImages);
  };
  const addProjectImage = () => setProjectImages([...projectImages, { src: null, alt: "" }]);

  // ------------------- MAIN FORM SUBMIT -------------------
  const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  // Instagram
  formData.append("instagram_icon", instagram.icon);
  formData.append("instagram_title", instagram.title);
  formData.append("instagram_description", instagram.description);
  formData.append("instagram_link", instagram.link);

  // Description, Videos, Features
  formData.append("description", JSON.stringify(description));
  formData.append("videos", JSON.stringify(videos));
  formData.append("features_title", featuresTitle);
  formData.append("features_list", JSON.stringify(features));

  // PM Image
  if (pmImage instanceof File) {
    formData.append("pm_image", pmImage);
  }

  // Project Images
  projectImages.forEach((img) => {
    if (img.src instanceof File) {
      formData.append("project_images", img.src);
    }
  });

  formData.append("status", "active");
  formData.append("created_by", "admin");

  try {
    const apiKey = "12345";
    let res;

    if (editingId) {
      res = await axios.put(
        `${BASE_URL}/api/updatecancerhospital_poojandata/${editingId}`,
        formData,
        {
          headers: {
            apikey: apiKey,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPoojanData((prev) =>
        prev.map((item) => (item.id === editingId ? res.data : item))
      );
      alert("✅ Updated successfully");
    } else {
      res = await axios.post(
        `${BASE_URL}/api/insertcancerhospital_poojandata`,
        formData,
        {
          headers: {
            apikey: apiKey,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPoojanData((prev) => [...prev, res.data]);
      alert("✅ Data saved successfully");
    }

    resetForm();
  } catch (err) {
    console.error("❌ API Error:", err);
    alert("❌ Error: " + (err.response?.data?.error || err.message));
  }
};


  // ------------------- RESET -------------------
  const resetForm = () => {
    setInstagram({ icon: "", title: "", description: "", link: "" });
    setDescription([""]);
    setVideos([{ title: "", url: "" }]);
    setPmImage(null);
    setFeaturesTitle("👉 Key Features of the Project");
    setFeatures([""]);
    setProjectImages([{ src: null, alt: "" }]);
    setEditingId(null);
    setShowForm(false);
  };

  // ------------------- FETCH DATA -------------------
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectcancerhospital_poojandata`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setPoojanData(res.data))
      .catch((err) => console.error("Error fetching data", err));
  }, [BASE_URL]);

  // ------------------- EDIT -------------------
  const handleEdit = (row) => {
    setEditingId(row.id);
    setInstagram({
      icon: row.instagram_icon || "",
      title: row.instagram_title || "",
      description: row.instagram_description || "",
      link: row.instagram_link || "",
    });
    setDescription(
      typeof row.description === "string"
        ? JSON.parse(row.description)
        : row.description || [""]
    );
    setVideos(
      typeof row.videos === "string" ? JSON.parse(row.videos) : row.videos || []
    );
    setPmImage(row.pm_image || "");
    setFeaturesTitle(row.features_title || "");
    setFeatures(
      typeof row.features_list === "string"
        ? JSON.parse(row.features_list)
        : row.features_list || [""]
    );
    setProjectImages(
      typeof row.project_images === "string"
        ? JSON.parse(row.project_images)
        : row.project_images || [{ src: null, alt: "" }]
    );
    setShowForm(true);
  };

  // ------------------- DELETE -------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await axios.delete(`${BASE_URL}/api/deletecancerhospital_poojandata/${id}`, {
        headers: { apikey: "12345" },
      });
      setPoojanData((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("❌ Error deleting record");
    }
  };

  // ------------------- STATUS TOGGLE -------------------
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statuscancerhospital_poojandata/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      setPoojanData((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: res.data.status } : b))
      );
    } catch (err) {
      console.error("Status toggle error:", err);
      alert("Failed to update status");
    }
  };

  // ------------------- JSX -------------------
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4> Cancer Hospital Bhumi Poojan Admin</h4>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          <i className="fa fa-plus"></i>{" "}
          {showForm ? "Close Form" : "Add New Entry"}
        </button>
      </div>

      {/* ✅ FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Edit Poojan Data</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {/* Instagram Section */}
              <h5 className="border-bottom pb-2 mb-3">Instagram Section</h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Icon URL</label>
                  <input
                    type="text"
                    className="form-control"
                    name="icon"
                    value={instagram.icon}
                    onChange={handleInstagramChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={instagram.title}
                    onChange={handleInstagramChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="2"
                    value={instagram.description}
                    onChange={handleInstagramChange}
                  ></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Link</label>
                  <input
                    type="text"
                    className="form-control"
                    name="link"
                    value={instagram.link}
                    onChange={handleInstagramChange}
                  />
                </div>
              </div>

              {/* Description */}
              <h5 className="border-bottom pb-2 mb-3">Description</h5>
              {description.map((desc, i) => (
                <div key={i} className="mb-3">
                  <textarea
                    className="form-control"
                    rows="2"
                    value={desc}
                    onChange={(e) => handleDescriptionChange(i, e.target.value)}
                  ></textarea>
                </div>
              ))}
              <button
                type="button"
                onClick={addDescription}
                className="btn btn-outline-primary btn-sm mb-3"
              >
                + Add Paragraph
              </button>

              {/* Videos */}
              <h5 className="border-bottom pb-2 mb-3">YouTube Videos</h5>
              {videos.map((video, i) => (
                <div key={i} className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder="Title"
                      className="form-control"
                      value={video.title}
                      onChange={(e) =>
                        handleVideoChange(i, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder="YouTube embed URL"
                      className="form-control"
                      value={video.url}
                      onChange={(e) =>
                        handleVideoChange(i, "url", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addVideo}
                className="btn btn-outline-primary btn-sm mb-3"
              >
                + Add Video
              </button>

              {/* PM Image */}
              <h5 className="border-bottom pb-2 mb-3">PM Image</h5>
              <input
                type="file"
                className="form-control mb-3"
                onChange={(e) => setPmImage(e.target.files[0])}
              />

              {/* Features */}
              <h5 className="border-bottom pb-2 mb-3">Key Features</h5>
              <input
                type="text"
                className="form-control mb-3"
                value={featuresTitle}
                onChange={(e) => setFeaturesTitle(e.target.value)}
              />
              {features.map((f, i) => (
                <input
                  key={i}
                  type="text"
                  className="form-control mb-2"
                  value={f}
                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                />
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="btn btn-outline-primary btn-sm mb-3"
              >
                + Add Feature
              </button>

              {/* Project Images */}
              <h5 className="border-bottom pb-2 mb-3">Project Images</h5>
              {projectImages.map((img, i) => (
                <div key={i} className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleProjectImageChange(i, "src", e.target.files[0])
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder="Alt Text"
                      className="form-control"
                      value={img.alt}
                      onChange={(e) =>
                        handleProjectImageChange(i, "alt", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addProjectImage}
                className="btn btn-outline-primary btn-sm mb-4"
              >
                + Add Image
              </button>

              <div className="text-center">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger ms-2"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ TABLE */}
      <div className="card">
        <div className="card-header">Cancer Hospital Poojan Data List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Instagram</th>
                <th>Description</th>
                <th>Videos</th>
                <th>PM Image</th>
                <th>Features</th>
                <th>Project Images</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {poojanData.length > 0 ? (
                poojanData.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>
                    <td>{item.instagram_title}</td>
                    <td>
                      {Array.isArray(item.description)
                        ? item.description.join(" | ")
                        : item.description}
                    </td>
                    <td>
                      {Array.isArray(item.videos)
                        ? item.videos.map((v) => v.title).join(", ")
                        : item.videos}
                    </td>
                    <td>{item.pm_image}</td>
                    <td>{item.features_title}</td>
                    <td>{item.project_images?.length || 0} Images</td>
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
                <h5 className="modal-title">Edit Cancer Hospital</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                  <form onSubmit={handleSubmit}>
              {/* Instagram Section */}
              <h5 className="border-bottom pb-2 mb-3">Instagram Section</h5>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Icon URL</label>
                  <input
                    type="text"
                    className="form-control"
                    name="icon"
                    value={instagram.icon}
                    onChange={handleInstagramChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={instagram.title}
                    onChange={handleInstagramChange}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    rows="2"
                    value={instagram.description}
                    onChange={handleInstagramChange}
                  ></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Link</label>
                  <input
                    type="text"
                    className="form-control"
                    name="link"
                    value={instagram.link}
                    onChange={handleInstagramChange}
                  />
                </div>
              </div>

              {/* Description */}
              <h5 className="border-bottom pb-2 mb-3">Description</h5>
              {description.map((desc, i) => (
                <div key={i} className="mb-3">
                  <textarea
                    className="form-control"
                    rows="2"
                    value={desc}
                    onChange={(e) => handleDescriptionChange(i, e.target.value)}
                  ></textarea>
                </div>
              ))}
              <button
                type="button"
                onClick={addDescription}
                className="btn btn-outline-primary btn-sm mb-3"
              >
                + Add Paragraph
              </button>

              {/* Videos */}
              <h5 className="border-bottom pb-2 mb-3">YouTube Videos</h5>
              {videos.map((video, i) => (
                <div key={i} className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder="Title"
                      className="form-control"
                      value={video.title}
                      onChange={(e) =>
                        handleVideoChange(i, "title", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder="YouTube embed URL"
                      className="form-control"
                      value={video.url}
                      onChange={(e) =>
                        handleVideoChange(i, "url", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addVideo}
                className="btn btn-outline-primary btn-sm mb-3"
              >
                + Add Video
              </button>

              {/* PM Image */}
              <h5 className="border-bottom pb-2 mb-3">PM Image</h5>
              <input
                type="file"
                className="form-control mb-3"
                onChange={(e) => setPmImage(e.target.files[0])}
              />

              {/* Features */}
              <h5 className="border-bottom pb-2 mb-3">Key Features</h5>
              <input
                type="text"
                className="form-control mb-3"
                value={featuresTitle}
                onChange={(e) => setFeaturesTitle(e.target.value)}
              />
              {features.map((f, i) => (
                <input
                  key={i}
                  type="text"
                  className="form-control mb-2"
                  value={f}
                  onChange={(e) => handleFeatureChange(i, e.target.value)}
                />
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="btn btn-outline-primary btn-sm mb-3"
              >
                + Add Feature
              </button>

              {/* Project Images */}
              <h5 className="border-bottom pb-2 mb-3">Project Images</h5>
              {projectImages.map((img, i) => (
                <div key={i} className="row g-3 mb-3">
                  <div className="col-md-6">
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) =>
                        handleProjectImageChange(i, "src", e.target.files[0])
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      placeholder="Alt Text"
                      className="form-control"
                      value={img.alt}
                      onChange={(e) =>
                        handleProjectImageChange(i, "alt", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addProjectImage}
                className="btn btn-outline-primary btn-sm mb-4"
              >
                + Add Image
              </button>

              <div className="text-center">
                <button type="submit" className="btn btn-primary">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger ms-2"
                  onClick={resetForm}
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

export default CancerHospitalPoojanData;
