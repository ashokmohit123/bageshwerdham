import React, { useState, useEffect } from "react";
import axios from "axios";


const LiveKatha = ({ BASE_URL }) => {
 
// submit form data
   const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    description	: "",
    creation_date: "",
    created_by: "admin", // Default example
    status: "active"
  });

  

 const handleChange = (e) => {
  const { name, value, files } = e.target;
  setFormData({
    ...formData,
    [name]: files ? files[0] : value,
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const fd = new FormData();
    fd.append("title", formData.title);
    fd.append("description", formData.description);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    
    if (formData.video_url) {
      fd.append("video_url", formData.video_url);
    }

 if (editingId) {
  const response = await axios.put(
    `${BASE_URL}/api/insertlivekatha/${editingId}`,
    fd,
    {
      headers: {
        apikey: "12345",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const updatedLiveKatha = response.data.data;

  setEventsslide(prev =>
    prev.map(item =>
      item.id === editingId ? { ...item, ...updatedLiveKatha } : item
    )
  );

  alert("✅ Updated successfully");
  setShowEditModal(false);
} else {
      // ✅ Add new
      const res = await axios.post(`${BASE_URL}/api/insertlivekatha`, fd, {
        headers: {
          apikey: "12345",
          "Content-Type": "multipart/form-data",
        },
      });
console.log(res.data);
      // ✅ Append new row to eventsslide
      setEventsslide((prev) => [
        ...prev,
        { id: res.data.id, ...formData,  video_url: res.data.video_url },
      ]);

      alert("✅ Data saved successfully: ID " + res.data.id);
    }

    resetForm();
  } catch (err) {
    console.error("❌ API Error:", err.response ? err.response.data : err.message);
    alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
  }
};


//select all data table

 const [eventsslide, setEventsslide] = useState([]);

  // ✅ Fetch data from API
  useEffect(() => {
    axios.get(`${BASE_URL}/api/selectlivekatha`, {
      headers: {
        "apikey": "12345" // 👈 same key jo backend me hai
      }
      
    })

    
    .then(res => setEventsslide(res.data))
    .catch(err => console.error("Error fetching data", err));
  }, [BASE_URL]);

  const [editingId, setEditingId] = useState(null); // track edit mode
  const [showEditModal, setShowEditModal] = useState(false); // modal state


   // ✅ Edit handler (open modal)
   
   
 
  const handleEdit = (row) => {
  setEditingId(row.id);
  setFormData({
    title: row.title,
    video_url: "",
    description: row.description,
    creation_date: row.creation_date?.split("T")[0] || "",
    created_by: row.created_by,
    status: row.status,
  });
  setShowEditModal(true);
};

  

  // ✅ Delete handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/selectlivekatha/${id}`, {
        headers: { apikey: "12345" },
      });
    //  alert("✅ Deleted successfully");
    setEventsslide(prev => prev.filter(event => event.id !== id));

      //fetchBanners();
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      video_url: "",
      description: "",
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
        `${BASE_URL}/api/selectlivekatha/${id}/status`,
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
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Live Katha</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Live Katha"}
        </button>
      </div>

      {/* Add Event Form */}
      {formData && (
         <div className="card mb-4">
      <div className="card-header">Bageshwer Dham</div>
      <div className="card-body">
        <form onSubmit={handleSubmit} enctype="multipart/form-data">
          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Title</label>
              <input type="text" name="title" className="form-control" placeholder="Enter Title"
                value={formData.title} onChange={handleChange} />
            </div>
           
            <div className="col">
              <label className="form-label">Add Video URL</label>
              <input type="file" name="video_url" className="form-control" placeholder="Enter Video URL"
                 onChange={handleChange} />
            </div>
          </div>

          <div className="row mb-3">
            <div className="col">
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-control" placeholder="Enter Description"
                value={formData.description} onChange={handleChange} />
            </div>
            <div className="col">
              <label className="form-label">Published Date</label>
              <input type="date" name="creation_date" className="form-control"
                value={formData.creation_date} onChange={handleChange} />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-primary">Submit</button>
            <button type="button" className="btn btn-danger">Cancel</button>
          </div>
        </form>
      </div>
    </div>
      )}

      {/* Festival Guru List Table */}
      <div className="card">
        <div className="card-header">Bageshwer Dham List</div>
        <div className="card-body">
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Video URL</th>
            <th>Description</th>
            <th>Created By</th>
            <th>Publish Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {eventsslide.length > 0 ? (
            eventsslide
            //.filter((item) => item.status === "active") // ✅ sirf active rows dikhayega
            .map((item, index) => (
              <tr key={item.id} className={item.status === "active" ? "active-row" : "inactive-row"}>
                <td>{index + 1}</td>
                <td>{item.title}</td>
                 <td>
            <video
                src={`${BASE_URL}${item.video_url}`}
                width="120"
                height="80"
                style={{ borderRadius: "10px", width: "120px", height: "60px", objectFit: "cover" }}
            >
                Your browser does not support the video tag.
            </video>
            </td>
               
                <td>{item.description}</td>
                <td>{item.created_by}</td>
                <td>
                  {item.creation_date
                    ? new Date(item.creation_date).toLocaleDateString()
                    : "-"}
                </td>
                {/* <td>
                  <span
                    className={`badge ${
                      item.status === "active" ? "bg-success" : "bg-danger"
                    }`}
                  >
                    {item.status}
                  </span>
                </td> */}
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
               
                <td class="text-nowrap">
                  <button className="btn btn-sm btn-info me-1" onClick={() => handleEdit(item)}>
                    <i className="fa fa-edit"></i>
                  </button>
                  <button className="btn btn-sm btn-warning me-1" onClick={() => handleDelete(item.id)}>
                    <i className="fa fa-trash"></i>
                  </button>
                 
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">
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
                <h5 className="modal-title">Edit Banner</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Banner Title</label>
                      <input
                        type="text"
                        name="title"
                        className="form-control"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                  
                    <div className="col">
                      <label className="form-label">Change Video</label>
                      <input
                        type="file"
                        name="video_url"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
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

export default LiveKatha;
