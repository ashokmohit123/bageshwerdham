import React, { useState, useEffect } from "react";
import axios from "axios";


const Testimonials = ({ BASE_URL }) => {
 
// submit form data
   const [formData, setFormData] = useState({
    name: "",
    role: "",
    quote: "",
    description: "",
    bgImage: "",
    avatar: "",
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
    fd.append("name", formData.name);
    fd.append("role", formData.role);
    fd.append("quote", formData.quote);
    fd.append("description", formData.description);
     fd.append("created_by", formData.created_by);
     fd.append("status", formData.status);
     fd.append("creation_date", formData.creation_date);

    // ✅ Attach files if selected
  if (formData.bgImage) {
    fd.append("bgImage", formData.bgImage);
  }
  if (formData.avatar) {
    fd.append("avatar", formData.avatar);
  }

    if (editingId) {
      // ✅ Update existing
   const response = await axios.put(
        `${BASE_URL}/api/updatetestimonials/${editingId}`,
        fd,
        {
          headers: {
            apikey: "12345",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const updatedTestimonial = response.data.data;
setEventsslide((prev) =>
  prev.map((item) =>
    item.id === editingId ? updatedTestimonial : item
  )
);



      // ✅ Update existing
// setEventsslide((prev) =>
//   prev.map((item) =>
//     item.id === editingId
//       ? {
//           ...item,
//           ...formData,
//           // ✅ Only use createObjectURL if it's a File
//           bgImage:
//             formData.bgImage instanceof File
//               ? URL.createObjectURL(formData.bgImage)
//               : item.bgImage,
//           avatar:
//             formData.avatar instanceof File
//               ? URL.createObjectURL(formData.avatar)
//               : item.avatar,
//         }
//       : item
//   )
// );


      alert("✅ Updated successfully");
      setShowEditModal(false);
    } else {
      // ✅ Add new
      const res = await axios.post(`${BASE_URL}/api/inserttestimonials`, fd, {
        headers: {
          apikey: "12345",
          "Content-Type": "multipart/form-data",
        },
      });
console.log(res.data);
      // ✅ Append new row to eventsslide
    setEventsslide((prev) => [
  ...prev,
  {
    id: res.data.id,
    ...formData,
    bgImage: res.data.bgImage,
    avatar: res.data.avatar,
  },
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
    axios.get(`${BASE_URL}/api/selecttestimonials`, {
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
   
  //  const handleEdit = (image_url) => {
  //   setEditingId(image_url.id);
  //   setFormData({
  //     name: image_url.name,
  //     role: image_url.role,
  //     quote: image_url.quote,
  //     description: image_url.description,
  //     creation_date: image_url.creation_date?.split("T")[0] || "",
  //     created_by: image_url.created_by,
  //     status: image_url.status,
  //   });
  //   setShowEditModal(true);
  // };

 
  const handleEdit = (row) => {
  setEditingId(row.id);
  setFormData({
    name: row.name,
    role: row.role,
    quote: row.quote,
    description: row.description,
    bgImage: row.bgImage,
    avatar: row.avatar,
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
      await axios.delete(`${BASE_URL}/api/deletetestimonials/${id}`, {
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
      name: "",
      role: "",
      quote: "",
      bgImage: "",
      avatar: "",
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
        `${BASE_URL}/api/statustestimonials/${id}/status`,
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
        <h3>Testimonials Slider</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Testimonials"}
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
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-control" placeholder="Enter Name"
                value={formData.name} onChange={handleChange} />
            </div>

             <div className="col">
              <label className="form-label">Role</label>
              <input type="text" name="role" className="form-control" placeholder="Enter Role"
                value={formData.role} onChange={handleChange} />
            </div>
             <div className="col">
              <label className="form-label">Quote</label>
              <input type="text" name="quote" className="form-control" placeholder="Enter Quote"
                value={formData.quote} onChange={handleChange} />
            </div>
             <div className="col">
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-control" placeholder="Enter Description"
                value={formData.description} onChange={handleChange} />
            </div>
           
          <div className="col">
            <label className="form-label">Bg Images</label>
            <input
                type="file"
                name="bgImage"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>

            <div className="col">
            <label className="form-label">Avatar</label>
            <input
                type="file"
                name="avatar"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>
          </div>

          <div className="row mb-3">
            {/* <div className="col">
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-control" placeholder="Enter Description"
                value={formData.description} onChange={handleChange} />
            </div> */}
            <div className="col-md-4">
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
            <th>Name</th>
            <th>Role</th>
            <th>Quote</th>
            <th>Description</th>
            <th>Bg Image</th>
            <th>Avatar</th>
            <th>Status</th>
            <th>Publish Date</th>
            <th>Created By</th>
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
                <td>{item.name}</td>
                <td>{item.role}</td>
                <td>{item.quote}</td>
                <td>{item.description}</td>
                <td>
                  <img src={`${BASE_URL}${item.bgImage}`} alt="Bg" style={{ width: "100px" }} />
                  
                </td>
                <td>
                  <img src={`${BASE_URL}${item.avatar}`} alt="Avatar" style={{ width: "100px" }} />
                 
                </td>
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
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Testimonial</h5>
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
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        name="role"
                        className="form-control"
                        value={formData.role}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Quote</label>
                      <input
                        type="text"
                        name="quote"
                        className="form-control"
                        value={formData.quote}
                        onChange={handleChange}
                      />
                    </div>
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
                  
                   
                  </div>

                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Bg Image</label>
                      <input
                        type="file"
                        name="bgImage"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Avatar Image</label>
                      <input
                        type="file"
                        name="avatar"
                        className="form-control"
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

export default Testimonials;
