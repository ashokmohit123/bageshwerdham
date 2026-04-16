import React, { useState, useEffect } from "react";
import axios from "axios";

const AnnapurnaKichenSupport = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
     title: "",
    description: "",
    info_cards: [""],
    highlight: "",
    cta_text: "",
    cta_link:"",
    quote:"",
    sub_quote:"",
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [eventsslide, setEventsslide] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  

  // ========================================================
  // PARAGRAPH HANDLERS
  // ========================================================

  const handleInfoCardsChange = (index, value) => {
    const newParas = [...formData.info_cards];
    newParas[index] = value;
    setFormData((prev) => ({ ...prev, info_cards: newParas }));
  };

  const addInfoCards = () => {
    setFormData((prev) => ({ ...prev, info_cards: [...prev.info_cards, ""] }));
  };

  const removeInfoCards = (index) => {
    const newParas = formData.info_cards.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, info_cards: newParas }));
  };

  // ========================================================
  // SIMPLE INPUT CHANGE HANDLER
  // ========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ========================================================
  // SUBMIT FORM
  // ========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    fd.append("title", formData.title);
    fd.append("info_cards", JSON.stringify(formData.info_cards));
    fd.append("description", formData.description);
    fd.append("highlight", formData.highlight);
    fd.append("cta_text", formData.cta_text);
    fd.append("cta_link", formData.cta_link);
    fd.append("quote", formData.quote);
    fd.append("sub_quote", formData.sub_quote);
    fd.append("creation_date", formData.creation_date);
    fd.append("created_by", formData.created_by);
    fd.append("status", formData.status);

    try {
      let res;
      const apiKey = "12345";

      if (editingId) {
        res = await axios.put(
          `${BASE_URL}/api/updateannapurnakitchen_support/${editingId}`,
          fd,
          { headers: { apikey: apiKey } }
        );

        setEventsslide((prev) =>
          prev.map((item) => (item.id === editingId ? res.data : item))
        );

        alert("Updated Successfully");
        setShowEditModal(false);
      } else {
        res = await axios.post(
          `${BASE_URL}/api/insertannapurnakitchen_support`,
          fd,
          { headers: { apikey: apiKey } }
        );

        setEventsslide((prev) => [...prev, res.data]);
        alert("Saved Successfully");
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // RESET FORM
  const resetForm = () => {
    setFormData({
      title: "",
      description:"",
      highlight:"",
      info_cards: [""],
      cta_text: "",
      cta_link: "",
      quote:"",
      sub_quote:"",
      creation_date: "",
      created_by: "admin",
      status: "active",
    });
    setEditingId(null);
    setShowForm(false);
  };

  // FETCH DATA
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectannapurnakitchen_support`, {
        headers: { apikey: "12345" },
      })
      .then((res) => setEventsslide(res.data))
      .catch((err) => console.log(err));
  }, [BASE_URL]);

  // LOAD DATA IN EDIT FORM
  const handleEdit = (row) => {
    setEditingId(row.id);

    setFormData({
      title: row.title,
      description: row.description,
      highlight: row.highlight,
      info_cards:
        typeof row.info_cards === "string"
          ? JSON.parse(row.info_cards)
          : row.info_cards || [""],

      cta_text: row.cta_text,
      cta_link: row.cta_link,
      quote: row.quote,
      sub_quote: row.sub_quote,
      creation_date: row.creation_date?.split("T")[0] || "",
      created_by: row.created_by,
      status: row.status,
    });

    setShowEditModal(true);
  };

  // DELETE RECORD
  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanently?")) return;

    try {
      await axios.delete(
        `${BASE_URL}/api/deleteannapurnakitchen_support/${id}`,
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.log(err);
      alert("Delete failed");
    }
  };

  // TOGGLE STATUS
  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusannapurnakitchen_support/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );

      setEventsslide((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: res.data.status } : p))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // ========================================================
  // UI STARTS HERE
  // ========================================================

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between mb-3">
        <h3>Annapurna Rasoi Support</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Form" : "Add Data"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Add / Edit Data</div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
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
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Highlight</label>
                  <input
                    type="text"
                    name="highlight"
                    className="form-control"
                    value={formData.highlight}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Cta Text</label>
                  <input
                    type="text"
                    name="cta_text"
                    className="form-control"
                    value={formData.cta_text}
                    onChange={handleChange}
                  />
                </div>

              
              </div>

              {/* Sections */}
              <div className="row mb-3">
                <div className="col-md-5">
                  <label>info Cards</label>

                  {formData.info_cards.map((para, index) => (
                    <div key={index} className="d-flex gap-2 mb-2">
                      <textarea
                        value={para}
                        rows={2}
                        className="form-control"
                        onChange={(e) =>
                          handleInfoCardsChange(index, e.target.value)
                        }
                      />
                      {formData.info_cards.length > 1 && (
                        <button
                          className="btn btn-danger"
                          type="button"
                          onClick={() => removeInfoCards(index)}
                        >
                          ✖
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addInfoCards}
                  >
                    ➕ Add InfoCards
                  </button>
                </div>

               

                <div className="col">
                  <label>Cta Link</label>
                  <input
                    type="text"
                    name="cta_link"
                    className="form-control"
                    value={formData.cta_link}
                    onChange={handleChange}
                  />
                </div>
                 <div className="col">
                  <label>Quote</label>
                  <input
                    type="text"
                    name="quote"
                    value={formData.quote}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                <div className="col">
                  <label>Sub Quote</label>
                  <input
                    type="text"
                    name="sub_quote"
                    value={formData.sub_quote}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="row mb-3">
               

              

                <div className="col-md-3">
                  <label>Published Date</label>
                  <input
                    type="date"
                    name="creation_date"
                    value={formData.creation_date}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-primary" type="submit">
                  {editingId ? "Update" : "Submit"}
                </button>
                <button className="btn btn-danger" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card">
        <div className="card-header">Annapurna Kichen Rasoi</div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
              
                <th>Title</th>
                <th>Description</th>
                <th>Highlight</th>
                <th>Info Cards</th>
                <th>Cta Text</th>
              
                <th>Cta Link</th>
                <th>Quote</th>
                <th>Sub Quote</th>
              
                <th>Publish Date</th>
                <th>Created By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {eventsslide.length ? (
                eventsslide.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                  

                    <td>{item.title}</td>
                     <td>{item.description}</td>
                      <td>{item.highlight}</td>

                    <td>
                      {Array.isArray(item.info_cards)
                        ? item.info_cards.join(" | ")
                        : item.info_cards}
                    </td>

                  
                    <td>{item.cta_text}</td>
                    <td>{item.cta_link}</td>
                    <td>{item.quote}</td>
                    <td>{item.sub_quote}</td>
                   

                    <td>
                      {item.creation_date
                        ? new Date(item.creation_date).toLocaleDateString()
                        : "-"}
                    </td>

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
                        {item.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td>
                      <button
                        className="btn btn-info btn-sm me-1"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center">
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
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg" style={{ maxWidth: "1200px" }}>
            <div className="modal-content">
              <div className="modal-header">
                <h5>Anna Purna Rasoi Kichen</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {/* Images */}
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
                      <label>Description</label>
                      <input
                        type="text"
                        name="description"
                        className="form-control"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                      <div className="col">
                      <label>Highlight</label>
                      <input
                        type="text"
                        name="highlight"
                        className="form-control"
                        value={formData.highlight}
                        onChange={handleChange}
                      />
                    </div>
                      <div className="col">
                      <label>Cta Text</label>
                      <input
                        type="text"
                        name="cta_text"
                        className="form-control"
                        value={formData.cta_text}
                        onChange={handleChange}
                      />
                    </div>

                   
                  </div>

                  {/* info_cards */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label>Info Cards</label>

                      {formData.info_cards.map((para, index) => (
                        <div key={index} className="d-flex gap-2 mb-2">
                          <textarea
                            rows={2}
                            value={para}
                            className="form-control"
                            onChange={(e) =>
                              handleInfoCardsChange(index, e.target.value)
                            }
                          />
                          {formData.info_cards.length > 1 && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeInfoCards(index)}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      ))}

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addInfoCards}
                      >
                        ➕ Add InfoCards
                      </button>
                    </div>

                    <div className="col">
                      <label>Cta Link</label>
                      <input
                        type="text"
                        name="cta_link"
                        value={formData.cta_link}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col">
                      <label>Quote</label>
                      <input
                        type="text"
                        name="quote"
                        value={formData.quote}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div className="col">
                      <label>Sub Quote</label>
                      <input
                        type="text"
                        name="sub_quote"
                        value={formData.sub_quote}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                   
                  </div>

                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn btn-primary">Update</button>
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

export default AnnapurnaKichenSupport;
