import React, { useState, useEffect } from "react";
import axios from "axios";

const GuaRakshaSahayog = ({ BASE_URL }) => {
  // Table data
  const [formData, setFormData] = useState({
    titleEmojiStart: "",
    titleText: "",
    titleEmojiEnd: "",
    line1: "",
    line2: "",
    line3: "",
    quote:"",
    highlight:"",
    buttonText:"",
    buttonLink:"",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        titleEmojiStart: formData.titleEmojiStart,
        titleText: formData.titleText,
        titleEmojiEnd: formData.titleEmojiEnd,
        line1: formData.line1,
        line2: formData.line2,
        line3: formData.line3,
        quote: formData.quote,
        highlight: formData.highlight,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        created_by: formData.created_by,
        status: formData.status,
        creation_date: formData.creation_date,
      };

      // For update (when editingId is set)
      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/api/updategauraksha_sahayog/${editingId}`,
          data,
          {
            headers: {
              apikey: "12345",  // Replace with your actual API key
              "Content-Type": "application/json",
            },
          }
        );

        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? res.data.data : item))
        );

        alert("✅ Updated successfully");
        setShowEditModal(false);
      } else {
        // For insert (new record)
        const res = await axios.post(
          `${BASE_URL}/api/insertgauraksha_sahayog`,
          data,
          {
            headers: {
              apikey: "12345",
              "Content-Type": "application/json",
            },
          }
        );

        setEventsslide((prev) => [...prev, res.data.data]);

        alert("✅ Data saved successfully: ID " + res.data.data.id);
      }

      resetForm();
    } catch (err) {
      console.error("❌ API Error:", err.response ? err.response.data : err.message);
      alert("❌ Error saving data: " + (err.response?.data?.error || err.message));
    }
  };

  // Fetch data from the API
  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectgauraksha_sahayog`, {
        headers: { apikey: "12345" },  // Use the same key as in the backend
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.error("Error fetching data", err));
  }, [BASE_URL]);

  const handleEdit = (row) => {
    setEditingId(row.id);
    setFormData({
      titleEmojiStart: row.titleEmojiStart,
      titleText: row.titleEmojiEnd,
      line1: row.line1,
      line2: row.line2,
      line3: row.line3,
      quote: row.quote,
      highlight: row.highlight,
      buttonText: row.buttonText,
      buttonLink:row.buttonLink,
      creation_date: row.creation_date?.split("T")[0],
      created_by: row.created_by || "admin",
      status: row.status || "active",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axios.delete(`${BASE_URL}/api/deletegauraksha_sahayog/${id}`, {
        headers: { apikey: "12345" },
      });
      setEventsslide((prev) => prev.filter((event) => event.id !== id));
    } catch (err) {
      console.error("❌ Delete Error:", err.response?.data || err.message);
      alert("❌ Error deleting record");
    }
  };

  const resetForm = () => {
    setFormData({
      titleEmojiStart: "",
      titleText: "",
      titleEmojiEnd: "",
      line1: "",
      line2: "",
      line3: "",
      quote:"",
      highlight:"",
      buttonText:"",
      buttonLink:"",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusgauraksha_sahayog/${id}/status`,
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
        <h3>Gua Raksha Sahayog</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setFormData(!formData)}
        >
          <i className="fa fa-plus"></i> {formData ? "Close Form" : "Add Gua Raksha Sahayog"}
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
                  <label className="form-label">Title Emoji Start</label>
                  <input
                    type="text"
                    name="titleEmojiStart"
                    className="form-control"
                    value={formData.titleEmojiStart}
                    onChange={handleChange}
                  />
                </div>
                 

                 <div className="col-md-3">
                  <label className="form-label">Title Text</label>
                  <input
                    type="text"
                    name="titleText"
                    className="form-control"
                    value={formData.titleText}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Title Emoji End</label>
                  <input
                    type="text"
                    name="titleEmojiEnd"
                    className="form-control"
                    value={formData.titleEmojiEnd}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">line1</label>
                  <input
                    type="text"
                    name="line1"
                    className="form-control"
                    value={formData.line1}
                    onChange={handleChange}
                  />
                </div>
                  
                 </div>
                 <div className="row mb-3">
                  <div className="col-md-3">
                  <label className="form-label">line2</label>
                  <input
                    type="text"
                    name="line2"
                    className="form-control"
                    value={formData.line2}
                    onChange={handleChange}
                  />
                </div>
                  <div className="col-md-3">
                  <label className="form-label">line3</label>
                  <input
                    type="text"
                    name="line3"
                    className="form-control"
                    value={formData.line3}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Quote</label>
                  <input
                    type="text"
                    name="quote"
                    className="form-control"
                    value={formData.quote}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">Highlight</label>
                  <input
                    type="text"
                    name="highlight"
                    className="form-control"
                    value={formData.highlight}
                    onChange={handleChange}
                  />
                </div>
                </div>
                  <div className="row mb-3">
                 <div className="col-md-3">
                  <label className="form-label">Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    className="form-control"
                    value={formData.buttonText}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col-md-3">
                  <label className="form-label">button Link</label>
                  <input
                    type="text"
                    name="buttonLink"
                    className="form-control"
                    value={formData.buttonLink}
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
        <div className="card-header">Bageshwer Dham List</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Title Emoji Start</th>
                 <th>Title Text</th>
                  <th>Title Emoji End</th>
                  <th>line1</th>
                  <th>Line2</th>
                  <th>Line3</th>
                <th>Quote</th>
                <th>Highlight</th>
                <th>Button Text</th>
                <th>Button Link</th>
                <th>Creation Date</th>
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
                    <td>{item.titleEmojiStart}</td>
                        <td>{item.titleText}</td>
                         <td>{item.titleEmojiEnd}</td>
                    <td>{item.line1}</td>
                     <td>{item.line2}</td>
                      <td>{item.line3}</td>
                    <td>{item.quote}</td>
                     <td>{item.highlight}</td>
                     <td>{item.buttonText}</td>
                     <td>{item.buttonLink}</td>

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
                <h5 className="modal-title">Edit Gua Raksha Sahayog</h5>
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
                      <label className="form-label">Title Emoji Start</label>
                      <input
                        type="text"
                        name="titleEmojiStart"
                        className="form-control"
                        value={formData.titleEmojiStart}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Title Text</label>
                      <input
                        type="text"
                        name="titleText"
                        className="form-control"
                        value={formData.titleText}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Additional Info</label>
                      <input
                        type="text"
                        name="additional_info"
                        className="form-control"
                        value={formData.additional_info}
                        onChange={handleChange}
                      />
                    </div> 

                    <div className="col-md-3">
                      <label className="form-label">Title Emoji End</label>
                      <input
                        type="text"
                        name="titleEmojiEnd"
                        className="form-control"
                        value={formData.titleEmojiEnd}
                        onChange={handleChange}
                      />
                    </div> 
                    

                    
                    
                  </div>
                  <div className="row mb-3">
                     <div className="col-md-3">
                      <label className="form-label">Line1</label>
                      <input
                        type="text"
                        name="line1"
                        className="form-control"
                        value={formData.line1}
                        onChange={handleChange}
                      />
                    </div> 
                     <div className="col-md-3">
                      <label className="form-label">Line2</label>
                      <input
                        type="text"
                        name="line2"
                        className="form-control"
                        value={formData.line2}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Line3</label>
                      <input
                        type="text"
                        name="line3"
                        className="form-control"
                        value={formData.line3}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Quote</label>
                      <input
                        type="text"
                        name="quote"
                        className="form-control"
                        value={formData.quote}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Highlight</label>
                      <input
                        type="text"
                        name="highlight"
                        className="form-control"
                        value={formData.highlight}
                        onChange={handleChange}
                      />
                    </div> 
                    <div className="col-md-3">
                      <label className="form-label">Button Text</label>
                      <input
                        type="text"
                        name="buttonText"
                        className="form-control"
                        value={formData.buttonText}
                        onChange={handleChange}
                      />
                    </div> 
                     <div className="col-md-3">
                      <label className="form-label">Button Link</label>
                      <input
                        type="text"
                        name="buttonLink"
                        className="form-control"
                        value={formData.buttonLink}
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

export default GuaRakshaSahayog;
