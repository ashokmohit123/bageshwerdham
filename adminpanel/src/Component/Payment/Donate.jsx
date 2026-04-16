import React, { useState, useEffect } from "react";
import axios from "axios";


const Donate = ({ BASE_URL }) => {
 
// submit form data
   const [formData, setFormData] = useState({
    heading: "",
    topdescription: "",
    qrbanner: "",
    hdfcbankbanner: "",
    sbibankbanner: "",
    name: "",
    description: "",
    amount: "",
    image: "",
    razorpayButtonId: "",
    bottombanner: "",
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
    fd.append("heading", formData.heading);
    fd.append("topdescription", formData.topdescription);
    // fd.append("qrbanner", formData.qrbanner);
    // fd.append("hdfcbankbanner", formData.hdfcbankbanner);
    // fd.append("image", formData.image);
    fd.append("razorpayButtonId", formData.razorpayButtonId);
    // fd.append("bottombanner", formData.bottombanner);
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("amount", formData.amount);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);
    fd.append("creation_date", formData.creation_date);

    // ✅ Attach files if selected
  if (formData.qrbanner) {
    fd.append("qrbanner", formData.qrbanner);
  }
  if (formData.hdfcbankbanner) {
    fd.append("hdfcbankbanner", formData.hdfcbankbanner);
  }
  if (formData.sbibankbanner) {
    fd.append("sbibankbanner", formData.sbibankbanner);
  }
  if (formData.image) {
    fd.append("image", formData.image);
  }
  if (formData.bottombanner) {
    fd.append("bottombanner", formData.bottombanner);
  }

 if (editingId) {
  // ✅ Update existing
  const response = await axios.put(
    `${BASE_URL}/api/updatedonation/${editingId}`,
    fd,
    {
      headers: {
        apikey: "12345",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const updatedDonation = response.data.data; // ✅ use record, not data

  setEventsslide((prev) =>
    prev.map((item) =>
      item.id === editingId ? { ...item, ...updatedDonation } : item
    )
  );

  alert("✅ Updated successfully");
  setShowEditModal(false);
    } else {
      // ✅ Add new
      const res = await axios.post(`${BASE_URL}/api/insertdonation`, fd, {
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
    qrbanner: res.data.qrbanner,
    hdfcbankbanner: res.data.hdfcbankbanner,
    sbibankbanner: res.data.sbibankbanner,
    image: res.data.image,
    bottombanner: res.data.bottombanner,
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
    axios.get(`${BASE_URL}/api/selectdonation`, {
      headers: {
        "apikey": "12345" // 👈 same key jo backend me hai
      }
      
    })

    
    .then(res => setEventsslide(res.data))
    .catch(err => console.error("Error fetching data", err));
  }, [BASE_URL]);

  const [editingId, setEditingId] = useState(null); // track edit mode
  const [showEditModal, setShowEditModal] = useState(false); // modal state



 
  const handleEdit = (row) => {
  setEditingId(row.id);
  setFormData({
    heading: row.heading,
    topdescription: row.topdescription,
    name: row.name,
    description: row.description,
    amount: row.amount,
    qrbanner: row.qrbanner,
    hdfcbankbanner: row.hdfcbankbanner,
    sbibankbanner: row.sbibankbanner,
    image: row.image,
    razorpayButtonId: row.razorpayButtonId,
    bottombanner: row.bottombanner,
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
      await axios.delete(`${BASE_URL}/api/deletedonation/${id}`, {
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
      heading: "",
      topdescription: "",
      qrbanner: "",
      hdfcbankbanner: "",
      sbibankbanner: "",
      image: "",
      razorpayButtonId: "",
      bottombanner: "",
      name: "",
      description: "",
      amount: "",
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
        `${BASE_URL}/api/statusdonation/${id}/status`,
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
        <h3>Donation Management</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Donation"}
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
              <label className="form-label"> Heading </label>
              <input type="text" name="heading" className="form-control" placeholder="Enter Heading"
                value={formData.heading} onChange={handleChange} />
            </div>

             <div className="col">
              <label className="form-label">Top Description</label>
              <input type="text" name="topdescription" className="form-control" placeholder="Enter Top Description"
                value={formData.topdescription} onChange={handleChange} />
            </div>

             
           
          <div className="col">
            <label className="form-label">QR Banner</label>
            <input
                type="file"
                name="qrbanner"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>

            <div className="col">
            <label className="form-label">HDFC Bank Banner</label>
            <input
                type="file"
                name="hdfcbankbanner"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>
             <div className="col">
            <label className="form-label">SBI Bank Banner</label>
            <input
                type="file"
                name="sbibankbanner"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>

         <div className="col">
              <label className="form-label">Name</label>
              <input type="text" name="name" className="form-control" placeholder="Enter Name"
                value={formData.name} onChange={handleChange} />
            </div>

            
             <div className="col">
              <label className="form-label">Description</label>
              <input type="text" name="description" className="form-control" placeholder="Enter Description"
                value={formData.description} onChange={handleChange} />
            </div>

           
          </div>

          <div className="row mb-3">

             <div className="col">
              <label className="form-label">Amount</label>
              <input type="text" name="amount" className="form-control" placeholder="Enter Amount"
                value={formData.amount} onChange={handleChange} />
            </div>

            <div className="col">
            <label className="form-label">Card Image</label>
            <input
                type="file"
                name="image"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>
             <div className="col">
              <label className="form-label">Razorpay ButtonId</label>
              <input type="text" name="razorpayButtonId" className="form-control" placeholder="Enter razorpayButtonId"
                value={formData.razorpayButtonId} onChange={handleChange} />
            </div> 

         <div className="col">
            <label className="form-label">Bottom Banner</label>
            <input
                type="file"
                name="bottombanner"   // ✅ match backend
                className="form-control"
                onChange={handleChange}
            />
            </div>


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
            <th>Top Heading</th>
            <th>Top Description</th>
            <th>QR Banner</th>
            <th>HDFC Bank Banner</th>
            <th>SBI Bank Banner</th>
            <th>Name</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Card Image</th>
            <th>Razorpay ButtonId</th>
            <th>Bottom Banner</th> 
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
                <td>{item.heading}</td>
                <td>{item.topdescription}</td>
                
                <td>
                  <img src={`${BASE_URL}${item.qrbanner}`} alt="Bg" style={{ width: "100px" }} />
                </td>
                <td>
                  <img src={`${BASE_URL}${item.hdfcbankbanner}`} alt="Bg" style={{ width: "100px" }} />
                </td>
                <td>
                  <img src={`${BASE_URL}${item.sbibankbanner}`} alt="Bg" style={{ width: "100px" }} />
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.amount}</td>
                <td>
                  <img src={`${BASE_URL}${item.image}`} alt="Bg" style={{ width: "100px" }} />
                </td>
               
                <td>{item.razorpayButtonId}</td>
                
                <td>
                  <img src={`${BASE_URL}${item.bottombanner}`} alt="Bg" style={{ width: "100px" }} />
                  
                </td>
               
                <td>{item.created_by}</td>
                <td>
                  {item.creation_date
                    ? new Date(item.creation_date).toLocaleDateString()
                    : "-"}
                </td>
              
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
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1400px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Donation</h5>
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
                      <label className="form-label">Top Heading</label>
                      <input
                        type="text"
                        name="heading"
                        className="form-control"
                        value={formData.heading}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Top Description</label>
                      <input
                        type="text"
                        name="topdescription"
                        className="form-control"
                        value={formData.topdescription}
                        onChange={handleChange}
                      />
                    </div>
                    

                   <div className="col">
                      <label className="form-label">QR Banner</label>
                      <input
                        type="file"
                        name="qrbanner"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">HDFC Bank Banner</label>
                      <input
                        type="file"
                        name="hdfcbankbanner"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">SBI Bank Banner</label>
                      <input
                        type="file"
                        name="sbibankbanner"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>

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
                      <label className="form-label">Amount</label>
                      <input
                        type="text"
                        name="amount"
                        className="form-control"
                        value={formData.amount}
                        onChange={handleChange}
                      />
                    </div>
                       <div className="col">
                      <label className="form-label">Card Image</label>
                      <input
                        type="file"
                        name="image"
                        className="form-control"
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Razorpay Button Id</label>
                      <input
                        type="text"
                        name="razorpayButtonId"
                        className="form-control"
                        value={formData.razorpayButtonId}
                        onChange={handleChange}
                      />
                    </div>
                     <div className="col">
                      <label className="form-label">Bottom Banner</label>
                      <input
                        type="file"
                        name="bottombanner"
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

export default Donate;
