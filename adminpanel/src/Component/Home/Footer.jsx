import React, { useState, useEffect } from "react";
import axios from "axios";

const Footer = ({ BASE_URL }) => {
  const [formData, setFormData] = useState({
    logo: null,
    description: "",
    socialLinks: [{ icon: "facebook", url: "", youtube: "youtube", instagram: "instagram", twitter: "twitter", linkedin: "linkedin" }],
    quickLinks: [{ label: "About Us", url: "" }],
    creation_date: "",
    created_by: "admin",
    status: "active",
  });

  const [footers, setFooters] = useState([]); // array of footer records
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Helper to ensure array
  const ensureArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  // Fetch all footers
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/selectfooter`, { headers: { apikey: "12345" } })
      .then((res) => {
        if (res.data) {
          const dataArray = Array.isArray(res.data) ? res.data : [res.data];
          const processedData = dataArray.map((item) => ({
            ...item,
            socialLinks: ensureArray(item.socialLinks),
            quickLinks: ensureArray(item.quickLinks),
          }));
          setFooters(processedData);
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [BASE_URL]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo") setFormData({ ...formData, logo: files[0] });
    else setFormData({ ...formData, [name]: value });
  };

  const handleSocialChange = (index, e) => {
    const newLinks = [...formData.socialLinks];
    newLinks[index][e.target.name] = e.target.value;
    setFormData({ ...formData, socialLinks: newLinks });
  };

  const handleQuickChange = (index, e) => {
    const newLinks = [...formData.quickLinks];
    newLinks[index][e.target.name] = e.target.value;
    setFormData({ ...formData, quickLinks: newLinks });
  };

  const addSocialLink = () =>
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { icon: "", url: "" }],
    });

  const addQuickLink = () =>
    setFormData({
      ...formData,
      quickLinks: [...formData.quickLinks, { label: "", url: "" }],
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      if (formData.logo) fd.append("logo", formData.logo);
      fd.append("description", formData.description);
      fd.append("socialLinks", JSON.stringify(formData.socialLinks));
      fd.append("quickLinks", JSON.stringify(formData.quickLinks));
      fd.append("creation_date", formData.creation_date);
      fd.append("created_by", formData.created_by);
      fd.append("status", formData.status);

      if (editingId) {
        const res = await axios.put(
          `${BASE_URL}/api/updatefooter/${editingId}`,
          fd,
          { headers: { apikey: "12345", "Content-Type": "multipart/form-data" } }
        );

        const updatedRecord = {
          ...res.data.record,
          socialLinks: ensureArray(res.data.record.socialLinks),
          quickLinks: ensureArray(res.data.record.quickLinks),
        };

        setFooters((prev) =>
          prev.map((f) => (f.id === editingId ? updatedRecord : f))
        );
      } else {
        const res = await axios.post(`${BASE_URL}/api/insertfooter`, fd, {
          headers: { apikey: "12345", "Content-Type": "multipart/form-data" },
        });

        const newRecord = {
          ...formData,
          id: res.data.id,
          socialLinks: ensureArray(formData.socialLinks),
          quickLinks: ensureArray(formData.quickLinks),
        };

        setFooters((prev) => [...prev, newRecord]);
      }

      // Reset form
      setFormData({
        logo: null,
        description: "",
        socialLinks: [{ icon: "facebook", url: "", youtube: "youtube", instagram: "instagram", twitter: "twitter", linkedin: "linkedin" }],
        quickLinks: [{ label: "About Us", url: "" }],
        creation_date: "",
        created_by: "admin",
        status: "active",
      });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving:", err.response?.data || err.message);
      alert("Error saving data");
    }
  };

  const handleEdit = (footer) => {
    setEditingId(footer.id);
    setFormData({
      logo: null,
      description: footer.description || "",
      socialLinks: ensureArray(footer.socialLinks),
      quickLinks: ensureArray(footer.quickLinks),
      creation_date: footer.creation_date?.split("T")[0] || "",
      created_by: footer.created_by || "admin",
      status: footer.status || "active",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/api/deletefooter/${id}`, {
        headers: { apikey: "12345" },
      });
      if (res.data.success) {
        setFooters((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting record");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/api/statusfooter/${id}/status`,
        {},
        { headers: { apikey: "12345" } }
      );
      setFooters((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: res.data.status } : f))
      );
    } catch (err) {
      console.error("Status error:", err);
    }
  };

  return (
    <div className="top-banner">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Footer Section</h3>
        <button
          className="btn btn-success btn-sm"
          onClick={() => { setShowForm((prev) => !prev); setEditingId(null); }}
        >
          {showForm ? "Close Form" : "Add Footer Section"}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-header">Footer Form</div>
          <div className="card-body">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row mb-3">
                <div className="col">
                  <label>Logo</label>
                  <input type="file" name="logo" className="form-control" onChange={handleChange} />
                </div>
                <div className="col">
                  <label>Description</label>
                  <textarea cols="4" rows="4" name="description" className="form-control" value={formData.description} onChange={handleChange} />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label>Social Links</label>
                  {formData.socialLinks.map((link, idx) => (
                    <div key={idx} className="d-flex gap-2 mb-2">
                      <input type="text" name="icon" placeholder="Icon" value={link.icon} className="form-control" onChange={(e) => handleSocialChange(idx, e)} />
                      <input type="text" name="url" placeholder="URL" value={link.url} className="form-control" onChange={(e) => handleSocialChange(idx, e)} />
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addSocialLink}>Add Social</button>
                </div>

                <div className="col">
                  <label>Quick Links</label>
                  {formData.quickLinks.map((link, idx) => (
                    <div key={idx} className="d-flex gap-2 mb-2">
                      <input type="text" name="label" placeholder="Label" value={link.label} className="form-control" onChange={(e) => handleQuickChange(idx, e)} />
                      <input type="text" name="url" placeholder="URL" value={link.url} className="form-control" onChange={(e) => handleQuickChange(idx, e)} />
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-secondary" onClick={addQuickLink}>Add Quick</button>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="submit" className="btn btn-primary">{editingId ? "Update" : "Submit"}</button>
                <button type="button" className="btn btn-danger" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">Footer List</div>
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Description</th>
                <th>Social Links</th>
                <th>Quick Links</th>
                <th>Created By</th>
                <th>Publish Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {footers.length > 0 ? footers.map((f, idx) => (
                <tr key={f.id}>
                  <td>{idx + 1}</td>
                  <td>{f.logo && <img src={`${BASE_URL}${f.logo}`} width="100" alt="logo" />}</td>
                  <td>{f.description}</td>
                  <td>{ensureArray(f.socialLinks).map((l,i)=><div key={i}>{l.icon}: {l.url}</div>)}</td>
                  <td>{ensureArray(f.quickLinks).map((l,i)=><div key={i}>{l.label}: {l.url}</div>)}</td>
                  <td>{f.created_by}</td>
                  <td>{f.creation_date ? new Date(f.creation_date).toLocaleDateString() : "-"}</td>
                  <td>
                    <button className={`btn btn-sm ${f.status==="active"?"btn-success":"btn-danger"}`} onClick={()=>toggleStatus(f.id)}>{f.status}</button>
                  </td>
                  <td>
                    <button className="btn btn-info btn-sm me-1" onClick={()=>handleEdit(f)}>Edit</button>
                    <button className="btn btn-warning btn-sm" onClick={()=>handleDelete(f.id)}>Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="text-center">No data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Footer;
