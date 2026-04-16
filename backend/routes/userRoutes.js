// routes/userRoutes.js
import express, { Router } from "express";
import db from "../db.js";
import { checkApiKey, upload } from "../middlewere/checkUserKey.js";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import cors from "cors";



const router = express.Router();

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // allow frontend requests
// payment gateway integration start here
// ✅ Create Razorpay instance once
const razorpay = new Razorpay({
  key_id: "rzp_live_N5c7umzNP5zH1S",
  key_secret: "gDfNmEddWUleQ0DsGlEAkFKH",
});


// Create Order
router.post("/createOrder", async (req, res) => {
  try {
    const { projectId, amount } = req.body;

    if (!projectId || !amount) {
      return res.status(400).json({ error: "projectId and amount are required" });
    }

    const [rows] = await db.query("SELECT * FROM donation WHERE id=?", [projectId]);
    const project = rows[0];

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: "receipt_" + new Date().getTime(),
      notes: { projectId },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      project,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

// Save Payment
router.post("/savePayment", async (req, res) => {
  try {
    const { projectId, razorpay_payment_id, razorpay_order_id, amount, status } = req.body;

    await db.query(
      "INSERT INTO donations_payments (project_id, razorpay_payment_id, razorpay_order_id, amount, status) VALUES (?, ?, ?, ?, ?)",
      [projectId, razorpay_payment_id, razorpay_order_id, amount, status]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Save payment error:", err);
    res.status(500).json({ error: "Failed to save payment" });
  }
});

// ✅ Get payment details by payment_id
router.get("/api/payment/:paymentId", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;

    const payment = await razorpay.payments.fetch(paymentId);

    res.json(payment); // full details
  } catch (err) {
    console.error("Payment fetch error:", err);
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
});
// payment gateway integration close here



// ✅ Get all top banners
router.get("/topbanner", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM topbanner");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Database fetch failed!" });
  }
});

// ✅ Add Top Banner API
router.post(
  "/topbanner",
  checkApiKey,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "video_url", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, video_title, created_by, status, base_path, directory_location, last_modify } = req.body;
      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      if (!title || !req.files?.banner || !req.files?.video_url) {
        return res.status(400).json({ error: "Title, Banner and Video are required!" });
      }

      const banner = "/uploads/" + req.files.banner[0].filename;
      const video_url = "/uploads/" + req.files.video_url[0].filename;

      const sql = `
        INSERT INTO topbanner 
        (title, banner, video_url, video_title, created_by, creation_date, status, base_path, directory_location, last_modify) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title, banner, video_url, video_title, created_by, creation_date,
        status, base_path, directory_location, last_modify
      ]);

      res.json({
        success: true,
        id: result.insertId,
        banner,
        video_url
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



// ✅ UPDATE route
router.put(
  "/topbanner/:id",
  checkApiKey,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "video_url", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, video_title, creation_date, created_by, status } = req.body;

      const [rows] = await db.query("SELECT * FROM topbanner WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (video_title) { updateFields.push("video_title=?"); values.push(video_title); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      if (req.files?.banner) {
        updateFields.push("banner=?");
        values.push("/uploads/" + req.files.banner[0].filename);
      }
      if (req.files?.video_url) {
        updateFields.push("video_url=?");
        values.push("/uploads/" + req.files.video_url[0].filename);
      }

      values.push(id);

      const sql = `UPDATE topbanner SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // ✅ Fetch updated row
      const [updated] = await db.query("SELECT * FROM topbanner WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Banner updated successfully!",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/topbanner/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM topbanner WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM topbanner WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Banner deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});


// ✅ Update status API
router.patch("/topbanner:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [result] = await db.promise().query(
      "UPDATE topbanner SET status=? WHERE id=?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ success: true, message: "Status updated!" });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});



// ✅ Toggle Status API
router.patch("/topbanner/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM topbanner WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE topbanner SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


////////////////////////////////////////Events that liberate Carsoual start //////////////////////

// ✅ Add Top Events API
router.post(
  "/insertevents",
  checkApiKey,
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "video_url", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, status, created_by } = req.body;
      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      if (!title || !req.files?.image_url || !req.files?.video_url) {
        return res.status(400).json({ error: "title, image_url and Video are required!" });
      }

      const image_url = "/uploads/" + req.files.image_url[0].filename;
      const video_url = "/uploads/" + req.files.video_url[0].filename;

      const sql = `
        INSERT INTO events
        (title, image_url, video_url, description,status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title, image_url, video_url, description, status, created_by, creation_date
      ]);

      res.json({
        success: true,
        id: result.insertId,
        image_url,
        video_url
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



// ✅ Get all events
router.get("/selectevents", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM  events");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Database fetch failed!" });
  }
});



// ✅ UPDATE route
router.put(
  "/updateevents/:id",
  checkApiKey,
  upload.fields([
    { name: "image_url", maxCount: 1 },
    { name: "video_url", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, creation_date, created_by, status } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM events WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      // if (image_url) { updateFields.push("image_url=?"); values.push(image_url); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      if (req.files?.image_url) {
        updateFields.push("image_url=?");
        values.push("/uploads/" + req.files.image_url[0].filename);
      }
      if (req.files?.video_url) {
        updateFields.push("video_url=?");
        values.push("/uploads/" + req.files.video_url[0].filename);
      }

      values.push(id);

      const sql = `UPDATE events SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }
 const [updated] = await db.query("SELECT * FROM events WHERE id=?", [id]);

    return res.json({
      success: true,
      message: "✅ Event updated successfully!",
      data: updated[0],   // 👈 send only one object
    });

    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


// ✅ Delete route
router.delete("/selectevents/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM events WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM events WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Events deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/selectevents/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM events WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE events SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Events that liberate Carsoual close //////////////////////




////////////////////////////////////////Live Katha start here //////////////////////

// ✅ Add Top Live Katha API
// ✅ Add Top Live Katha API
router.post(
  "/insertlivekatha",
  checkApiKey,
  upload.fields([
    { name: "video_url", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, status, created_by } = req.body;
      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      if (!title || !req.files?.video_url) {
        return res.status(400).json({ error: "Title and Video are required!" });
      }

      const video_url = "/uploads/" + req.files.video_url[0].filename;

      const sql = `
        INSERT INTO livekatha
        (title, video_url, description, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        video_url,
        description,
        status,
        created_by,
        creation_date
      ]);

      res.json({
        success: true,
        id: result.insertId,
        video_url
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);




// ✅ Get all events
router.get("/selectlivekatha", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM  livekatha");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Database fetch failed!" });
  }
});



// ✅ UPDATE route
router.put(
  "/insertlivekatha/:id",
  checkApiKey,
  upload.fields([{ name: "video_url", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, creation_date, created_by, status } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM livekatha WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      // ✅ Handle video_url update
      if (req.files && req.files.video_url && req.files.video_url.length > 0) {
        updateFields.push("video_url=?");
        values.push("/uploads/" + req.files.video_url[0].filename);
      } else {
        // keep old video_url if not updating
        updateFields.push("video_url=?");
        values.push(rows[0].video_url);
      }

      values.push(id);

      const sql = `UPDATE livekatha SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      res.json({
        success: true,
        message: "✅ live katha updated successfully!",
        data: { ...rows[0], ...req.body, video_url: values[values.length - 2] } // return updated row
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/selectlivekatha/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM livekatha WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM livekatha WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Live Katha deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/selectlivekatha/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM livekatha WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE livekatha SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


////////////////////////////////////////Live Katha close here //////////////////////



////////////////////////////////////////Life data pillars start here //////////////////////


// ✅ Add Top Life Data Pillar API
router.post(
  "/insertlifedatapillars",
  checkApiKey,
  upload.fields([{ name: "image_url", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, key_name, status, created_by, creation_date } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      if (!req.files?.image_url) {
        return res.status(400).json({ error: "Image is required" });
      }

      const image_url = "/uploads/" + req.files.image_url[0].filename;

      const sql = `
        INSERT INTO lifedatapillars
        (title, key_name, image_url, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        key_name,
        image_url,
        status ?? "active",
        created_by ?? "admin",
        creation_date ?? null,
      ]);

      res.json({
        success: true,
        id: result.insertId,
        image_url,
      });

    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({
        error: "Insert failed!",
        details: err.message,
      });
    }
  }
);



router.get("/selectlifedatapillars", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM lifedatapillars");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
router.put(
  "/insertlifedatapillars/:id",
  checkApiKey,
  upload.fields([{ name: "image_url", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, key_name, creation_date, created_by, status } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM lifedatapillars WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (key_name) { updateFields.push("key_name=?"); values.push(key_name); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      if (req.files?.image_url) {
        updateFields.push("image_url=?");
        values.push("/uploads/" + req.files.image_url[0].filename);
      }

      values.push(id);

      const sql = `UPDATE lifedatapillars SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // ✅ Fetch updated record
      const [updated] = await db.query("SELECT * FROM lifedatapillars WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ data life pillars updated successfully!",
        data: updated[0]   // 👈 send updated row back
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


// ✅ Delete route
router.delete("/deletelifedatapillars/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM lifedatapillars WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM lifedatapillars WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Life Data Pillar deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statuslifedatapillars/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM lifedatapillars WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE lifedatapillars SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Life data pillars close here //////////////////////

////////////////////////////////////////Testimonials routes start here //////////////////////


// ✅ Add Testimonial API
router.post(
  "/inserttestimonials",
  checkApiKey,
    upload.fields([
    { name: "bgImage", maxCount: 1 },
    { name: "avatar", maxCount: 1 }
  ]),

  async (req, res) => {
    try {
      const { name, role, quote, description, status, created_by } = req.body;
      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      // ✅ Validation
      if (!name || !req.files?.bgImage || !req.files?.avatar) {
        return res.status(400).json({ error: "Name, bgImage, and avatar are required!" });
      }

      // ✅ Uploaded file paths
      const bgImage = "/uploads/" + req.files.bgImage[0].filename;
      const avatar = "/uploads/" + req.files.avatar[0].filename;

      const sql = `
        INSERT INTO testimonials
        (name, role, quote, description, bgImage, avatar, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        name,
        role,
        quote,
        description,
        bgImage,
        avatar,
        status,
        created_by,
        creation_date
      ]);

      // ✅ Return correct response
      res.json({
        success: true,
        id: result.insertId,
        bgImage,
        avatar
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);




router.get("/selecttestimonials", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM testimonials");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
router.put("/updatetestimonials/:id", upload.fields([
  { name: "bgImage", maxCount: 1 },
  { name: "avatar", maxCount: 1 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, quote, description, creation_date, created_by, status } = req.body;

    // ✅ Build update object
    const updateData = {
      name,
      role,
      quote,
      description,
      creation_date,
      created_by,
      status,
    };

    // ✅ Attach files if uploaded
    if (req.files?.bgImage) {
      updateData.bgImage = "/uploads/" + req.files.bgImage[0].filename;
    }
    if (req.files?.avatar) {
      updateData.avatar = "/uploads/" + req.files.avatar[0].filename;
    }

    // ✅ Run update query
    await db.query("UPDATE testimonials SET ? WHERE id = ?", [updateData, id]);

    // ✅ Fetch updated row
    const [rows] = await db.query("SELECT * FROM testimonials WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "✅ Testimonial updated successfully!",
      data: rows[0], // 👈 send updated testimonial
    });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, error: "Update failed" });
  }
});



// ✅ Delete route
router.delete("/deletetestimonials/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM testimonials WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM testimonials WHERE id=?", [id]);
    res.json({ success: true, message: "✅ testimonials deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statustestimonials/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM testimonials WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE testimonials SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Testimonials routes close here //////////////////////


////////////////////////////////////////Home About Us start here ///////////////////////////

// ✅ Add Home About Us API
router.post(
  "/inserthomeabout",
  checkApiKey,
  upload.fields([
    { name: "imageSrc", maxCount: 1 },
    { name: "logos", maxCount: 10 }, // multiple logos if needed
    { name: "videoSrc", maxCount: 1 } // single video if needed
  ]),

  async (req, res) => {
    try {
      const {
        heading,
        description,
        buttonText,
        eventTitle,
        eventLink,
        resolutionsHeading,
        resolutionsDescription,
        stats,
        status,
        created_by
      } = req.body;

      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      // ✅ Validation
      if (!heading || !req.files?.imageSrc) {
        return res.status(400).json({ error: "Heading and imageSrc are required!" });
      }

      // ✅ Uploaded file paths
      const imageSrc = "/uploads/" + req.files.imageSrc[0].filename;
      const videoSrc = "/uploads/" + req.files.videoSrc[0].filename;
      const logos = "/uploads/" + req.files.logos[0].filename;

    

      const sql = `
        INSERT INTO homeabout
        (heading, imageSrc, description, buttonText, logos, videoSrc, eventTitle, eventLink, resolutionsHeading, resolutionsDescription, stats, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        heading,
        imageSrc,
        description,
        buttonText,
        logos,
        videoSrc,
        eventTitle,
        eventLink,
        resolutionsHeading,
        resolutionsDescription,
        stats,
        status,
        created_by,
        creation_date
      ]);

      // ✅ Return correct response
      res.json({
        success: true,
        id: result.insertId,
        imageSrc,
        logos,
        videoSrc
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);




router.get("/selecthomeabout", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM homeabout");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
router.put(
  "/updatehomeabout/:id",
  checkApiKey,
  upload.fields([
    { name: "imageSrc", maxCount: 1 },
    { name: "videoSrc", maxCount: 1 },
    { name: "logos", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        heading,
        description,
        buttonText,
        eventTitle,
        eventLink,
        resolutionsHeading,
        resolutionsDescription,
        stats,
        creation_date,
        created_by,
        status,
      } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM homeabout WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (heading) { updateFields.push("heading=?"); values.push(heading); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (buttonText) { updateFields.push("buttonText=?"); values.push(buttonText); }
      if (eventTitle) { updateFields.push("eventTitle=?"); values.push(eventTitle); }
      if (eventLink) { updateFields.push("eventLink=?"); values.push(eventLink); }
      if (resolutionsHeading) { updateFields.push("resolutionsHeading=?"); values.push(resolutionsHeading); }
      if (resolutionsDescription) { updateFields.push("resolutionsDescription=?"); values.push(resolutionsDescription); }
      if (stats) { updateFields.push("stats=?"); values.push(stats); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      // ✅ File uploads
      if (req.files?.imageSrc) {
        updateFields.push("imageSrc=?");
        values.push("/uploads/" + req.files.imageSrc[0].filename);
      }

      if (req.files?.videoSrc) {
        updateFields.push("videoSrc=?");
        values.push("/uploads/" + req.files.videoSrc[0].filename);
      }

      if (req.files?.logos) {
        updateFields.push("logos=?");
        values.push("/uploads/" + req.files.logos[0].filename);
      }

      // ✅ Final check
      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update!" });
      }

      values.push(id);

      const sql = `UPDATE homeabout SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // ✅ Fetch updated row and return it
      const [updatedRows] = await db.query("SELECT * FROM homeabout WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Homeabout updated successfully!",
        data: updatedRows[0],   // 👈 send back updated record
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


// ✅ Delete route
router.delete("/deletehomeabout/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM homeabout WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM testimonials WHERE id=?", [id]);
    res.json({ success: true, message: "✅ testimonials deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statushomeabout/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM homeabout WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE homeabout SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Home About Us close here ///////////////////////////

////////////////////////////////////////Home Favorite Slider start here ///////////////////////////


// ✅ Add Favorite Slider API
router.post(
  "/insertfavoriteslider",
  checkApiKey,
  upload.fields([
    { name: "img_src", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, description, status, created_by } = req.body;
      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      if (!title || !req.files?.img_src || !req.files?.video) {
        return res.status(400).json({ error: "Title, img, and video are required!" });
      }

      const img_src = "/uploads/" + req.files.img_src[0].filename;
      const video = "/uploads/" + req.files.video[0].filename;

      const sql = `
        INSERT INTO favoriteslider
        (title, description, img_src, video, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        description,
        img_src,
        video,
        status,
        created_by,
        creation_date
      ]);

      // ✅ Fetch the inserted record
      const [rows] = await db.query("SELECT * FROM favoriteslider WHERE id=?", [result.insertId]);

      res.json({
        success: true,
        message: "✅ favoriteslider inserted successfully!",
        record: rows[0]   // send back full record
      });

    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);





router.get("/selectfavoriteslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM favoriteslider");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});



// ✅ UPDATE route
// ✅ Correct
router.put("/updatefavoriteslider/:id",
  checkApiKey,
  upload.fields([
    { name: "img_src", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, created_by } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM favoriteslider WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      let imgPath = rows[0].img_src;
      let videoPath = rows[0].video;

      if (req.files?.img_src) {
        imgPath = "/uploads/" + req.files.img_src[0].filename;
        updateFields.push("img_src=?");
        values.push(imgPath);
      }

      if (req.files?.video) {
        videoPath = "/uploads/" + req.files.video[0].filename;
        updateFields.push("video=?");
        values.push(videoPath);
      }

      values.push(id);

      const sql = `UPDATE favoriteslider SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM favoriteslider WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ favoriteslider updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);




// ✅ Delete route
router.delete("/deletefavoriteslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM favoriteslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM favoriteslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ favoriteslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statusfavoriteslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM favoriteslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE favoriteslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Home Favorite Slider close here ///////////////////////////


////////////////////////////////////////Upcoming Event start here ///////////////////////////

// ✅ Add Upcoming Events API
router.post(
  "/insertupcommingevents",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),

  async (req, res) => {
    try {
      const {
        title,
        event_date,  // 👈 from frontend
        place,
        timezone,
        status,
        created_by,
      } = req.body;

      // ✅ Validation
      if (!title || !req.files?.image || !event_date) {
        return res.status(400).json({ error: "Title, event_date and image are required!" });
      }

      // ✅ Uploaded file path
      const image = "/uploads/" + req.files.image[0].filename;

      // ✅ Convert event_date properly (from frontend input)
      const formattedEventDate = new Date(event_date)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // ✅ System-generated creation_date
      const creation_date = new Date().toISOString().slice(0, 19).replace("T", " ");

      const sql = `
        INSERT INTO upcommingevents
        (title, image, event_date, place, timezone, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        image,
        formattedEventDate, // 👈 correct
        place,
        timezone,
        status,
        created_by,
        creation_date,
      ]);

      console.log("✅ Inserted ID:", result.insertId);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          image,
          event_date: formattedEventDate,
          place,
          timezone,
          status,
          created_by,
          creation_date,
        },
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


router.get("/selectupcommingevents", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM upcommingevents");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});



// ✅ UPDATE route
// ✅ Correct
router.put("/updateupcommingevents/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, event_date, place, timezone, status, created_by } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM upcommingevents WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (event_date) { updateFields.push("event_date=?"); values.push(event_date); }
      if (place) { updateFields.push("place=?"); values.push(place); }
      if (timezone) { updateFields.push("timezone=?"); values.push(timezone); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      let imgPath = rows[0].image;

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE upcommingevents SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM upcommingevents WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ upcommingevents updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);




// ✅ Delete route
router.delete("/deleteupcommingevents/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM upcommingevents WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM upcommingevents WHERE id=?", [id]);
    res.json({ success: true, message: "✅ upcommingevents deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statusupcommingevents/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM upcommingevents WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE upcommingevents SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Upcomming Event close here ///////////////////////////


////////////////////////////////////////Gurudev Resolution start here ///////////////////////////
// ✅ Add Gurudev Resolution API
// ✅ Add Gurudev Resolution API
router.post(
  "/insertgurudevresolutions",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        stats,
        buttons,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!title || !req.files?.image || !description) {
        return res.status(400).json({ error: "Title, description and image are required!" });
      }

      const image = "/uploads/" + req.files.image[0].filename;
      const video = req.files.video ? "/uploads/" + req.files.video[0].filename : null;

      const sql = `
        INSERT INTO gurudevresolutions
        (title, description, image, video, stats, buttons, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        description,
        image,
        video,
        stats,
        buttons,
        status,
        created_by,
        creation_date
      ]);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          image,
          video,
          description,
          stats,
          buttons,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectgurudevresolutions", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gurudevresolutions");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
// ✅ Correct
router.put("/updategurudevresolutions/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, stats, buttons, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM gurudevresolutions WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (stats) { updateFields.push("stats=?"); values.push(stats); }
      if (buttons) { updateFields.push("buttons=?"); values.push(buttons); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }

      let imgPath = rows[0].image;

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }
      if (req.files?.video) {
        videoPath = "/uploads/" + req.files.video[0].filename;
        updateFields.push("video=?");
        values.push(videoPath);
      }

      values.push(id);

      const sql = `UPDATE gurudevresolutions SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM gurudevresolutions WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ gurudevresolutions updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deletegurudevresolutions/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM gurudevresolutions WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM gurudevresolutions WHERE id=?", [id]);
    res.json({ success: true, message: "✅ gurudevresolutions deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusgurudevresolutions/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM gurudevresolutions WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE gurudevresolutions SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


////////////////////////////////////////Gurudev Resolution close here ///////////////////////////


////////////////////////////////////////Gurudev Program Start here ///////////////////////////
// ✅ Add Gurudev Program API
router.post(
  "/insertgurudevprogram",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        category,
        place,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!title || !req.files?.image || !category) {
        return res.status(400).json({ error: "Title, category and image are required!" });
      }

      const image = "/uploads/" + req.files.image[0].filename;

      const sql = `
        INSERT INTO gurudevprogram
        (title, category, place, image, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        category,
        place,
        image,
        status,
        created_by,
        creation_date
      ]);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          image,
          category,
          place,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectgurudevprogram", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gurudevprogram");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});



// ✅ UPDATE route
// ✅ Correct
router.put("/updategurudevprogram/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, place, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM gurudevprogram WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (category) { updateFields.push("category=?"); values.push(category); }
      if (place) { updateFields.push("place=?"); values.push(place); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }

      let imgPath = rows[0].image;

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }
      

      values.push(id);

      const sql = `UPDATE gurudevprogram SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM gurudevprogram WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ gurudevprogram updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deletegurudevprogram/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM gurudevprogram WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM gurudevprogram WHERE id=?", [id]);
    res.json({ success: true, message: "✅ gurudevprogram deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusgurudevprogram/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM gurudevprogram WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE gurudevprogram SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});
////////////////////////////////////////Gurudev Program Close here ///////////////////////////

////////////////////////////////////////Podcast Section Start here ///////////////////////////
// ✅ Add Podcast Playlist API
router.post(
  "/insertpodcastplaylist",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        titleheading,
        explore_link,
        category,
        duration,
        date,
        audio,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!title || !req.files?.image || !category) {
        return res.status(400).json({ error: "Title, category and image are required!" });
      }

      const image = "/uploads/" + req.files.image[0].filename;

      const sql = `
        INSERT INTO podcastplaylist
        (title,titleheading, explore_link, category, duration, date, audio, image, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        titleheading,
        explore_link,
        category,
        duration,
        date,
        audio,
        image,
        status,
        created_by,
        creation_date
      ]);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          titleheading,
          explore_link,
          category,
          duration,
          date,
          audio,
          image,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectpodcastplaylist", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM podcastplaylist");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});



// ✅ UPDATE route
// ✅ Correct
router.put("/updatepodcastplaylist/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title,titleheading,explore_link, category, duration,date, audio, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM podcastplaylist WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (titleheading) { updateFields.push("titleheading=?"); values.push(titleheading); }
      if (explore_link) { updateFields.push("explore_link=?"); values.push(explore_link); }
      if (category) { updateFields.push("category=?"); values.push(category); }
      if (duration) { updateFields.push("duration=?"); values.push(duration); }
      if (date) { updateFields.push("date=?"); values.push(date); }
      if (audio) { updateFields.push("audio=?"); values.push(audio); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }

      let imgPath = rows[0].image;

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }
      

      values.push(id);

      const sql = `UPDATE podcastplaylist SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM podcastplaylist WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ podcastplaylist updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deletepodcastplaylist/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM podcastplaylist WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM podcastplaylist WHERE id=?", [id]);
    res.json({ success: true, message: "✅ podcastplaylist deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statuspodcastplaylist/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM podcastplaylist WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE podcastplaylist SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});
////////////////////////////////////////Podcast Section Close here ///////////////////////////

////////////////////////////////////////Bottom Landing Section Start here ///////////////////////////

// ✅ Add Bottom Landing Section API
router.post(
  "/insertbottomlandingsection",
  checkApiKey,
  upload.fields([
    { name: "backgroundImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        heading,
        subheading,
        buttonText,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!heading || !req.files?.backgroundImage) {
        return res.status(400).json({ error: "Heading, subheading, buttonText and backgroundImage are required!" });
      }

      const backgroundImage = "/uploads/" + req.files.backgroundImage[0].filename;

      const sql = `
        INSERT INTO bottomlandingsection
        (heading, subheading, buttonText, backgroundImage, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        heading,
        subheading,
        buttonText,
        backgroundImage,
        status,
        created_by,
        creation_date
      ]);
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          heading,
          subheading,
          buttonText,
          backgroundImage,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectbottomlandingsection", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM bottomlandingsection");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updatebottomlandingsection/:id",
  checkApiKey,
  upload.fields([
    { name: "backgroundImage", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { heading, subheading, buttonText, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM bottomlandingsection WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (heading) { updateFields.push("heading=?"); values.push(heading); }
      if (subheading) { updateFields.push("subheading=?"); values.push(subheading); }
      if (buttonText) { updateFields.push("buttonText=?"); values.push(buttonText); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].backgroundImage;

      if (req.files?.backgroundImage) {
        imgPath = "/uploads/" + req.files.backgroundImage[0].filename;
        updateFields.push("backgroundImage=?");
        values.push(imgPath);
      }
      

      values.push(id);

      const sql = `UPDATE bottomlandingsection SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM bottomlandingsection WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ bottomlandingsection updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deletebottomlandingsection/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM bottomlandingsection WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM bottomlandingsection WHERE id=?", [id]);
    res.json({ success: true, message: "✅ bottomlandingsection deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusbottomlandingsection/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM bottomlandingsection WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE bottomlandingsection SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

////////////////////////////////////////Bottom Landing Section Close here ///////////////////////////


////////////////////////////////////////Footer Section Start here ///////////////////////////

// ✅ Insert or Update Footer
router.post("/insertfooter", upload.single("logo"), async (req, res) => {
  const { description, socialLinks, quickLinks } = req.body;
  try {
    const logoPath = req.file ? "/uploads/" + req.file.filename : null;

    // Check if footer exists
    const [rows] = await db.query("SELECT * FROM footer LIMIT 1");

    if (rows.length > 0) {
      // Update existing
      const id = rows[0].id;
      await db.query(
        "UPDATE footer SET logo=?, description=?, socialLinks=?, quickLinks=? WHERE id=?",
        [
          logoPath || rows[0].logo,
          description,
          JSON.stringify(socialLinks || JSON.parse(rows[0].socialLinks)),
          JSON.stringify(quickLinks || JSON.parse(rows[0].quickLinks)),
          id,
        ]
      );
      res.json({ success: true, message: "Footer updated!" });
    } else {
      // Insert new
      const [result] = await db.query(
        "INSERT INTO footer (logo, description, socialLinks, quickLinks) VALUES (?, ?, ?, ?)",
        [
          logoPath,
          description,
          JSON.stringify(socialLinks || []),
          JSON.stringify(quickLinks || []),
        ]
      );
      res.json({ success: true, message: "Footer created!", id: result.insertId });
    }
  } catch (err) {
    console.error("Insert/Update Footer Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Get latest Footer
router.get("/selectfooter", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM footer ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) return res.json(null);

    const footer = {
      ...rows[0],
      socialLinks: JSON.parse(rows[0].socialLinks || "[]"),
      quickLinks: JSON.parse(rows[0].quickLinks || "[]"),
    };
    res.json(footer);
  } catch (err) {
    console.error("Fetch Footer Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Update Footer
router.put("/updatefooter/:id", upload.single("logo"), async (req, res) => {
  try {
    const { id } = req.params;
    const { description, socialLinks, quickLinks, status, created_by, creation_date } = req.body;

    const [rows] = await db.query("SELECT * FROM footer WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const updates = [];
    const values = [];

    if (description) { updates.push("description=?"); values.push(description); }
    if (socialLinks) { updates.push("socialLinks=?"); values.push(JSON.stringify(socialLinks)); }
    if (quickLinks) { updates.push("quickLinks=?"); values.push(JSON.stringify(quickLinks)); }
    if (status) { updates.push("status=?"); values.push(status); }
    if (created_by) { updates.push("created_by=?"); values.push(created_by); }
    if (creation_date) { updates.push("creation_date=?"); values.push(creation_date); }

    let logoPath = rows[0].logo;
    if (req.file) {
      logoPath = "/uploads/" + req.file.filename;
      updates.push("logo=?");
      values.push(logoPath);
    }

    values.push(id);
    await db.query(`UPDATE footer SET ${updates.join(", ")} WHERE id=?`, values);

    const [updated] = await db.query("SELECT * FROM footer WHERE id=?", [id]);
    res.json({ success: true, message: "Footer updated successfully!", record: updated[0] });
  } catch (err) {
    console.error("Update Footer Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Delete Footer
router.delete("/deletefooter/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM footer WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    await db.query("DELETE FROM footer WHERE id=?", [id]);
    res.json({ success: true, message: "Footer deleted successfully!" });
  } catch (err) {
    console.error("Delete Footer Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Toggle Status
router.patch("/statusfooter/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM footer WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await db.query("UPDATE footer SET status=? WHERE id=?", [newStatus, id]);
    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("Toggle Status Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

////////////////////////////////////////Footer Section Close here ///////////////////////////

////////////////////////////////////////Donate section start  here ///////////////////////////

// ✅ Insert donation
router.post(
  "/insertdonation",
  checkApiKey,
  upload.fields([
    { name: "qrbanner", maxCount: 1 },
    { name: "hdfcbankbanner", maxCount: 1 },
    { name: "sbibankbanner", maxCount: 1 },
    { name: "image", maxCount: 1 },
    { name: "bottombanner", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { heading, topdescription, name, description,amount, razorpayButtonId, status, created_by, creation_date } = req.body;

      if (!heading || !name) {
        return res.status(400).json({ error: "Heading and Name are required!" });
      }

      const qrbanner = req.files?.qrbanner ? "/uploads/" + req.files.qrbanner[0].filename : "";
      const hdfcbankbanner = req.files?.hdfcbankbanner ? "/uploads/" + req.files.hdfcbankbanner[0].filename : "";
      const sbibankbanner = req.files?.sbibankbanner ? "/uploads/" + req.files.sbibankbanner[0].filename : "";
      const image = req.files?.image ? "/uploads/" + req.files.image[0].filename : "";
      const bottombanner = req.files?.bottombanner ? "/uploads/" + req.files.bottombanner[0].filename : "";

      const sql = `
        INSERT INTO donation
        (heading, topdescription, name, description, amount, razorpayButtonId, qrbanner, hdfcbankbanner, sbibankbanner, image, bottombanner, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        heading, topdescription, name, description, amount, razorpayButtonId,
        qrbanner, hdfcbankbanner, sbibankbanner, image, bottombanner, status, created_by, creation_date
      ]);

      res.json({
        success: true,
        record: { id: result.insertId, heading, topdescription, name, description, amount, razorpayButtonId, qrbanner, hdfcbankbanner, sbibankbanner, image, bottombanner, status, created_by, creation_date }
      });
    } catch (err) {
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);

// ✅ Select
router.get("/selectdonation", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM donation");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed", details: err.message });
  }
});

// ✅ Update
router.put("/updatedonation/:id", checkApiKey, upload.fields([
  { name: "qrbanner", maxCount: 1 },
  { name: "hdfcbankbanner", maxCount: 1 },
  { name: "sbibankbanner", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "bottombanner", maxCount: 1 },
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { heading, topdescription, name, description, amount, razorpayButtonId, status, created_by, creation_date } = req.body;

    const [rows] = await db.query("SELECT * FROM donation WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });

    let qrbanner = rows[0].qrbanner;
    let hdfcbankbanner = rows[0].hdfcbankbanner;
    let sbibankbanner = rows[0].sbibankbanner;
    let image = rows[0].image;
    let bottombanner = rows[0].bottombanner;

    if (req.files?.qrbanner) qrbanner = "/uploads/" + req.files.qrbanner[0].filename;
    if (req.files?.hdfcbankbanner) hdfcbankbanner = "/uploads/" + req.files.hdfcbankbanner[0].filename;
    if (req.files?.sbibankbanner) sbibankbanner = "/uploads/" + req.files.sbibankbanner[0].filename;
    if (req.files?.image) image = "/uploads/" + req.files.image[0].filename;
    if (req.files?.bottombanner) bottombanner = "/uploads/" + req.files.bottombanner[0].filename;

    const sql = `
      UPDATE donation
      SET heading=?, topdescription=?, name=?, description=?, amount=?, razorpayButtonId=?, qrbanner=?, hdfcbankbanner=?, sbibankbanner=?, image=?, bottombanner=?, status=?, created_by=?, creation_date=?
      WHERE id=?
    `;

    await db.query(sql, [heading, topdescription, name, description, amount, razorpayButtonId, qrbanner, hdfcbankbanner, sbibankbanner, image, bottombanner, status, created_by, creation_date, id]);

    const [updated] = await db.query("SELECT * FROM donation WHERE id=?", [id]);
    res.json({ success: true, record: updated[0] });
  } catch (err) {
    res.status(500).json({ error: "Update failed", details: err.message });
  }
});

// ✅ Delete
router.delete("/deletedonation/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM donation WHERE id=?", [id]);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

// ✅ Toggle Status
router.patch("/statusdonation/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM donation WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    const newStatus = rows[0].status === "active" ? "inactive" : "active";
    await db.query("UPDATE donation SET status=? WHERE id=?", [newStatus, id]);
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: "Status update failed", details: err.message });
  }
});

////////////////////////////////////////Donate section close  here ///////////////////////////



////////++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ABOUT SECTION  ++++++++++++++++++++++++++++++++//////

//////////////////////////////////////// Introduction section start  here ///////////////////////////

router.post(
  "/insertabout_introduction",
  checkApiKey,
  upload.fields([
    { name: "videoUrl", maxCount: 1 },
     { name: "imageUrl", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        subtitle,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!title || !req.files?.videoUrl || !req.files?.imageUrl) {
        return res.status(400).json({ error: "Title, subtitle, videoUrl and imageUrl are required!" });
      }

      const videoUrl = "/uploads/" + req.files.videoUrl[0].filename;
      const imageUrl = "/uploads/" + req.files.imageUrl[0].filename;

      const sql = `
        INSERT INTO about_introduction
        (title, subtitle, videoUrl, imageUrl, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        subtitle,
        videoUrl,
        imageUrl,
        status,
        created_by,
        creation_date
      ]);
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          subtitle,
          videoUrl,
          imageUrl,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_introduction", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_introduction");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_introduction/:id",
  checkApiKey,
  upload.fields([
    { name: "imageUrl", maxCount: 1 },
    { name: "videoUrl", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, subtitle, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_introduction WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (subtitle) { updateFields.push("subtitle=?"); values.push(subtitle); }
      // if (videoUrl) { updateFields.push("videoUrl=?"); values.push(videoUrl); }
      // if (imageUrl) { updateFields.push("imageUrl=?"); values.push(imageUrl); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].imageUrl;

      if (req.files?.videoUrl) {
        imgPath = "/uploads/" + req.files.videoUrl[0].filename;
        updateFields.push("videoUrl=?");
        values.push(imgPath);
      }

      if (req.files?.imageUrl) {
        imgPath = "/uploads/" + req.files.imageUrl[0].filename;
        updateFields.push("imageUrl=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_introduction SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_introduction WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_introduction updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_introduction/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_introduction WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_introduction WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_introduction deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_introduction/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_introduction WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_introduction SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Introduction section start  here ///////////////////////////


//////////////////////////////////////// Inspiration Millions section start  here ///////////////////////////

router.post(
  "/insertabout_inspirationmillions",
  checkApiKey,

  upload.none(),   // ⬅ IMPORTANT: No file upload, so accept normal FormData

  async (req, res) => {
    try {
      const { icon, label, corner, heading, description, status, creation_date, created_by } = req.body;

      if (!icon || !label || !corner || !heading || !description) {
        return res.status(400).json({ error: "All fields are required!" });
      }

      const sql = `
        INSERT INTO about_inspirationmillions
        (icon, label, corner, heading, description, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        icon,
        label,
        corner,
        heading,
        description,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          icon,
          label,
          corner,
          heading,
          description,
          status,
          created_by,
          creation_date,
        },
      });

    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_inspirationmillions", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_inspirationmillions");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

router.put(
  "/updateabout_inspirationmillions/:id",
  checkApiKey,
  upload.none(),   // ← THIS FIXES req.body undefined
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        icon,
        label,
        corner,
        heading,
        description,
        creation_date,
        created_by,
        status
      } = req.body;

      // Check if record exists
      const [rows] = await db.query(
        "SELECT * FROM about_inspirationmillions WHERE id=?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      // Prepare SQL update
      const fields = [];
      const values = [];

      if (icon !== undefined) { fields.push("icon=?"); values.push(icon); }
      if (label !== undefined) { fields.push("label=?"); values.push(label); }
      if (corner !== undefined) { fields.push("corner=?"); values.push(corner); }
      if (heading !== undefined) { fields.push("heading=?"); values.push(heading); }
      if (description !== undefined) { fields.push("description=?"); values.push(description); }
      if (creation_date !== undefined) { fields.push("creation_date=?"); values.push(creation_date); }
      if (created_by !== undefined) { fields.push("created_by=?"); values.push(created_by); }
      if (status !== undefined) { fields.push("status=?"); values.push(status); }

      values.push(id);

      await db.query(
        `UPDATE about_inspirationmillions SET ${fields.join(", ")} WHERE id=?`,
        values
      );

      // Fetch updated
      const [updated] = await db.query(
        "SELECT * FROM about_inspirationmillions WHERE id=?",
        [id]
      );

      res.json({
        success: true,
        record: updated[0]
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);



// ✅ Delete route
router.delete("/deleteabout_inspirationmillions/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_inspirationmillions WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_inspirationmillions WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Inspiration Millions deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statusabout_inspirationmillions/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_inspirationmillions WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_inspirationmillions SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


//////////////////////////////////////// Inspiration Millions section close  here ///////////////////////////

//////////////////////////////////////// Life Introduction section Start  here ///////////////////////////
// ✅ Create route
router.post(
  "/insertabout_lifeintroduction",
  checkApiKey,
  upload.fields([{ name: "image_url", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, highlight, paragraphs, status, creation_date, created_by } = req.body;

      if (!title || !req.files?.image_url) {
        return res.status(400).json({ error: "Title and Image are required!" });
      }

      const image_url = "/uploads/" + req.files.image_url[0].filename;

      const sql = `
        INSERT INTO about_lifeintroduction
        (title, highlight, paragraphs, image_url, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        title,
        highlight,
        paragraphs,
        image_url,
        status || "active",
        created_by,
        creation_date,
      ]);

      // fetch the inserted record
      const [rows2] = await db.query("SELECT * FROM about_lifeintroduction WHERE id = ?", [result.insertId]);
      const record = rows2[0];

      res.json({
        success: true,
        record,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// — Get all
router.get("/selectabout_lifeintroduction", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_lifeintroduction ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// — Update (PUT)
router.put(
  "/insertabout_lifeintroduction/:id",
  checkApiKey,
  upload.fields([{ name: "image_url", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, highlight, paragraphs, status, creation_date, created_by } = req.body;

      // check exists
      const [existing] = await db.query("SELECT * FROM about_lifeintroduction WHERE id = ?", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      let image_url = existing[0].image_url;
      if (req.files?.image_url) {
        image_url = "/uploads/" + req.files.image_url[0].filename;
      }

      const sql = `
        UPDATE about_lifeintroduction
        SET title=?, highlight=?, paragraphs=?, image_url=?, status=?, created_by=?, creation_date=?
        WHERE id=?
      `;
      const [result] = await db.query(sql, [
        title,
        highlight,
        paragraphs,
        image_url,
        status,
        created_by,
        creation_date,
        id,
      ]);

      // fetch updated record
      const [rows2] = await db.query("SELECT * FROM about_lifeintroduction WHERE id = ?", [id]);
      const record = rows2[0];

      res.json({
        success: true,
        record,
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed", details: err.message });
    }
  }
);

// — Delete
router.delete("/deleteabout_lifeintroduction/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ensure record exists
    const [rows] = await db.query("SELECT * FROM about_lifeintroduction WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    await db.query("DELETE FROM about_lifeintroduction WHERE id = ?", [id]);
    res.json({ success: true, message: "Deleted successfully", id });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// — Toggle status (PATCH)
router.patch("/statusabout_lifeintroduction/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM about_lifeintroduction WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query("UPDATE about_lifeintroduction SET status = ? WHERE id = ?", [
      newStatus,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({
      success: true,
      status: newStatus,
      id,
    });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


//////////////////////////////////////// Life Introduction section Close  here ///////////////////////////


//////////////////////////////////////// About Events section start  here ///////////////////////////

router.post(
  "/insertabout_events",
  checkApiKey,
  upload.fields([
    { name: "video", maxCount: 1 },
     { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        href,
        brand_alt	,
        brand_src,
        caption,
        figure_bg,
        type,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!href || !brand_alt || !brand_src || !caption || !figure_bg || !type || !req.files?.video || !req.files?.image) {
        return res.status(400).json({ error: "href, brand_alt, brand_src, caption, figure_bg, type, video and image are required!" });
      }

      const video = "/uploads/" + req.files.video[0].filename;
      const image = "/uploads/" + req.files.image[0].filename;

      const sql = `
        INSERT INTO about_events
        (href, brand_alt, brand_src, caption, figure_bg, type, video, image, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        href,
        brand_alt,
        brand_src,
        caption,
        figure_bg,
        type,
        video,
        image,
        status,
        created_by,
        creation_date
      ]);
        
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          href,
          brand_alt,
          brand_src,
          caption,
          figure_bg,
          type,
          video,
          image,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_events", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_events");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_events/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { href, brand_alt, brand_src, caption, figure_bg, type, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_events WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (href) { updateFields.push("href=?"); values.push(href); }
      if (brand_alt) { updateFields.push("brand_alt=?"); values.push(brand_alt); }
      if (brand_src) { updateFields.push("brand_src=?"); values.push(brand_src); }
      if (caption) { updateFields.push("caption=?"); values.push(caption); }
      if (figure_bg) { updateFields.push("figure_bg=?"); values.push(figure_bg); }
      if (type) { updateFields.push("type=?"); values.push(type); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].image;

      if (req.files?.video) {
        imgPath = "/uploads/" + req.files.video[0].filename;
        updateFields.push("video=?");
        values.push(imgPath);
      }

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_events SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_events WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_events updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_events/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_events WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_events WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_events deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_events/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_events WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_events SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// About Events section close  here ///////////////////////////


//////////////////////////////////////// Sant Marg Dershan section start  here ///////////////////////////

router.post(
  "/insertabout_saintsdarshan",
  checkApiKey,
  upload.fields([
     { name: "imageSrc", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        heading,
        introduction,
        paragraph1,
        paragraph2,
        imageAlt,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!heading || !req.files?.imageSrc) {
        return res.status(400).json({ error: "Heading, introduction, paragraph1, paragraph2, imageAlt, status, created_by, and creation_date are required!" });
      }

      const imageSrc = "/uploads/" + req.files.imageSrc[0].filename;
      

      const sql = `
        INSERT INTO about_saintsdarshan
        (heading, introduction, paragraph1, paragraph2, imageSrc, imageAlt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        heading,
        introduction,
        paragraph1,
        paragraph2,
        imageSrc,
        imageAlt,
        status,
        created_by,
        creation_date
      ]);
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          heading,
          introduction,
          paragraph1,
          paragraph2,
          imageSrc,
          imageAlt,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_saintsdarshan", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_saintsdarshan");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_saintsdarshan/:id",
  checkApiKey,
  upload.fields([
    { name: "imageSrc", maxCount: 1 },
   
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { heading, introduction, paragraph1, paragraph2, imageSrc, imageAlt, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_saintsdarshan WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (heading) { updateFields.push("heading=?"); values.push(heading); }
      if (introduction) { updateFields.push("introduction=?"); values.push(introduction); }
      if (paragraph1) { updateFields.push("paragraph1=?"); values.push(paragraph1); }
      if (paragraph2) { updateFields.push("paragraph2=?"); values.push(paragraph2); }
      if (imageSrc) { updateFields.push("imageSrc=?"); values.push(imageSrc); }
      if (imageAlt) { updateFields.push("imageAlt=?"); values.push(imageAlt); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].imageSrc;

      

      if (req.files?.imageSrc) {
        imgPath = "/uploads/" + req.files.imageSrc[0].filename;
        updateFields.push("imageSrc=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_saintsdarshan SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_saintsdarshan WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_saintsdarshan updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_saintsdarshan/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_saintsdarshan WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_saintsdarshan WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_saintsdarshan deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_saintsdarshan/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_saintsdarshan WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_saintsdarshan SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Sant Marg Dershan section close  here ///////////////////////////



//////////////////////////////////////// divya darabar section start  here ///////////////////////////

router.post(
  "/insertabout_divyadarabar",
  checkApiKey,
  upload.fields([
     { name: "imageSrc", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        heading,
        introduction,
        paragraph1,
        paragraph2,
        paragraph3,
        imageAlt,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!heading || !req.files?.imageSrc) {
        return res.status(400).json({ error: "Heading, introduction, paragraph1, paragraph2, paragraph3, imageAlt, status, created_by, and creation_date are required!" });
      }

      const imageSrc = "/uploads/" + req.files.imageSrc[0].filename;
      

      const sql = `
        INSERT INTO about_divyadarabar
        (heading, introduction, paragraph1, paragraph2, paragraph3, imageSrc, imageAlt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        heading,
        introduction,
        paragraph1,
        paragraph2,
        paragraph3,
        imageSrc,
        imageAlt,
        status,
        created_by,
        creation_date
      ]);
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          heading,
          introduction,
          paragraph1,
          paragraph2,
          paragraph3,
          imageSrc,
          imageAlt,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_divyadarabar", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_divyadarabar");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_divyadarabar/:id",
  checkApiKey,
  upload.fields([
    { name: "imageSrc", maxCount: 1 },
   
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { heading, introduction, paragraph1, paragraph2, paragraph3, imageSrc, imageAlt, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_divyadarabar WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (heading) { updateFields.push("heading=?"); values.push(heading); }
      if (introduction) { updateFields.push("introduction=?"); values.push(introduction); }
      if (paragraph1) { updateFields.push("paragraph1=?"); values.push(paragraph1); }
      if (paragraph2) { updateFields.push("paragraph2=?"); values.push(paragraph2); }
      if (paragraph3) { updateFields.push("paragraph3=?"); values.push(paragraph3); }
      if (imageSrc) { updateFields.push("imageSrc=?"); values.push(imageSrc); }
      if (imageAlt) { updateFields.push("imageAlt=?"); values.push(imageAlt); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].imageSrc;

      

      if (req.files?.imageSrc) {
        imgPath = "/uploads/" + req.files.imageSrc[0].filename;
        updateFields.push("imageSrc=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_divyadarabar SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_divyadarabar WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_divyadarabar updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_divyadarabar/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_divyadarabar WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_divyadarabar WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_divyadarabar deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_divyadarabar/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_divyadarabar WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_divyadarabar SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Divya Darshan section close here ///////////////////////////



//////////////////////////////////////// whats up section start  here ///////////////////////////

// insert route
router.post(
  "/insertabout_whatsupslider",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      console.log("REQ.BODY:", req.body);
      console.log("REQ.FILES:", req.files);

     const {
  href,
  title,
  name,
  bullets,
  status = "active",
  created_by = "admin",
  creation_date,
} = req.body;

if (!href || !title || !name || !bullets || !req.files?.image?.[0]) {
  return res.status(400).json({
    error: "Href, title, name, bullets, image are required.",
  });
}

let parsedBullets;
try {
  parsedBullets = JSON.parse(bullets);
  if (!Array.isArray(parsedBullets)) {
    throw new Error("Bullets must be an array.");
  }
} catch (err) {
  return res.status(400).json({ error: "Invalid bullets format (must be array JSON string)." });
}


      const image = "/uploads/" + req.files.image[0].filename;

      const sql = `
        INSERT INTO about_whatsupslider
        (href, title, name, bullets, image, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        href,
        title,
        name,
      JSON.stringify(parsedBullets), // Save as JSON string
        image,
        status,
        created_by,
        creation_date,
      ]);

      // Optionally fetch the inserted record to return the full record from DB
      const [rows2] = await db.query(
        "SELECT * FROM about_whatsupslider WHERE id = ?",
        [result.insertId],
      );

      const parsedRows = rows2.map((row) => ({
        ...row,
        bullets: JSON.parse(row.bullets || "[]"),
      }));

//      const parsedRows = rows.map((row) => ({
//   ...row,
//   bullets: JSON.parse(row.bullets || "[]"),
// }));

      const record = rows2[0];

      res.json({
        success: true,
        record,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// select route
router.get("/selectabout_whatsupslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_whatsupslider");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_whatsupslider/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
   
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { href, title, name, bullets, image, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_whatsupslider WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (href) { updateFields.push("href=?"); values.push(href); }
      if (title) { updateFields.push("title=?"); values.push(title); }
      if (name) { updateFields.push("name=?"); values.push(name); }
      if (bullets) { updateFields.push("bullets=?"); values.push(bullets); }
      if (image) { updateFields.push("image=?"); values.push(image); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].image;

      

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_whatsupslider SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_whatsupslider WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_whatsupslider updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_whatsupslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_whatsupslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_whatsupslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_whatsupslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_whatsupslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_whatsupslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_whatsupslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// whats up section close  here ///////////////////////////


//////////////////////////////////////// About Gurudev Resuolution section start  here ///////////////////////////

router.post("/insertabout_gurudevresolution", checkApiKey, upload.fields([
  { name: "imageSrc", maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      heading,
      introduction,
      paragraph1,
      imageAlt,
      status = "active",
      created_by = "admin",
      creation_date
    } = req.body;

    // Check for required fields
    if (!heading || !introduction || !paragraph1 || !req.files?.imageSrc) {
      return res.status(400).json({ error: "Heading, introduction, paragraph1, imageSrc are required!" });
    }

    const imageSrc = "/uploads/" + req.files.imageSrc[0].filename;

    const sql = `
      INSERT INTO about_gurudevresolution
      (heading, introduction, paragraph1, imageSrc, imageAlt, status, created_by, creation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      heading,
      introduction,
      paragraph1,
      imageSrc,
      imageAlt,
      status,
      created_by,
      creation_date
    ]);

    // Respond with the inserted record
    res.json({
      success: true,
      record: {
        id: result.insertId,
        heading,
        introduction,
        paragraph1,
        imageSrc,
        imageAlt,
        status,
        created_by,
        creation_date
      }
    });
  } catch (err) {
    console.error("❌ Insert Error:", err);
    res.status(500).json({ error: "Insert failed!", details: err.message });
  }
});

// GET route to fetch all About Gurudev Resolution data
// Backend: selectabout_gurudevresolution route
router.get("/selectabout_gurudevresolution", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_gurudevresolution");
    if (rows.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});



// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_gurudevresolution/:id",
  checkApiKey,
  upload.fields([
    { name: "imageSrc", maxCount: 1 },
   
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { heading, introduction, paragraph1, imageSrc, imageAlt, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_gurudevresolution WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (heading) { updateFields.push("heading=?"); values.push(heading); }
      if (introduction) { updateFields.push("introduction=?"); values.push(introduction); }
      if (paragraph1) { updateFields.push("paragraph1=?"); values.push(paragraph1); }
      if (imageSrc) { updateFields.push("imageSrc=?"); values.push(imageSrc); }
      if (imageAlt) { updateFields.push("imageAlt=?"); values.push(imageAlt); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].imageSrc;

      

      if (req.files?.imageSrc) {
        imgPath = "/uploads/" + req.files.imageSrc[0].filename;
        updateFields.push("imageSrc=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_gurudevresolution SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_gurudevresolution WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_gurudevresolution updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_gurudevresolution/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_gurudevresolution WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_gurudevresolution WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_gurudevresolution deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_gurudevresolution/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_gurudevresolution WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_gurudevresolution SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// About Gurudev Resolution section close  here ///////////////////////////


//////////////////////////////////////// Marquee Strip section start  here ///////////////////////////

router.post(
  "/insertabout_marqueestrip",
  checkApiKey,
  upload.fields([
     { name: "img", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        w,
        h,
        alt,
        text,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!w || !h || !req.files?.img) {
        return res.status(400).json({ error: "Width, height, alt, text, status, created_by, and creation_date are required!" });
      }

      const img = "/uploads/" + req.files.img[0].filename;


      const sql = `
        INSERT INTO about_marqueestrip
        (w, h, img, alt, text, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        w,
        h,
        img,
        alt,
        text,
        status,
        created_by,
        creation_date
      ]);
        
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          w,
          h,
          img,
          alt,
          text,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_marqueestrip", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_marqueestrip");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_marqueestrip/:id",
  checkApiKey,
  upload.fields([
    { name: "img", maxCount: 1 },

  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { w, h, img, alt, text, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_marqueestrip WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (w) { updateFields.push("w=?"); values.push(w); }
      if (h) { updateFields.push("h=?"); values.push(h); }
      if (img) { updateFields.push("img=?"); values.push(img); }
      if (alt) { updateFields.push("alt=?"); values.push(alt); }
      if (text) { updateFields.push("text=?"); values.push(text); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].img;

      

      if (req.files?.img) {
        imgPath = "/uploads/" + req.files.img[0].filename;
        updateFields.push("img=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_marqueestrip SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_marqueestrip WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_marqueestrip updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_marqueestrip/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_marqueestrip WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_marqueestrip WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_marqueestrip deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_marqueestrip/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_marqueestrip WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_marqueestrip SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Marquee Strip section close here ///////////////////////////

//////////////////////////////////////// Featured Grid section start  here ///////////////////////////

router.post(
  "/insertabout_featuredgrid",
  checkApiKey,
  upload.fields([
     { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        alt,
        title,
        description,
        gradient_class,
        status,
        created_by,
        creation_date
      } = req.body;

      if (!title || !description || !req.files?.image) {
        return res.status(400).json({ error: "Title, description, and image are required!" });
      }

      const image = "/uploads/" + req.files.image[0].filename;


      const sql = `
        INSERT INTO about_featuredgrid
        (image, alt, title, description, gradient_class, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        image,
        alt,
        title,
        description,
        gradient_class,
        status,
        created_by,
        creation_date
      ]);
        
        
       

       res.json({
        success: true,
        record: {
          id: result.insertId,
          image,
          alt,
          title,
          description,
          gradient_class,
          status,
          created_by,
          creation_date
        }
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



router.get("/selectabout_featuredgrid", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM about_featuredgrid");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateabout_featuredgrid/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },

  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { image, alt, title, description, gradient_class, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM about_featuredgrid WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (image) { updateFields.push("image=?"); values.push(image); }
      if (alt) { updateFields.push("alt=?"); values.push(alt); }
      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (gradient_class) { updateFields.push("gradient_class=?"); values.push(gradient_class); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].image;

      

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE about_featuredgrid SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM about_featuredgrid WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ about_featuredgrid updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteabout_featuredgrid/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM about_featuredgrid WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM about_featuredgrid WHERE id=?", [id]);
    res.json({ success: true, message: "✅ about_featuredgrid deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusabout_featuredgrid/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM about_featuredgrid WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE about_featuredgrid SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Featured Grid section close here ///////////////////////////

//////////////////////////////////////// Upcomming Events section start  here ///////////////////////////

// INSERT route
// Assuming express and middleware are already set up above
router.post(
  "/insertupcomming_eventsdate",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "dpimage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        startDate,
        endDate,
        location,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

      // Validate required fields
      if (!title || !startDate || !req.files?.dpimage || !req.files?.image) {
        return res
          .status(400)
          .json({ error: "Title, startDate, DP image and image are required!" });
      }

      const dpimage = "/uploads/" + req.files.dpimage[0].filename;
      const image = "/uploads/" + req.files.image[0].filename;

      // Make sure your table has these columns: startDate, endDate, etc.
      const sql = `
        INSERT INTO upcomming_eventsdate
        (title, startDate, endDate, location, dpimage, image, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        startDate,
        endDate || null,       // allow null if endDate not given
        location,
        dpimage,
        image,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          startDate,
          endDate,
          location,
          dpimage,
          image,
          status,
          created_by,
          creation_date,
        },
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

router.get("/selectupcomming_eventsdate", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM upcomming_eventsdate");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// UPDATE route
router.put(
  "/updateupcomming_eventsdate/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "dpimage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, startDate, endDate, location, status, created_by, creation_date } = req.body;

      const [rows] = await db.query("SELECT * FROM upcomming_eventsdate WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (startDate) { updateFields.push("startDate=?"); values.push(startDate); }
      if (endDate) { updateFields.push("endDate=?"); values.push(endDate); }
      if (location) { updateFields.push("location=?"); values.push(location); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }

      if (req.files?.image) {
        const imagePath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("image=?");
        values.push(imagePath);
      }

      if (req.files?.dpimage) {
        const dpimagePath = "/uploads/" + req.files.dpimage[0].filename;
        updateFields.push("dpimage=?");
        values.push(dpimagePath);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "No fields to update!" });
      }

      values.push(id);
      const sql = `UPDATE upcomming_eventsdate SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM upcomming_eventsdate WHERE id=?", [id]);
      res.json({
        success: true,
        message: "✅ upcomming_eventsdate updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// DELETE route
router.delete("/deleteupcomming_eventsdate/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT * FROM upcomming_eventsdate WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    await db.query("DELETE FROM upcomming_eventsdate WHERE id=?", [id]);
    res.json({ success: true, message: "✅ upcomming_eventsdate deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// STATUS TOGGLE route
router.patch("/statusupcomming_eventsdate/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM upcomming_eventsdate WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE upcomming_eventsdate SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


//////////////////////////////////////// Upcomming Events section close here ///////////////////////////


//////////////////////////////////////// Upcomming Virtual Pooja section start  here ///////////////////////////

// INSERT route
// Assuming express and middleware are already set up above
router.post(
  "/insertupcomming_virtualpooja",
  checkApiKey,
  upload.fields([
    { name: "button_img", maxCount: 1 },
    { name: "gif", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("DEBUG insert: req.body =", req.body);
      console.log("DEBUG insert: req.files =", req.files);

      const {
        name,
        div_id,
        description,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

      // Validate basic fields
      if (!name || !description) {
        return res
          .status(400)
          .json({ error: "Name and description are required!" });
      }

      // Validate uploaded files
      if (
        !req.files ||
        !req.files.button_img ||
        req.files.button_img.length === 0 ||
        !req.files.gif ||
        req.files.gif.length === 0 ||
        !req.files.audio ||
        req.files.audio.length === 0
      ) {
        return res
          .status(400)
          .json({
            error: "button_img, gif and audio files are required!",
          });
      }

      const button_img = "/uploads/" + req.files.button_img[0].filename;
      const gif = "/uploads/" + req.files.gif[0].filename;
      const audio = "/uploads/" + req.files.audio[0].filename;

      const sql = `
        INSERT INTO upcomming_virtualpooja
        (name, div_id, description, button_img, gif, audio, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        name,
        div_id,
        description,
        button_img,
        gif,
        audio,
        status,
        created_by,
        creation_date,
      ]);

      const insertedId = result.insertId;
      const [rows] = await db.query(
        "SELECT * FROM upcomming_virtualpooja WHERE id = ?",
        [insertedId]
      );
      const record = rows[0];

      res.json({ success: true, record });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({
        error: "Insert failed!",
        details: err.message,
      });
    }
  }
);

// ---------- Select route ----------
router.get(
  "/selectupcomming_virtualpooja",
  checkApiKey,
  async (req, res) => {
    try {
      const [rows] = await db.query("SELECT * FROM upcomming_virtualpooja");
      res.json(rows);
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      res
        .status(500)
        .json({ error: "Failed to fetch data", details: err.message });
    }
  }
);

// ---------- Update route ----------
router.put(
  "/updateupcomming_virtualpooja/:id",
  checkApiKey,
  upload.fields([
    { name: "button_img", maxCount: 1 },
    { name: "gif", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("DEBUG update: req.body =", req.body);
      console.log("DEBUG update: req.files =", req.files);

      const { id } = req.params;
      const {
        name,
        div_id,
        description,
        status,
        created_by,
        creation_date,
      } = req.body;

      const [rows] = await db.query(
        "SELECT * FROM upcomming_virtualpooja WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      const updateFields = [];
      const values = [];

      if (name) {
        updateFields.push("name = ?");
        values.push(name);
      }
      if (div_id) {
        updateFields.push("div_id = ?");
        values.push(div_id);
      }
      if (description) {
        updateFields.push("description = ?");
        values.push(description);
      }
      if (status) {
        updateFields.push("status = ?");
        values.push(status);
      }
      if (created_by) {
        updateFields.push("created_by = ?");
        values.push(created_by);
      }
      if (creation_date) {
        updateFields.push("creation_date = ?");
        values.push(creation_date);
      }

      if (req.files?.button_img?.length) {
        const pathImg = "/uploads/" + req.files.button_img[0].filename;
        updateFields.push("button_img = ?");
        values.push(pathImg);
      }
      if (req.files?.gif?.length) {
        const pathGif = "/uploads/" + req.files.gif[0].filename;
        updateFields.push("gif = ?");
        values.push(pathGif);
      }
      if (req.files?.audio?.length) {
        const pathAudio = "/uploads/" + req.files.audio[0].filename;
        updateFields.push("audio = ?");
        values.push(pathAudio);
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ error: "No fields to update!" });
      }

      values.push(id);
      const sql = `UPDATE upcomming_virtualpooja SET ${updateFields.join(
        ", "
      )} WHERE id = ?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res
          .status(400)
          .json({ error: "Update failed!" });
      }

      const [updatedRows] = await db.query(
        "SELECT * FROM upcomming_virtualpooja WHERE id = ?",
        [id]
      );
      res.json({
        success: true,
        message: "Updated successfully",
        record: updatedRows[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({
        error: "Update failed!",
        details: err.message,
      });
    }
  }
);

// ---------- Delete and status routes ----------
router.delete(
  "/deleteupcomming_virtualpooja/:id",
  checkApiKey,
  async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.query(
        "SELECT * FROM upcomming_virtualpooja WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }
      await db.query("DELETE FROM upcomming_virtualpooja WHERE id = ?", [id]);
      res.json({ success: true, message: "Deleted successfully" });
    } catch (err) {
      console.error("❌ Delete Error:", err);
      res.status(500).json({ error: "Delete failed!", details: err.message });
    }
  }
);

router.patch(
  "/statusupcomming_virtualpooja/:id/status",
  checkApiKey,
  async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.query(
        "SELECT status FROM upcomming_virtualpooja WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }
      const currentStatus = rows[0].status;
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const [result] = await db.query(
        "UPDATE upcomming_virtualpooja SET status = ? WHERE id = ?",
        [newStatus, id]
      );
      if (result.affectedRows === 0) {
        return res
          .status(400)
          .json({ error: "Status update failed" });
      }
      res.json({
        success: true,
        status: newStatus,
      });
    } catch (err) {
      console.error("❌ Status Update Error:", err);
      res
        .status(500)
        .json({ error: "Failed to update status", details: err.message });
    }
  }
);
//////////////////////////////////////// Upcomming Virtual Pooja section close here ///////////////////////////


//////////////////////////////////////// Service Commitments section start  here ///////////////////////////

router.post(
  "/insertupcomming_servicecommitments",
  checkApiKey,
  upload.fields([{ name: "img", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        title,
        icon_text,
        description,
        status,
        created_by,
        creation_date,
      } = req.body;

      // ✅ Defensive check
      if (!title || !description || !req.files?.img) {
        return res.status(400).json({ error: "Title, description, and image are required!" });
      }

      const img = "/uploads/" + req.files.img[0].filename;

      const sql = `
        INSERT INTO upcomming_servicecommitments
        (title, icon_text, img, description, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        icon_text,
        img,
        description,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        success: true,
        record: {
          id: result.insertId,
          title,
          icon_text,
          img,
          description,
          status,
          created_by,
          creation_date,
        },
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);




router.get("/selectupcomming_servicecommitments", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM upcomming_servicecommitments");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateupcomming_servicecommitments/:id",
  checkApiKey,
  upload.fields([
    { name: "img", maxCount: 1 },

  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, icon_text, img, description, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM upcomming_servicecommitments WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (icon_text) { updateFields.push("icon_text=?"); values.push(icon_text); }
      if (img) { updateFields.push("img=?"); values.push(img); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].img;

      if (req.files?.img) {
        imgPath = "/uploads/" + req.files.img[0].filename;
        updateFields.push("img=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE upcomming_servicecommitments SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM upcomming_servicecommitments WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ upcomming_servicecommitments updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteupcomming_servicecommitments/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM upcomming_servicecommitments WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM upcomming_servicecommitments WHERE id=?", [id]);
    res.json({ success: true, message: "✅ upcomming_servicecommitments deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusupcomming_servicecommitments/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM upcomming_servicecommitments WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE upcomming_servicecommitments SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Service Commitments section close here ///////////////////////////



//////////////////////////////////////// Divya Mission section start  here ///////////////////////////

router.post(
  "/insertupcomming_divyamission",
  checkApiKey,
  async (req, res) => {
    try {
      const {
        icon,
        text,
        color_class,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

      // Validate
      if (!icon || !text || !color_class) {
        return res
          .status(400)
          .json({ error: "Icon, text, and color_class are required!" });
      }

      const sql = `
        INSERT INTO upcomming_divyamission
        (icon, text, color_class, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        icon,
        text,
        color_class,
        status,
        created_by,
        creation_date,
      ]);

      const insertedId = result.insertId;
      // Optional: fetch inserted record to return full object
      const [rows] = await db.query(
        "SELECT * FROM upcomming_divyamission WHERE id = ?",
        [insertedId]
      );
      const record = rows[0];

      res.json({ success: true, record });
    } catch (err) {
      console.error("❌ Insert Error (DivyaMission):", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// Select
router.get("/selectupcomming_divyamission", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM upcomming_divyamission");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error (DivyaMission):", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateupcomming_divyamission/:id",
  checkApiKey,
  // upload.fields([
  //   { name: "img", maxCount: 1 },

  // ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { icon, text, color_class, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM upcomming_divyamission WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

      if (icon) { updateFields.push("icon=?"); values.push(icon); }
      if (text) { updateFields.push("text=?"); values.push(text); }
      if (color_class) { updateFields.push("color_class=?"); values.push(color_class); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      //let imgPath = rows[0].img;

      // if (req.files?.img) {
      //   imgPath = "/uploads/" + req.files.img[0].filename;
      //   updateFields.push("img=?");
      //   values.push(imgPath);
      // }

      values.push(id);

      const sql = `UPDATE upcomming_divyamission SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM upcomming_divyamission WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ upcomming_divyamission updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteupcomming_divyamission/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM upcomming_divyamission WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM upcomming_divyamission WHERE id=?", [id]);
    res.json({ success: true, message: "✅ upcomming_divyamission deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusupcomming_divyamission/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM upcomming_divyamission WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE upcomming_divyamission SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Divya Mission section close here ///////////////////////////



//////////////////////////////////////// Upcomming Religion Sanatan section start  here ///////////////////////////

router.post(
  "/insertupcomming_religionsanatan",
  checkApiKey,
  upload.fields([{ name: "backgroundImage", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        text,
        author,
        footer,
        icon,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

      if (!icon || !text || !author) {
        return res.status(400).json({ error: "Icon, text & author required!" });
      }

      const backgroundImage = req.files?.backgroundImage
        ? "/uploads/" + req.files.backgroundImage[0].filename
        : "";

      const sql = `
        INSERT INTO upcomming_religionsanatan
        (backgroundImage, icon, text, author, footer, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        backgroundImage,
        icon,
        text,
        author,
        footer,
        status,
        created_by,
        creation_date,
      ]);

      const [rows] = await db.query(
        "SELECT * FROM upcomming_religionsanatan WHERE id = ?",
        [result.insertId]
      );

      res.json({ success: true, record: rows[0] });
    } catch (err) {
      console.error("Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// Select
router.get("/selectupcomming_religionsanatan", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM upcomming_religionsanatan");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error (Upcomming Religion Sanatan):", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateupcomming_religionsanatan/:id",
  checkApiKey,
   upload.fields([
     { name: "backgroundImage", maxCount: 1 },

   ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { backgroundImage,text, author, footer, icon, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM upcomming_religionsanatan WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];
       if (backgroundImage) { updateFields.push("backgroundImage=?"); values.push(backgroundImage); }
      if (text) { updateFields.push("text=?"); values.push(text); }
      if (author) { updateFields.push("author=?"); values.push(author); }
      if (footer) { updateFields.push("footer=?"); values.push(footer); }
      if (icon) { updateFields.push("icon=?"); values.push(icon); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].backgroundImage;

       if (req.files?.backgroundImage) {
         imgPath = "/uploads/" + req.files.backgroundImage[0].filename;
         updateFields.push("backgroundImage=?");
         values.push(imgPath);
       }

      values.push(id);

      const sql = `UPDATE upcomming_religionsanatan SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM upcomming_religionsanatan WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ upcomming_religionsanatan updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteupcomming_religionsanatan/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM upcomming_religionsanatan WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM upcomming_religionsanatan WHERE id=?", [id]);
    res.json({ success: true, message: "✅ upcomming_religionsanatan deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusupcomming_religionsanatan/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM upcomming_religionsanatan WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE upcomming_religionsanatan SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Upcomming Religion Sanatan section close here ///////////////////////////


//////////////////////////////////////// Upcomming Statics Achievements section start  here ///////////////////////////

router.post(
  "/insertupcomming_statistics_achievements",
  checkApiKey,
  upload.none(),  // 👈 This handles FormData without files
  async (req, res) => {
    try {
      const {
        stat_number,
        stat_text,
        description,
        note,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

      // Validate
      if (!stat_number || !stat_text || !description) {
        return res.status(400).json({
          error: "Stat number, text, and description are required!",
        });
      }

      const sql = `
        INSERT INTO upcomming_statistics_achievements
        (stat_number, stat_text, description, note, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        stat_number,
        stat_text,
        description,
        note,
        status,
        created_by,
        creation_date,
      ]);

      const insertedId = result.insertId;
      const [rows] = await db.query(
        "SELECT * FROM upcomming_statistics_achievements WHERE id = ?",
        [insertedId]
      );

      res.json({ success: true, record: rows[0] });
    } catch (err) {
      console.error("❌ Insert Error (Upcomming Statistics Achievements):", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


// Select
router.get("/selectupcomming_statistics_achievements", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM upcomming_statistics_achievements");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error (Upcomming Statistics Achievements):", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});


// ✅ UPDATE route
// ✅ Correct
router.put("/updateupcomming_statistics_achievements/:id",
  checkApiKey,

  async (req, res) => {
    try {
      const { id } = req.params;
      const { stat_number, stat_text, description, note, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM upcomming_statistics_achievements WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];
      if (stat_number) { updateFields.push("stat_number=?"); values.push(stat_number); }
      if (stat_text) { updateFields.push("stat_text=?"); values.push(stat_text); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (note) { updateFields.push("note=?"); values.push(note); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     


      values.push(id);

      const sql = `UPDATE upcomming_statistics_achievements SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM upcomming_statistics_achievements WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ upcomming_statistics_achievements updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deleteupcomming_statistics_achievements/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM upcomming_statistics_achievements WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM upcomming_statistics_achievements WHERE id=?", [id]);
    res.json({ success: true, message: "✅ upcomming_statistics_achievements deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusupcomming_statistics_achievements/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM upcomming_statistics_achievements WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE upcomming_statistics_achievements SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Upcomming Statics Achievements section close here ///////////////////////////



//////////////////////////////////////// Kanya Vivah Video Slider section start  here ///////////////////////////

router.post(
  "/insertkanyavivah_videoslider",
  checkApiKey,
  upload.single("videoimg"), // this must match input name
  async (req, res) => {
    try {
      const {
        selectedType,
        title,
        alt,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

       const videoimg = req.file ? `/uploads/${req.file.filename}` : null;

      if (!selectedType || !title) {
        return res.status(400).json({ error: "selectedType and title are required!" });
      }

      const sql = `
        INSERT INTO kanyavivah_videoslider
        (type, videoimg, title, alt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        selectedType,
        videoimg,
        title,
        alt,
        status,
        created_by,
        creation_date,
      ]);

      const [rows] = await db.query(
        "SELECT * FROM kanyavivah_videoslider WHERE id=?",
        [result.insertId]
      );

      res.json({ success: true, message: "✅ Inserted successfully", record: rows[0] });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// ✅ GET — Fetch all
router.get("/selectkanyavivah_videoslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kanyavivah_videoslider ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});




// ✅ UPDATE route
// ✅ Correct
router.put(
  "/updatekanyavivah_videoslider/:id",
  checkApiKey,
  upload.fields([{ name: "videoimg", maxCount: 1 }]),

   async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedType, title, alt, status, created_by, creation_date } = req.body;

    // Check if required fields exist in request body
    if (!selectedType ||  !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM kanyavivah_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    let updateFields = [];
    let values = [];
    if (selectedType) { updateFields.push("Type=?"); values.push(selectedType); }
    //if (videoimg) { updateFields.push("videoimg=?"); values.push(videoimg); }
    if (title) { updateFields.push("title=?"); values.push(title); }
    if (alt) { updateFields.push("alt=?"); values.push(alt); }
    if (status) { updateFields.push("status=?"); values.push(status); }
    if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
    if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }


    let imgPath = rows[0].videoimg;

      if (req.files?.videoimg) {
        imgPath = "/uploads/" + req.files.videoimg[0].filename;
        updateFields.push("videoimg=?");
        values.push(imgPath);
      }

      

    values.push(id);

    const sql = `UPDATE kanyavivah_videoslider SET ${updateFields.join(", ")} WHERE id=?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Update failed!" });
    }

    const [updated] = await db.query("SELECT * FROM kanyavivah_videoslider WHERE id=?", [id]);

    res.json({
      success: true,
      message: "✅ kanyavivah_videoslider updated successfully!",
      record: updated[0],
    });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ error: "Update failed!", details: err.message });
  }
});



// ✅ Delete route
router.delete("/deletekanyavivah_videoslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM kanyavivah_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM kanyavivah_videoslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ kanyavivah_videoslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statuskanyavivah_videoslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM kanyavivah_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE kanyavivah_videoslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Kanya Vivah Video Slider section close here ///////////////////////////




//////////////////////////////////////// Kanya Vivah Our purpose section start here ///////////////////////////
router.post("/insertkanyavivah_ourpurpose", checkApiKey, upload.none(), async (req, res) => {
  try {
    // Destructure the body to extract the fields
    const { videoUrl, infoText, title, purposeTitle, purposeText, journeyTitle, journeyText, status, created_by, creation_date } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required!" });
    }

    if (!videoUrl) {
      return res.status(400).json({ error: "Video URL is required!" });
    }

    const sql = `
      INSERT INTO kanyavivah_ourpurpose
      (videoUrl, infoText, title, purposeTitle, purposeText, journeyTitle, journeyText, status, created_by, creation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      videoUrl,
      infoText,
      title,
      purposeTitle,
      purposeText,
      journeyTitle,
      journeyText,
      status,
      created_by,
      creation_date
    ]);

    // Send back only the record data, without success and record wrappers
    res.json({
      id: result.insertId,
      videoUrl,
      infoText,
      title,
      purposeTitle,
      purposeText,
      journeyTitle,
      journeyText,
      status,
      created_by,
      creation_date,
    });

  } catch (err) {
    console.error("❌ Insert Error:", err);
    res.status(500).json({ error: "Insert failed!", details: err.message });
  }
});


router.get("/selectkanyavivah_ourpurpose", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kanyavivah_ourpurpose");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
router.put(
  "/updatekanyavivah_ourpurpose/:id",
  checkApiKey,
  upload.none(), // Use multer to parse FormData (this is the key change)
  async (req, res) => {
    try {
      console.log("Request body:", req.body); // Log request body for debugging

      const { id } = req.params;
      const {
        videoUrl,
        title,
        infoText,
        purposeTitle,
        purposeText,
        journeyTitle,
        journeyText,
        created_by,
        status,
      } = req.body;

      // Check if the record exists
      const [rows] = await db.query("SELECT * FROM kanyavivah_ourpurpose WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // Build the update query
      let updateFields = [];
      let values = [];

      if (videoUrl) { updateFields.push("videoUrl=?"); values.push(videoUrl); }
      if (infoText) { updateFields.push("infoText=?"); values.push(infoText); }
      if (title) { updateFields.push("title=?"); values.push(title); }
      if (purposeTitle) { updateFields.push("purposeTitle=?"); values.push(purposeTitle); }
      if (purposeText) { updateFields.push("purposeText=?"); values.push(purposeText); }
      if (journeyTitle) { updateFields.push("journeyTitle=?"); values.push(journeyTitle); }
      if (journeyText) { updateFields.push("journeyText=?"); values.push(journeyText); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      values.push(id);

      const sql = `UPDATE kanyavivah_ourpurpose SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // Fetch updated record
      const [updated] = await db.query("SELECT * FROM kanyavivah_ourpurpose WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Data updated successfully!",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);





// ✅ Delete route
router.delete("/deletekanyavivah_ourpurpose/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM kanyavivah_ourpurpose WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM kanyavivah_ourpurpose WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Kanya Vivah Our Purpose deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statuskanyavivah_ourpurpose/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM kanyavivah_ourpurpose WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE kanyavivah_ourpurpose SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Kanya Vivah Our purpose section close here ///////////////////////////


//////////////////////////////////////// Kanya Vivah Dates section start here ////////////////////////////////
router.post(
  "/insertkanyavivah_dates",
  checkApiKey,
  upload.fields([{ name: "img", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { year, title, desc, status, creation_date, created_by } = req.body;

      if (!title || !req.files?.img) {
        return res.status(400).json({ error: "Title and Image are required!" });
      }

      const img = "/uploads/" + req.files.img[0].filename;

      // Escape 'desc' as it is a reserved keyword in MySQL/MariaDB
      const sql = `
        INSERT INTO kanyavivah_dates
        (year, title, \`desc\`, img, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        year,
        title,
        desc,
        img,
        status || "active",
        created_by,
        creation_date,
      ]);

      const [rows2] = await db.query("SELECT * FROM kanyavivah_dates WHERE id = ?", [result.insertId]);
      const record = rows2[0];

      res.json({
        success: true,
        record,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


// — Get all Kanya Vivah Dates
router.get("/selectkanyavivah_dates", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kanyavivah_dates ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// — Update (PUT)
router.put(
  "/insertkanyavivah_dates/:id",
  checkApiKey,
  upload.fields([{ name: "img", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { year, title, desc, status, creation_date, created_by } = req.body;

      // Check if the record exists
      const [existing] = await db.query("SELECT * FROM kanyavivah_dates WHERE id = ?", [id]);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      let img = existing[0].img;
      if (req.files?.img) {
        img = "/uploads/" + req.files.img[0].filename;
      }

      // Update query with escaped `desc`
      const sql = `
        UPDATE kanyavivah_dates
        SET year=?, title=?, \`desc\`=?, img=?, status=?, created_by=?, creation_date=?
        WHERE id=?
      `;
      const [result] = await db.query(sql, [
        year,
        title,
        desc,
        img,
        status,
        created_by,
        creation_date,
        id,
      ]);

      // Fetch the updated record
      const [rows2] = await db.query("SELECT * FROM kanyavivah_dates WHERE id = ?", [id]);
      const record = rows2[0];

      res.json({
        success: true,
        record,
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed", details: err.message });
    }
  }
);

// — Delete
router.delete("/deletekanyavivah_dates/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ensure record exists
    const [rows] = await db.query("SELECT * FROM kanyavivah_dates WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    await db.query("DELETE FROM kanyavivah_dates WHERE id = ?", [id]);
    res.json({ success: true, message: "Deleted successfully", id });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// — Toggle status (PATCH)
router.patch("/statuskanyavivah_dates/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM kanyavivah_dates WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }
    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query("UPDATE kanyavivah_dates SET status = ? WHERE id = ?", [
      newStatus,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({
      success: true,
      status: newStatus,
      id,
    });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Kanya Vivah Dates section close here ////////////////////////////////


//////////////////////////////////////// Kanya Vivah Supports section start here ////////////////////////////////
router.post(
  "/insertkanyavivah_support",
  checkApiKey, // Your API key check middleware
  (req, res) => {
    try {
      const {
        title,
        description,
        additional_info,
        closing_note,
        button_text,
        button_link,
        status,
        creation_date,
        created_by,
      } = req.body;

      if (!title || !description || !status || !creation_date || !created_by) {
        return res.status(400).json({ error: "All fields are required!" });
      }

      // SQL query for insertion
      const sql = `
        INSERT INTO kanyavivah_support
        (title, description, additional_info, closing_note, button_text, button_link, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Use the callback version of query
      db.query(sql, [
        title,
        description,
        additional_info,
        closing_note,
        button_text,
        button_link,
        status,
        created_by,
        creation_date,
      ], (err, result) => {
        if (err) {
          console.error("❌ Insert Error:", err);
          return res.status(500).json({ error: "Insert failed!", details: err.message });
        }

        // Respond with the inserted record
        res.json({
          success: true,
          id: result.insertId,
          record: {
            id: result.insertId,
            title,
            description,
            additional_info,
            closing_note,
            button_text,
            button_link,
            status,
            created_by,
            creation_date,
          },
        });
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);





router.get("/selectkanyavivah_support", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM kanyavivah_support");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
// ✅ UPDATE route
router.put(
  "/updatekanyavivah_support/:id",
  checkApiKey, // Your API key check middleware
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        additional_info,
        closing_note,
        button_text,
        button_link,
        creation_date,
        created_by,
        status,
      } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM kanyavivah_support WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (additional_info) { updateFields.push("additional_info=?"); values.push(additional_info); }
      if (closing_note) { updateFields.push("closing_note=?"); values.push(closing_note); }
      if (button_text) { updateFields.push("button_text=?"); values.push(button_text); }
      if (button_link) { updateFields.push("button_link=?"); values.push(button_link); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      values.push(id); // Always push the id as the last value for the WHERE clause

      // ✅ Execute the update query
      const sql = `UPDATE kanyavivah_support SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      // ✅ Check if any row was updated
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "No changes were made to the record." });
      }

      // ✅ Fetch the updated record
      const [updated] = await db.query("SELECT * FROM kanyavivah_support WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Data updated successfully!",
        data: updated[0],  // Send back the updated record
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);




// ✅ Delete route
router.delete("/deletekanyavivah_support/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM kanyavivah_support WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM kanyavivah_support WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Kanya Vivah Support deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statuskanyavivah_support/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM kanyavivah_support WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE kanyavivah_support SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Kanya Vivah Supports section close here ////////////////////////////////

//////////////////////////////////////// Cancer Hospital Video Slider section start  here ///////////////////////////

router.post(
  "/insertcancerhospital_videoslider",
  checkApiKey,
  upload.single("videoimg"), // this must match input name
  async (req, res) => {
    try {
      const {
        selectedType,
        title,
        alt,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

       const videoimg = req.file ? `/uploads/${req.file.filename}` : null;

      if (!selectedType || !title) {
        return res.status(400).json({ error: "selectedType and title are required!" });
      }

      const sql = `
        INSERT INTO cancerhospital_videoslider
        (type, videoimg, title, alt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        selectedType,
        videoimg,
        title,
        alt,
        status,
        created_by,
        creation_date,
      ]);

      const [rows] = await db.query(
        "SELECT * FROM cancerhospital_videoslider WHERE id=?",
        [result.insertId]
      );

      res.json({ success: true, message: "✅ Inserted successfully", record: rows[0] });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// ✅ GET — Fetch all
router.get("/selectcancerhospital_videoslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cancerhospital_videoslider ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});




// ✅ UPDATE route
// ✅ Correct
router.put(
  "/updatecancerhospital_videoslider/:id",
  checkApiKey,
  upload.fields([{ name: "videoimg", maxCount: 1 }]),

   async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedType, title, alt, status, created_by, creation_date } = req.body;

    // Check if required fields exist in request body
    if (!selectedType ||  !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM cancerhospital_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    let updateFields = [];
    let values = [];
    if (selectedType) { updateFields.push("Type=?"); values.push(selectedType); }
    //if (videoimg) { updateFields.push("videoimg=?"); values.push(videoimg); }
    if (title) { updateFields.push("title=?"); values.push(title); }
    if (alt) { updateFields.push("alt=?"); values.push(alt); }
    if (status) { updateFields.push("status=?"); values.push(status); }
    if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
    if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }


    let imgPath = rows[0].videoimg;

      if (req.files?.videoimg) {
        imgPath = "/uploads/" + req.files.videoimg[0].filename;
        updateFields.push("videoimg=?");
        values.push(imgPath);
      }

      

    values.push(id);

    const sql = `UPDATE cancerhospital_videoslider SET ${updateFields.join(", ")} WHERE id=?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Update failed!" });
    }

    const [updated] = await db.query("SELECT * FROM cancerhospital_videoslider WHERE id=?", [id]);

    res.json({
      success: true,
      message: "✅ cancerhospital_videoslider updated successfully!",
      record: updated[0],
    });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ error: "Update failed!", details: err.message });
  }
});



// ✅ Delete route
router.delete("/deletecancerhospital_videoslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM cancerhospital_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM cancerhospital_videoslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ cancerhospital_videoslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statuscancerhospital_videoslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM cancerhospital_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE cancerhospital_videoslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Cancer Hospital Video Slider section close here ///////////////////////////

//////////////////////////////////////// Cancer Hospital Research Data section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post("/insertcancerhospital_researchdata", checkApiKey, upload.none(), async (req, res) => {
  try {
    const { title, subtitle, video_url, paragraphs, status, created_by, creation_date } = req.body;

    if (!title) return res.status(400).json({ error: "Title is required!" });
    if (!video_url) return res.status(400).json({ error: "Video URL is required!" });

    // ✅ Parse paragraphs (ensure it's stored as JSON string)
    let paragraphsData;
    try {
      paragraphsData = Array.isArray(paragraphs)
        ? paragraphs
        : JSON.parse(paragraphs || "[]");
    } catch {
      paragraphsData = [paragraphs]; // fallback if not JSON
    }

    const sql = `
      INSERT INTO cancerhospital_researchdata
      (title, subtitle, video_url, paragraphs, status, created_by, creation_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      title,
      subtitle,
      video_url,
      JSON.stringify(paragraphsData), // ✅ Store as JSON string
      status,
      created_by,
      creation_date,
    ]);

    res.json({
      id: result.insertId,
      title,
      subtitle,
      video_url,
      paragraphs: paragraphsData,
      status,
      created_by,
      creation_date,
    });
  } catch (err) {
    console.error("❌ Insert Error:", err);
    res.status(500).json({ error: "Insert failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectcancerhospital_researchdata", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cancerhospital_researchdata");

    // ✅ Parse paragraphs JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      paragraphs: (() => {
        try {
          return JSON.parse(row.paragraphs || "[]");
        } catch {
          return [row.paragraphs];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put("/updatecancerhospital_researchdata/:id", checkApiKey, upload.none(), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, video_url, paragraphs, created_by, status, creation_date } = req.body;

    // ✅ Parse paragraphs
    let paragraphsData;
    try {
      paragraphsData = Array.isArray(paragraphs)
        ? paragraphs
        : JSON.parse(paragraphs || "[]");
    } catch {
      paragraphsData = [paragraphs];
    }

    // Check if record exists
    const [rows] = await db.query("SELECT * FROM cancerhospital_researchdata WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    // Build update query
    const updateFields = [];
    const values = [];

    if (title) { updateFields.push("title=?"); values.push(title); }
    if (subtitle) { updateFields.push("subtitle=?"); values.push(subtitle); }
    if (video_url) { updateFields.push("video_url=?"); values.push(video_url); }
    if (paragraphsData) { updateFields.push("paragraphs=?"); values.push(JSON.stringify(paragraphsData)); }
    if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
    if (status) { updateFields.push("status=?"); values.push(status); }
    if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }

    values.push(id);

    const sql = `UPDATE cancerhospital_researchdata SET ${updateFields.join(", ")} WHERE id=?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Update failed!" });

    // Fetch updated record
    const [updated] = await db.query("SELECT * FROM cancerhospital_researchdata WHERE id=?", [id]);
    const record = updated[0];
    record.paragraphs = JSON.parse(record.paragraphs || "[]");

    res.json({
      success: true,
      message: "✅ Data updated successfully!",
      data: record,
    });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ error: "Update failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletecancerhospital_researchdata/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM cancerhospital_researchdata WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM cancerhospital_researchdata WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Cancer Hospital Research Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statuscancerhospital_researchdata/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM cancerhospital_researchdata WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE cancerhospital_researchdata SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Cancer Hospital Research Data section close here ///////////////////////////

//////////////////////////////////////// Cancer Hospital Poojan Data section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
// INSERT API
router.post(
  "/insertcancerhospital_poojandata",
  checkApiKey,
  upload.fields([
    { name: "project_images", maxCount: 10 },
    { name: "pm_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        instagram_icon,
        instagram_title,
        instagram_description,
        instagram_link,
        description,
        videos,
        features_title,
        features_list,
        status,
        created_by,
        creation_date,
      } = req.body;

      // ✅ Safely handle undefined req.files
      const files = req.files || {};

      const projectImages = files["project_images"]
        ? files["project_images"].map((file) => `/uploads/${file.filename}`)
        : [];

      const pmImage = files["pm_image"]
        ? `/uploads/${files["pm_image"][0].filename}`
        : null;

      // ✅ Parse arrays safely
      const parseJSON = (data) => {
        try {
          return typeof data === "string" ? JSON.parse(data) : data || [];
        } catch {
          return [];
        }
      };

      const descriptionData = parseJSON(description);
      const videosData = parseJSON(videos);
      const featuresData = parseJSON(features_list);

      const sql = `
        INSERT INTO cancerhospital_poojandata
        (instagram_icon, instagram_title, instagram_description, instagram_link, description, videos, features_title, features_list, status, created_by, creation_date, project_images, pm_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        instagram_icon,
        instagram_title,
        instagram_description,
        instagram_link,
        JSON.stringify(descriptionData),
        JSON.stringify(videosData),
        features_title,
        JSON.stringify(featuresData),
        status,
        created_by,
        creation_date,
        JSON.stringify(projectImages),
        pmImage,
      ]);

      res.json({
        id: result.insertId,
        instagram_icon,
        instagram_title,
        instagram_description,
        instagram_link,
        description: descriptionData,
        videos: videosData,
        features_title,
        features_list: featuresData,
        status,
        created_by,
        creation_date,
        project_images: projectImages,
        pm_image: pmImage,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


// SELECT ALL
router.get("/selectcancerhospital_poojandata", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cancerhospital_poojandata");
    const parsedRows = rows.map((row) => ({
      ...row,
      description: (() => {
        try {
          return JSON.parse(row.description || "[]");
        } catch {
          return [row.description];
        }
      })(),
      videos: (() => {
        try {
          return JSON.parse(row.videos || "[]");
        } catch {
          return [row.videos];
        }
      })(),
      features_list: (() => {
        try {
          return JSON.parse(row.features_list || "[]");
        } catch {
          return [row.features_list];
        }
      })(),
      project_images: JSON.parse(row.project_images || "[]"),
    }));
    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// UPDATE API
router.put(
  "/updatecancerhospital_poojandata/:id",
  checkApiKey,
  upload.fields([
    { name: "project_images", maxCount: 10 },
    { name: "pm_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        instagram_icon,
        instagram_title,
        instagram_description,
        instagram_link,
        description,
        videos,
        features_title,
        features_list,
        status,
        created_by,
        creation_date,
      } = req.body;

      const projectImages = req.files["project_images"]
        ? req.files["project_images"].map(
            (file) => `/uploads/${file.filename}`
          )
        : null;

      const pmImage = req.files["pm_image"]
        ? `/uploads/${req.files["pm_image"][0].filename}`
        : null;

      // Parse arrays
      let descriptionData = [];
      try {
        descriptionData =
          typeof description === "string"
            ? JSON.parse(description)
            : description || [];
      } catch {
        descriptionData = [description];
      }
      let videosData = [];
      try {
        videosData = typeof videos === "string" ? JSON.parse(videos) : videos || [];
      } catch {
        videosData = [];
      }
      let featuresData = [];
      try {
        featuresData =
          typeof features_list === "string"
            ? JSON.parse(features_list)
            : features_list || [];
      } catch {
        featuresData = [];
      }

      // Check if record exists
      const [rows] = await db.query("SELECT * FROM cancerhospital_poojandata WHERE id=?", [id]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found" });

      const updateFields = [];
      const values = [];

      // Build update query dynamically
      if (instagram_icon) { updateFields.push("instagram_icon=?"); values.push(instagram_icon); }
      if (instagram_title) { updateFields.push("instagram_title=?"); values.push(instagram_title); }
      if (instagram_description) { updateFields.push("instagram_description=?"); values.push(instagram_description); }
      if (instagram_link) { updateFields.push("instagram_link=?"); values.push(instagram_link); }
      if (description) { updateFields.push("description=?"); values.push(JSON.stringify(descriptionData)); }
      if (videos) { updateFields.push("videos=?"); values.push(JSON.stringify(videosData)); }
      if (features_title) { updateFields.push("features_title=?"); values.push(features_title); }
      if (features_list) { updateFields.push("features_list=?"); values.push(JSON.stringify(featuresData)); }
      if (projectImages) { updateFields.push("project_images=?"); values.push(JSON.stringify(projectImages)); }
      if (pmImage) { updateFields.push("pm_image=?"); values.push(pmImage); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }

      values.push(id);
      const sql = `UPDATE cancerhospital_poojandata SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0)
        return res.status(400).json({ error: "Update failed" });

      const [updated] = await db.query("SELECT * FROM cancerhospital_poojandata WHERE id=?", [id]);
      const record = updated[0];
      record.description = JSON.parse(record.description || "[]");
      record.videos = JSON.parse(record.videos || "[]");
      record.features_list = JSON.parse(record.features_list || "[]");
      record.project_images = JSON.parse(record.project_images || "[]");

      res.json({ success: true, message: "✅ Data updated successfully!", data: record });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// DELETE API
router.delete(
  "/deletecancerhospital_poojandata/:id",
  checkApiKey,
  async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.query("SELECT * FROM cancerhospital_poojandata WHERE id=?", [id]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found" });
      await db.query("DELETE FROM cancerhospital_poojandata WHERE id=?", [id]);
      res.json({ success: true, message: "✅ Cancer Hospital Poojan Data deleted successfully!" });
    } catch (err) {
      console.error("❌ Delete Error:", err);
      res.status(500).json({ error: "Delete failed!", details: err.message });
    }
  }
);

// PATCH Status API
router.patch(
  "/statuscancerhospital_poojandata/:id/status",
  checkApiKey,
  async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await db.query("SELECT status FROM cancerhospital_poojandata WHERE id=?", [id]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found" });
      const currentStatus = rows[0].status;
      const newStatus = currentStatus === "active" ? "inactive" : "active";

      const [result] = await db.query("UPDATE cancerhospital_poojandata SET status=? WHERE id=?", [newStatus, id]);
      if (result.affectedRows === 0)
        return res.status(400).json({ error: "Status not updated" });
      res.json({ success: true, message: "Status updated!", status: newStatus });
    } catch (err) {
      console.error("❌ Status Update Error:", err);
      res.status(500).json({ error: "Failed to update status", details: err.message });
    }
  }
);

//////////////////////////////////////// Cancer Hospital Poojan Data section close here ///////////////////////////

//////////////////////////////////////// Cancer Hospital Sahayog section start here ////////////////////////////////
router.post(
  "/insertcancerhospital_sahayog",
  checkApiKey, // Your API key check middleware
  (req, res) => {
    try {
      const {
        title,
        description,
        point1,
        point2,
        point3,
        point4,
        buttonText,
        buttonLink,
        footerNote,
        status,
        creation_date,
        created_by,
      } = req.body;

      if (!title || !description || !status || !creation_date || !created_by) {
        return res.status(400).json({ error: "All fields are required!" });
      }

      // SQL query for insertion
      const sql = `
        INSERT INTO cancerhospital_sahayog
        (title, description, point1, point2, point3, point4, buttonText, buttonLink, footerNote, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Use the callback version of query
      db.query(sql, [
        title,
        description,
        point1,
        point2,
        point3,
        point4,
        buttonText,
        buttonLink,
        footerNote,
        status,
        created_by,
        creation_date,
      ], (err, result) => {
        if (err) {
          console.error("❌ Insert Error:", err);
          return res.status(500).json({ error: "Insert failed!", details: err.message });
        }

        // Respond with the inserted record
        res.json({
          success: true,
          id: result.insertId,
          record: {
            id: result.insertId,
            title,
            description,
            point1,
            point2,
            point3,
            point4,
            buttonText,
            buttonLink,
            footerNote,
            status,
            created_by,
            creation_date,
          },
        });
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);





router.get("/selectcancerhospital_sahayog", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cancerhospital_sahayog");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
// ✅ UPDATE route
router.put(
  "/updatecancerhospital_sahayog/:id",
  checkApiKey, // Your API key check middleware
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        point1,
        point2,
        point3,
        point4,
        buttonText,
        buttonLink,
        footerNote,
        creation_date,
        created_by,
        status,
      } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM cancerhospital_sahayog WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (point1) { updateFields.push("point1=?"); values.push(point1); }
      if (point2) { updateFields.push("point2=?"); values.push(point2); }
      if (point3) { updateFields.push("point3=?"); values.push(point3); }
      if (point4) { updateFields.push("point4=?"); values.push(point4); }
      if (buttonText) { updateFields.push("buttonText=?"); values.push(buttonText); }
      if (buttonLink) { updateFields.push("buttonLink=?"); values.push(buttonLink); }
      if (footerNote) { updateFields.push("footerNote=?"); values.push(footerNote); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      values.push(id); // Always push the id as the last value for the WHERE clause

      // ✅ Execute the update query
      const sql = `UPDATE cancerhospital_sahayog SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      // ✅ Check if any row was updated
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "No changes were made to the record." });
      }

      // ✅ Fetch the updated record
      const [updated] = await db.query("SELECT * FROM cancerhospital_sahayog WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Data updated successfully!",
        data: updated[0],  // Send back the updated record
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);




// ✅ Delete route
router.delete("/deletecancerhospital_sahayog/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM cancerhospital_sahayog WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM cancerhospital_sahayog WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Cancer Hospital Sahayog deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statuscancerhospital_sahayog/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM cancerhospital_sahayog WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE cancerhospital_sahayog SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Cancer Hospital Sahayog section close here ////////////////////////////////

//////////////////////////////////////// Gua Raksha Video Slider section start  here ///////////////////////////

router.post(
  "/insertgauraksha_videoslider",
  checkApiKey,
  upload.single("videoimg"), // this must match input name
  async (req, res) => {
    try {
      const {
        selectedType,
        title,
        alt,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

       const videoimg = req.file ? `/uploads/${req.file.filename}` : null;

      if (!selectedType || !title) {
        return res.status(400).json({ error: "selectedType and title are required!" });
      }

      const sql = `
        INSERT INTO gauraksha_videoslider
        (type, videoimg, title, alt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        selectedType,
        videoimg,
        title,
        alt,
        status,
        created_by,
        creation_date,
      ]);

      const [rows] = await db.query(
        "SELECT * FROM gauraksha_videoslider WHERE id=?",
        [result.insertId]
      );

      res.json({ success: true, message: "✅ Inserted successfully", record: rows[0] });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// ✅ GET — Fetch all
router.get("/selectgauraksha_videoslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gauraksha_videoslider ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});




// ✅ UPDATE route
// ✅ Correct
router.put(
  "/updategauraksha_videoslider/:id",
  checkApiKey,
  upload.fields([{ name: "videoimg", maxCount: 1 }]),

   async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedType, title, alt, status, created_by, creation_date } = req.body;

    // Check if required fields exist in request body
    if (!selectedType ||  !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM gauraksha_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    let updateFields = [];
    let values = [];
    if (selectedType) { updateFields.push("Type=?"); values.push(selectedType); }
    //if (videoimg) { updateFields.push("videoimg=?"); values.push(videoimg); }
    if (title) { updateFields.push("title=?"); values.push(title); }
    if (alt) { updateFields.push("alt=?"); values.push(alt); }
    if (status) { updateFields.push("status=?"); values.push(status); }
    if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
    if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }


    let imgPath = rows[0].videoimg;

      if (req.files?.videoimg) {
        imgPath = "/uploads/" + req.files.videoimg[0].filename;
        updateFields.push("videoimg=?");
        values.push(imgPath);
      }

      

    values.push(id);

    const sql = `UPDATE gauraksha_videoslider SET ${updateFields.join(", ")} WHERE id=?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Update failed!" });
    }

    const [updated] = await db.query("SELECT * FROM gauraksha_videoslider WHERE id=?", [id]);

    res.json({
      success: true,
      message: "✅ gauraksha_videoslider updated successfully!",
      record: updated[0],
    });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ error: "Update failed!", details: err.message });
  }
});



// ✅ Delete route
router.delete("/deletegauraksha_videoslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM gauraksha_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM gauraksha_videoslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ gauraksha_videoslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusgauraksha_videoslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM gauraksha_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE gauraksha_videoslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Gua Raksha Video Slider section close here ///////////////////////////


//////////////////////////////////////// Gua Raksha Cow Protection section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post(
  "/insertguaraksha_cowprotection",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const {
        title,
        paragraphs,
        wrongNote,
        rightNote,
        alert,
        cta,
        bottomText,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title) return res.status(400).json({ error: "Title required" });

      // Multer uploaded images → filenames
      const imageFiles = req.files.map((file) => file.filename);

      // Parse paragraphs
      let paragraphsData = JSON.parse(paragraphs || "[]");

      const sql = `
        INSERT INTO guaraksha_cowprotection 
        (images, title, paragraphs, wrongNote, rightNote, alert, cta, bottomText, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        JSON.stringify(imageFiles),
        title,
        JSON.stringify(paragraphsData),
        wrongNote,
        rightNote,
        alert,
        cta,
        bottomText,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        images: imageFiles,
        title,
        paragraphs: paragraphsData,
        wrongNote,
        rightNote,
        alert,
        cta,
        bottomText,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);

/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectguaraksha_cowprotection", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM guaraksha_cowprotection");

    // ✅ Parse paragraphs JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      paragraphs: (() => {
        try {
          return JSON.parse(row.paragraphs || "[]");
        } catch {
          return [row.paragraphs];
        }
      })(),
      images: (() => {
        try {
          return JSON.parse(row.images || "[]");
        } catch {
          return [row.images];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updateguaraksha_cowprotection/:id",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        paragraphs,
        wrongNote,
        rightNote,
        alert,
        cta,
        bottomText,
        created_by,
        status,
        creation_date,
      } = req.body;

      // Existing record
      const [rows] = await db.query(
        "SELECT * FROM guaraksha_cowprotection WHERE id=?",
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found!" });

      const oldRecord = rows[0];

      // Parse paragraphs
      let paragraphsData;
      try {
        paragraphsData = JSON.parse(paragraphs || "[]");
      } catch {
        paragraphsData = [paragraphs];
      }

      // NEW: Uploaded images (if any)
      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        uploadedImages = req.files.map((file) => file.filename);
      } else {
        // Keep old images if none uploaded
        uploadedImages = JSON.parse(oldRecord.images || "[]");
      }

      // Build update SQL
      const sql = `
        UPDATE guaraksha_cowprotection 
        SET 
          images = ?, 
          title = ?, 
          paragraphs = ?, 
          wrongNote = ?, 
          rightNote = ?, 
          alert = ?, 
          cta = ?, 
          bottomText = ?, 
          created_by = ?, 
          status = ?, 
          creation_date = ?
        WHERE id = ?
      `;

      const values = [
        JSON.stringify(uploadedImages),
        title,
        JSON.stringify(paragraphsData),
        wrongNote,
        rightNote,
        alert,
        cta,
        bottomText,
        created_by,
        status,
        creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      const [updated] = await db.query(
        "SELECT * FROM guaraksha_cowprotection WHERE id=?",
        [id]
      );

      updated[0].images = JSON.parse(updated[0].images || "[]");
      updated[0].paragraphs = JSON.parse(updated[0].paragraphs || "[]");

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deleteguaraksha_cowprotection/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM guaraksha_cowprotection WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM guaraksha_cowprotection WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Guaraksha Cow Protection Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusguaraksha_cowprotection/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM guaraksha_cowprotection WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE guaraksha_cowprotection SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Gua Raksha Cow Protection section close here ///////////////////////////


//////////////////////////////////////// Gua Raksha Cow Thumbnail section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post(
  "/insertguaraksha_cowthumbnails",
  checkApiKey,
  upload.array("images", 16),
  async (req, res) => {
    try {
      const { status, created_by, creation_date } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Images required" });
      }

      const imageFiles = req.files.map((file) => file.filename);

      const sql = `
        INSERT INTO guaraksha_cowthumbnails 
        (images, status, created_by, creation_date)
        VALUES (?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        JSON.stringify(imageFiles),
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        images: imageFiles,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectguaraksha_cowthumbnails", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM guaraksha_cowthumbnails");

    // ✅ Parse paragraphs JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      paragraphs: (() => {
        try {
          return JSON.parse(row.paragraphs || "[]");
        } catch {
          return [row.paragraphs];
        }
      })(),
      images: (() => {
        try {
          return JSON.parse(row.images || "[]");
        } catch {
          return [row.images];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updateguaraksha_cowthumbnails/:id",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        created_by,
        status,
        creation_date,
      } = req.body;

      // Existing record
      const [rows] = await db.query(
        "SELECT * FROM guaraksha_cowthumbnails WHERE id=?",
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found!" });

      const oldRecord = rows[0];

      // NEW: Uploaded images (if any)
      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        uploadedImages = req.files.map((file) => file.filename);
      } else {
        // Keep old images if none uploaded
        uploadedImages = JSON.parse(oldRecord.images || "[]");
      }

      // Build update SQL
      const sql = `
        UPDATE guaraksha_cowthumbnails 
        SET 
          images = ?, 
          created_by = ?, 
          status = ?, 
          creation_date = ?
        WHERE id = ?
      `;

      const values = [
        JSON.stringify(uploadedImages),
        created_by,
        status,
        creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      const [updated] = await db.query(
        "SELECT * FROM guaraksha_cowthumbnails WHERE id=?",
        [id]
      );

      updated[0].images = JSON.parse(updated[0].images || "[]");


      res.json({
        success: true,
        message: "Updated Successfully",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deleteguaraksha_cowthumbnails/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM guaraksha_cowthumbnails WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM guaraksha_cowthumbnails WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Guaraksha Cow Thumbnails Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusguaraksha_cowthumbnails/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM guaraksha_cowthumbnails WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE guaraksha_cowthumbnails SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Gua Raksha Cow Thumbnail section close here ///////////////////////////


//////////////////////////////////////// Gua Raksha Sahayog section start here ////////////////////////////////
router.post(
  "/insertgauraksha_sahayog",
  checkApiKey,
  (req, res) => {
    try {
      const {
        titleEmojiStart,
        titleText,
        titleEmojiEnd,
        line1,
        line2,
        line3,
        quote,
        highlight,
        buttonText,
        buttonLink,
        status,
        creation_date,
        created_by,
      } = req.body;

      // Validate required fields
      if (!titleEmojiStart || !titleText || !status || !creation_date || !created_by) {
        return res.status(400).json({ error: "All fields are required!" });
      }

      // ✅ Fixed query (13 placeholders)
      const sql = `
        INSERT INTO gauraksha_sahayog
        (titleEmojiStart, titleText, titleEmojiEnd, line1, line2, line3, quote, highlight, buttonText, buttonLink, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // ✅ Correct parameter order (13 values)
      db.query(
        sql,
        [
          titleEmojiStart,
          titleText,
          titleEmojiEnd,
          line1,
          line2,
          line3,
          quote,
          highlight,
          buttonText,
          buttonLink,
          status,
          created_by,
          creation_date,
        ],
        (err, result) => {
          if (err) {
            console.error("❌ Insert Error:", err);
            return res.status(500).json({
              error: "Insert failed!",
              details: err.message,
            });
          }

          res.json({
            success: true,
            id: result.insertId,
            record: {
              id: result.insertId,
              titleEmojiStart,
              titleText,
              titleEmojiEnd,
              line1,
              line2,
              line3,
              quote,
              highlight,
              buttonText,
              buttonLink,
              status,
              created_by,
              creation_date,
            },
          });
        }
      );
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);






router.get("/selectgauraksha_sahayog", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM gauraksha_sahayog");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
// ✅ UPDATE route
router.put(
  "/updategauraksha_sahayog/:id",
  checkApiKey, // Your API key check middleware
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        titleEmojiStart,
        titleText,
        titleEmojiEnd,
        line1,
        line2,
        line3,
        quote,
        highlight,
        buttonText,
        buttonLink,
        creation_date,
        created_by,
        status,
      } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM gauraksha_sahayog WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (titleEmojiStart) { updateFields.push("titleEmojiStart=?"); values.push(titleEmojiStart); }
      if (titleText) { updateFields.push("titleText=?"); values.push(titleText); }
      if (titleEmojiEnd) { updateFields.push("titleEmojiEnd=?"); values.push(titleEmojiEnd); }
      if (line1) { updateFields.push("line1=?"); values.push(line1); }
      if (line2) { updateFields.push("line2=?"); values.push(line2); }
      if (line3) { updateFields.push("line3=?"); values.push(line3); }
      if (quote) { updateFields.push("quote=?"); values.push(quote); }
      if (highlight) { updateFields.push("highlight=?"); values.push(highlight); }
      if (buttonText) { updateFields.push("buttonText=?"); values.push(buttonText); }
      if (buttonLink) { updateFields.push("buttonLink=?"); values.push(buttonLink); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      values.push(id); // Always push the id as the last value for the WHERE clause

      // ✅ Execute the update query
      const sql = `UPDATE gauraksha_sahayog SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      // ✅ Check if any row was updated
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "No changes were made to the record." });
      }

      // ✅ Fetch the updated record
      const [updated] = await db.query("SELECT * FROM gauraksha_sahayog WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Data updated successfully!",
        data: updated[0],  // Send back the updated record
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);




// ✅ Delete route
router.delete("/deletegauraksha_sahayog/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM gauraksha_sahayog WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM gauraksha_sahayog WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Gua Raksha Sahayog deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statusgauraksha_sahayog/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM gauraksha_sahayog WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE gauraksha_sahayog SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Gua Raksha Sahayog section close here ////////////////////////////////

//////////////////////////////////////// Vedic Gurukul Video Slider section start here ////////////////////////////////

router.post(
  "/insertvedicgurukul_videoslider",
  checkApiKey,
  upload.single("videoimg"), // this must match input name
  async (req, res) => {
    try {
      const {
        selectedType,
        title,
        alt,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

       const videoimg = req.file ? `/uploads/${req.file.filename}` : null;

      if (!selectedType || !title) {
        return res.status(400).json({ error: "selectedType and title are required!" });
      }

      const sql = `
        INSERT INTO vedicgurukul_videoslider
        (type, videoimg, title, alt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        selectedType,
        videoimg,
        title,
        alt,
        status,
        created_by,
        creation_date,
      ]);

      const [rows] = await db.query(
        "SELECT * FROM vedicgurukul_videoslider WHERE id=?",
        [result.insertId]
      );

      res.json({ success: true, message: "✅ Inserted successfully", record: rows[0] });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// ✅ GET — Fetch all
router.get("/selectvedicgurukul_videoslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vedicgurukul_videoslider ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});




// ✅ UPDATE route
// ✅ Correct
router.put(
  "/updatevedicgurukul_videoslider/:id",
  checkApiKey,
  upload.fields([{ name: "videoimg", maxCount: 1 }]),

   async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedType, title, alt, status, created_by, creation_date } = req.body;

    // Check if required fields exist in request body
    if (!selectedType ||  !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM vedicgurukul_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    let updateFields = [];
    let values = [];
    if (selectedType) { updateFields.push("Type=?"); values.push(selectedType); }
    //if (videoimg) { updateFields.push("videoimg=?"); values.push(videoimg); }
    if (title) { updateFields.push("title=?"); values.push(title); }
    if (alt) { updateFields.push("alt=?"); values.push(alt); }
    if (status) { updateFields.push("status=?"); values.push(status); }
    if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
    if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }


    let imgPath = rows[0].videoimg;

      if (req.files?.videoimg) {
        imgPath = "/uploads/" + req.files.videoimg[0].filename;
        updateFields.push("videoimg=?");
        values.push(imgPath);
      }

      

    values.push(id);

    const sql = `UPDATE vedicgurukul_videoslider SET ${updateFields.join(", ")} WHERE id=?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Update failed!" });
    }

    const [updated] = await db.query("SELECT * FROM vedicgurukul_videoslider WHERE id=?", [id]);

    res.json({
      success: true,
      message: "✅ vedicgurukul_videoslider updated successfully!",
      record: updated[0],
    });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ error: "Update failed!", details: err.message });
  }
});



// ✅ Delete route
router.delete("/deletevedicgurukul_videoslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM vedicgurukul_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM vedicgurukul_videoslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ vedicgurukul_videoslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusvedicgurukul_videoslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM vedicgurukul_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE vedicgurukul_videoslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});


//////////////////////////////////////// Vedic Gurukul Video Slider section close here ////////////////////////////////



//////////////////////////////////////// Vedic Gurukul Educations section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post(
  "/insertvedicgurukul_education",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const {
        title,
        sections,
        alert,
        cta,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title) return res.status(400).json({ error: "Title required" });

      // Multer uploaded images → filenames
      const imageFiles = req.files.map((file) => file.filename);

      // Parse sections
      let sectionsData = JSON.parse(sections || "[]");

      const sql = `
        INSERT INTO vedicgurukul_education 
        (images, title, sections, alert, cta, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        JSON.stringify(imageFiles),
        title,
        JSON.stringify(sectionsData),
        alert,
        cta,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        images: imageFiles,
        title,
        sections: sectionsData,
        alert,
        cta,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);

/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectvedicgurukul_education", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vedicgurukul_education");

    // ✅ Parse sections JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      sections: (() => {
        try {
          return JSON.parse(row.sections || "[]");
        } catch {
          return [row.sections];
        }
      })(),
      images: (() => {
        try {
          return JSON.parse(row.images || "[]");
        } catch {
          return [row.images];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updatevedicgurukul_education/:id",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        sections,
        alert,
        cta,
        created_by,
        status,
        creation_date,
      } = req.body;

      // Existing record
      const [rows] = await db.query(
        "SELECT * FROM vedicgurukul_education WHERE id=?",
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found!" });

      const oldRecord = rows[0];

      // Parse sections
      let sectionsData;
      try {
        sectionsData = JSON.parse(sections || "[]");
      } catch {
        sectionsData = [sections];
      }

      // NEW: Uploaded images (if any)
      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        uploadedImages = req.files.map((file) => file.filename);
      } else {
        // Keep old images if none uploaded
        uploadedImages = JSON.parse(oldRecord.images || "[]");
      }

      // Build update SQL
      const sql = `
        UPDATE vedicgurukul_education 
        SET 
          images = ?, 
          title = ?, 
          sections = ?, 
          alert = ?, 
          cta = ?,  
          created_by = ?, 
          status = ?, 
          creation_date = ?
        WHERE id = ?
      `;

      const values = [
        JSON.stringify(uploadedImages),
        title,
        JSON.stringify(sectionsData),
        alert,
        cta,
        created_by,
        status,
        creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      const [updated] = await db.query(
        "SELECT * FROM vedicgurukul_education WHERE id=?",
        [id]
      );

      updated[0].images = JSON.parse(updated[0].images || "[]");
      updated[0].sections = JSON.parse(updated[0].sections || "[]");

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletevedicgurukul_education/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM vedicgurukul_education WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM vedicgurukul_education WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Guaraksha Cow Protection Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusvedicgurukul_education/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM vedicgurukul_education WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE vedicgurukul_education SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Vedic Gurukul Educations section close here ///////////////////////////

//////////////////////////////////////// Vedic Gurukul Sahayog section start here ////////////////////////////////
router.post(
  "/insertvedicgurukul_sahayog",
  checkApiKey,
  (req, res) => {
    try {
      const {
        title,
        description,
        highlight,
        ctaText,
        ctaLink,
        status,
        creation_date,
        created_by,
      } = req.body;

      // Validate required fields
      if (!title || !description || !status || !creation_date || !created_by) {
        return res.status(400).json({ error: "All fields are required!" });
      }

      // ✅ Fixed query (13 placeholders)
      const sql = `
        INSERT INTO vedicgurukul_sahayog
        (title, description, highlight, ctaText, ctaLink, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // ✅ Correct parameter order (13 values)
      db.query(
        sql,
        [
          title,
          description,
          highlight,
          ctaText,
          ctaLink,
          status,
          created_by,
          creation_date,
        ],
        (err, result) => {
          if (err) {
            console.error("❌ Insert Error:", err);
            return res.status(500).json({
              error: "Insert failed!",
              details: err.message,
            });
          }

          res.json({
            success: true,
            id: result.insertId,
            record: {
              id: result.insertId,
              title,
              description,
              highlight,
              ctaText,
              ctaLink,
              status,
              created_by,
              creation_date,
            },
          });
        }
      );
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);






router.get("/selectvedicgurukul_sahayog", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vedicgurukul_sahayog");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

// ✅ UPDATE route
// ✅ UPDATE route
router.put(
  "/updatevedicgurukul_sahayog/:id",
  checkApiKey, // Your API key check middleware
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        highlight,
        ctaText,
        ctaLink,
        creation_date,
        created_by,
        status,
      } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM vedicgurukul_sahayog WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      // ✅ Build update query
      let updateFields = [];
      let values = [];

      if (title) { updateFields.push("title=?"); values.push(title); }
      if (description) { updateFields.push("description=?"); values.push(description); }
      if (highlight) { updateFields.push("highlight=?"); values.push(highlight); }
      if (ctaText) { updateFields.push("ctaText=?"); values.push(ctaText); }
      if (ctaLink) { updateFields.push("ctaLink=?"); values.push(ctaLink); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (status) { updateFields.push("status=?"); values.push(status); }

      values.push(id); // Always push the id as the last value for the WHERE clause

      // ✅ Execute the update query
      const sql = `UPDATE vedicgurukul_sahayog SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      // ✅ Check if any row was updated
      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "No changes were made to the record." });
      }

      // ✅ Fetch the updated record
      const [updated] = await db.query("SELECT * FROM vedicgurukul_sahayog WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ Data updated successfully!",
        data: updated[0],  // Send back the updated record
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);




// ✅ Delete route
router.delete("/deletevedicgurukul_sahayog/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM vedicgurukul_sahayog WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM vedicgurukul_sahayog WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Gua Raksha Sahayog deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});





// ✅ Toggle Status API
router.patch("/statusvedicgurukul_sahayog/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM vedicgurukul_sahayog WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE vedicgurukul_sahayog SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Vedic Gurukul Sahayog section close here ////////////////////////////////


//////////////////////////////////////// Annapurna rasoi Video Slider section start here ////////////////////////////////

router.post(
  "/insertannapurnarasoi_videoslider",
  checkApiKey,
  upload.single("videoimg"), // this must match input name
  async (req, res) => {
    try {
      const {
        selectedType,
        title,
        alt,
        status = "active",
        created_by = "admin",
        creation_date,
      } = req.body;

       const videoimg = req.file ? `/uploads/${req.file.filename}` : null;

      if (!selectedType || !title) {
        return res.status(400).json({ error: "selectedType and title are required!" });
      }

      const sql = `
        INSERT INTO annapurnarasoi_videoslider
        (type, videoimg, title, alt, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(sql, [
        selectedType,
        videoimg,
        title,
        alt,
        status,
        created_by,
        creation_date,
      ]);

      const [rows] = await db.query(
        "SELECT * FROM annapurnarasoi_videoslider WHERE id=?",
        [result.insertId]
      );

      res.json({ success: true, message: "✅ Inserted successfully", record: rows[0] });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);

// ✅ GET — Fetch all
router.get("/selectannapurnarasoi_videoslider", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM annapurnarasoi_videoslider ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Fetch failed!", details: err.message });
  }
});




// ✅ UPDATE route
// ✅ Correct
router.put(
  "/updateannapurnarasoi_videoslider/:id",
  checkApiKey,
  upload.fields([{ name: "videoimg", maxCount: 1 }]),

   async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedType, title, alt, status, created_by, creation_date } = req.body;

    // Check if required fields exist in request body
    if (!selectedType ||  !title) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM annapurnarasoi_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    let updateFields = [];
    let values = [];
    if (selectedType) { updateFields.push("Type=?"); values.push(selectedType); }
    //if (videoimg) { updateFields.push("videoimg=?"); values.push(videoimg); }
    if (title) { updateFields.push("title=?"); values.push(title); }
    if (alt) { updateFields.push("alt=?"); values.push(alt); }
    if (status) { updateFields.push("status=?"); values.push(status); }
    if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
    if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }


    let imgPath = rows[0].videoimg;

      if (req.files?.videoimg) {
        imgPath = "/uploads/" + req.files.videoimg[0].filename;
        updateFields.push("videoimg=?");
        values.push(imgPath);
      }

      

    values.push(id);

    const sql = `UPDATE annapurnarasoi_videoslider SET ${updateFields.join(", ")} WHERE id=?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Update failed!" });
    }

    const [updated] = await db.query("SELECT * FROM annapurnarasoi_videoslider WHERE id=?", [id]);

    res.json({
      success: true,
      message: "✅ annapurnarasoi_videoslider updated successfully!",
      record: updated[0],
    });
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).json({ error: "Update failed!", details: err.message });
  }
});



// ✅ Delete route
router.delete("/deleteannapurnarasoi_videoslider/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM annapurnarasoi_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM annapurnarasoi_videoslider WHERE id=?", [id]);
    res.json({ success: true, message: "✅ annapurnarasoi_videoslider deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusannapurnarasoi_videoslider/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM annapurnarasoi_videoslider WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE annapurnarasoi_videoslider SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});
//////////////////////////////////////// Annapurna rasoi Video Slider section close here ////////////////////////////////

//////////////////////////////////////// Annapuran Rasoi section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post(
  "/insertannarasoi_arpan",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { title, description, status, creation_date, created_by } = req.body;

      if (!title) return res.status(400).json({ error: "Title required" });

      const imageFiles = req.files.map((file) => file.filename);

      const sql = `
        INSERT INTO annarasoi_arpan 
        (images, title, description, status, creation_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        JSON.stringify(imageFiles),
        title,
        description,
        status,
        creation_date || new Date(),
        created_by || "admin",
      ]);

      res.json({
        id: result.insertId,
        images: imageFiles,
        title,
        description,
        status,
        creation_date,
        created_by,
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);

/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectannarasoi_arpan", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM annarasoi_arpan ORDER BY id DESC");

    const parsedRows = rows.map((row) => ({
      ...row,
      images: (() => {
        try {
          return JSON.parse(row.images || "[]");
        } catch {
          return [row.images];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updateannarasoi_arpan/:id",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, status, creation_date, created_by } = req.body;

      const [rows] = await db.query("SELECT * FROM annarasoi_arpan WHERE id=?", [id]);
      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found!" });

      const oldRecord = rows[0];

      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        uploadedImages = req.files.map((file) => file.filename);
      } else {
        uploadedImages = JSON.parse(oldRecord.images || "[]");
      }

      const sql = `
        UPDATE annarasoi_arpan 
        SET 
          images = ?, 
          title = ?, 
          description = ?,  
          status = ?, 
          creation_date = ?, 
          created_by = ?
        WHERE id = ?
      `;

      const values = [
        JSON.stringify(uploadedImages),
        title,
        description,
        status,
        creation_date || new Date(),
        created_by || "admin",
        id,
      ];

      await db.query(sql, values);

      const [updated] = await db.query("SELECT * FROM annarasoi_arpan WHERE id=?", [id]);
      updated[0].images = JSON.parse(updated[0].images || "[]");

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deleteannarasoi_arpan/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM annarasoi_arpan WHERE id=?", [id]);
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
});

/* ===========================================================
   ✅ STATUS TOGGLE
   =========================================================== */
router.patch("/statusannarasoi_arpan/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT status FROM annarasoi_arpan WHERE id=?", [id]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Record not found" });

    const newStatus = rows[0].status === "active" ? "inactive" : "active";

    await db.query("UPDATE annarasoi_arpan SET status=? WHERE id=?", [newStatus, id]);

    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: "Status update failed", details: err.message });
  }
});
//////////////////////////////////////// Annapuran Rasoi section close here ///////////////////////////


//////////////////////////////////////// Annapurna Rasoi Shradhalu Seva section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post(
  "/insertannapurnarasoi_shraddhaluseva",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const {
        title,
        paragraphs,
        video_url,
        video_description,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title) return res.status(400).json({ error: "Title required" });

      // Multer uploaded images → filenames
      const imageFiles = req.files.map((file) => file.filename);

      // Parse paragraphs
      let paragraphsData = JSON.parse(paragraphs || "[]");

      const sql = `
        INSERT INTO annapurnarasoi_shraddhaluseva 
        (images, title, paragraphs, video_url, video_description, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        JSON.stringify(imageFiles),
        title,
        JSON.stringify(paragraphsData),
        video_url,
        video_description,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        images: imageFiles,
        title,
        paragraphs: paragraphsData,
        video_url,
        video_description,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);

/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectannapurnarasoi_shraddhaluseva", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM annapurnarasoi_shraddhaluseva");

    // ✅ Parse paragraphs JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      paragraphs: (() => {
        try {
          return JSON.parse(row.paragraphs || "[]");
        } catch {
          return [row.paragraphs];
        }
      })(),
      images: (() => {
        try {
          return JSON.parse(row.images || "[]");
        } catch {
          return [row.images];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updateannapurnarasoi_shraddhaluseva/:id",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        paragraphs,
        video_url,
        video_description,
        created_by,
        status,
        creation_date,
      } = req.body;

      // Existing record
      const [rows] = await db.query(
        "SELECT * FROM annapurnarasoi_shraddhaluseva WHERE id=?",
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found!" });

      const oldRecord = rows[0];

      // Parse paragraphs
      let paragraphsData;
      try {
        paragraphsData = JSON.parse(paragraphs || "[]");
      } catch {
        paragraphsData = [paragraphs];
      }

      // NEW: Uploaded images (if any)
      let uploadedImages = [];
      if (req.files && req.files.length > 0) {
        uploadedImages = req.files.map((file) => file.filename);
      } else {
        // Keep old images if none uploaded
        uploadedImages = JSON.parse(oldRecord.images || "[]");
      }

      // Build update SQL
      const sql = `
        UPDATE annapurnarasoi_shraddhaluseva 
        SET 
          images = ?, 
          title = ?, 
          paragraphs = ?, 
          video_url = ?, 
          video_description = ?,  
          created_by = ?, 
          status = ?, 
          creation_date = ?
        WHERE id = ?
      `;

      const values = [
        JSON.stringify(uploadedImages),
        title,
        JSON.stringify(paragraphsData),
        video_url,
        video_description,
        created_by,
        status,
        creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      const [updated] = await db.query(
        "SELECT * FROM annapurnarasoi_shraddhaluseva WHERE id=?",
        [id]
      );

      updated[0].images = JSON.parse(updated[0].images || "[]");
      updated[0].paragraphs = JSON.parse(updated[0].paragraphs || "[]");

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deleteannapurnarasoi_shraddhaluseva/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM annapurnarasoi_shraddhaluseva WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM annapurnarasoi_shraddhaluseva WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Guaraksha Cow Protection Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusannapurnarasoi_shraddhaluseva/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM annapurnarasoi_shraddhaluseva WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE annapurnarasoi_shraddhaluseva SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Annapurna Rasoi Shradhalu Seva section close here ///////////////////////////

//////////////////////////////////////// Annapurna kichen Support section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT
   =========================================================== */
router.post(
  "/insertannapurnakitchen_support",
  checkApiKey,
  upload.none(),
  async (req, res) => {
    try {
      const {
        title,
        description,
        highlight,
        info_cards,
        cta_text,
        cta_link,
        quote,
        sub_quote,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title) return res.status(400).json({ error: "Title required" });

      let infoCardsArray = [];
      try {
        infoCardsArray = JSON.parse(info_cards || "[]");
      } catch (e) {
        infoCardsArray = [];
      }

      const sql = `
        INSERT INTO annapurnakitchen_support 
        (title, description, highlight, info_cards, cta_text, cta_link, quote, sub_quote, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        description,
        highlight,
        JSON.stringify(infoCardsArray),
        cta_text,
        cta_link,
        quote,
        sub_quote,
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        title,
        description,
        highlight,
        info_cards: infoCardsArray,
        cta_text,
        cta_link,
        quote,
        sub_quote,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("Insert error:", err);
      res.status(500).json({ error: "Insert failed", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectannapurnakitchen_support", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM annapurnakitchen_support");

    // ✅ Parse info_cards JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      info_cards: (() => {
        try {
          return JSON.parse(row.info_cards || "[]");
        } catch {
          return [row.info_cards];
        }
      })(),
      images: (() => {
        try {
          return JSON.parse(row.images || "[]");
        } catch {
          return [row.images];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updateannapurnakitchen_support/:id",
  checkApiKey,
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        description,
        highlight,
        info_cards,
        cta_text,
        cta_link,
        quote,
        sub_quote,
        created_by,
        status,
        creation_date,
      } = req.body;

      // Existing record
      const [rows] = await db.query(
        "SELECT * FROM annapurnakitchen_support WHERE id=?",
        [id]
      );

      if (rows.length === 0)
        return res.status(404).json({ error: "Record not found!" });

      const oldRecord = rows[0];

      // Parse info_cards
      let info_cardsData;
      try {
        info_cardsData = JSON.parse(info_cards || "[]");
      } catch {
        info_cardsData = [info_cards];
      }


      // Build update SQL
      const sql = `
        UPDATE annapurnakitchen_support 
        SET 
          title = ?, 
          description=?,
          highlight=?,
          info_cards = ?, 
          cta_text = ?, 
          cta_link = ?,  
           quote = ?, 
           sub_quote = ?, 
          created_by = ?, 
          status = ?, 
          creation_date = ?
        WHERE id = ?
      `;

      const values = [
     
        title,
        description,
        highlight,
        JSON.stringify(info_cardsData),
        cta_text,
        cta_link,
        quote,
        sub_quote,
        created_by,
        status,
        creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      const [updated] = await db.query(
        "SELECT * FROM annapurnakitchen_support WHERE id=?",
        [id]
      );

     
      updated[0].info_cards = JSON.parse(updated[0].info_cards || "[]");

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deleteannapurnakitchen_support/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM annapurnakitchen_support WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM annapurnakitchen_support WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Guaraksha Cow Protection Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusannapurnakitchen_support/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM annapurnakitchen_support WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE annapurnakitchen_support SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Annapurna kichen Support section close here ///////////////////////////


//////////////////////////////////////// Visit Dham Banner section start  here ///////////////////////////

router.post("/insertvisitdham_banner", checkApiKey, upload.fields([
  { name: "image", maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      height,
      position,
      status = "active",
      created_by = "admin",
      creation_date
    } = req.body;

    // Check for required fields
    if ( !req.files?.image) {
      return res.status(400).json({ error: " image are required!" });
    }

    const image = "/uploads/" + req.files.image[0].filename;

    const sql = `
      INSERT INTO visitdham_banner
      ( image, height, position, status, created_by, creation_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
     
      image,
      height,
      position,
      status,
      created_by,
      creation_date
    ]);

    // Respond with the inserted record
    res.json({
      success: true,
      record: {
        id: result.insertId,
        image,
        height,
        position,
        status,
        created_by,
        creation_date
      }
    });
  } catch (err) {
    console.error("❌ Insert Error:", err);
    res.status(500).json({ error: "Insert failed!", details: err.message });
  }
});

// GET route to fetch all About Gurudev Resolution data
// Backend: selectvisitdham_banner route
router.get("/selectvisitdham_banner", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM visitdham_banner");
    if (rows.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }
    res.json(rows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});



// ✅ UPDATE route
// ✅ Correct
router.put("/updatevisitdham_banner/:id",
  checkApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
   
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { image, height, position, status, created_by, creation_date } = req.body;

      // ✅ Check if record exists
      const [rows] = await db.query("SELECT * FROM visitdham_banner WHERE id=?", [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let updateFields = [];
      let values = [];

     
      if (image) { updateFields.push("image=?"); values.push(image); }
      if (height) { updateFields.push("height=?"); values.push(height); }
      if (position) { updateFields.push("position=?"); values.push(position); }
      if (status) { updateFields.push("status=?"); values.push(status); }
      if (created_by) { updateFields.push("created_by=?"); values.push(created_by); }
      if (creation_date) { updateFields.push("creation_date=?"); values.push(creation_date); }
     

      let imgPath = rows[0].image;

      

      if (req.files?.image) {
        imgPath = "/uploads/" + req.files.image[0].filename;
        updateFields.push("imageSrc=?");
        values.push(imgPath);
      }

      values.push(id);

      const sql = `UPDATE visitdham_banner SET ${updateFields.join(", ")} WHERE id=?`;
      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      const [updated] = await db.query("SELECT * FROM visitdham_banner WHERE id=?", [id]);

      res.json({
        success: true,
        message: "✅ visitdham_banner updated successfully!",
        record: updated[0],
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);

// ✅ Delete route
router.delete("/deletevisitdham_banner/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Check if record exists
    const [rows] = await db.query("SELECT * FROM visitdham_banner WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found!" });
    }

    // ✅ Delete record
    await db.query("DELETE FROM visitdham_banner WHERE id=?", [id]);
    res.json({ success: true, message: "✅ visitdham_banner deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

// ✅ Toggle Status API
router.patch("/statusvisitdham_banner/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    // pehle current status check karo
    const [rows] = await db.query("SELECT status FROM visitdham_banner WHERE id=?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    // update database
    const [result] = await db.query(
      "UPDATE visitdham_banner SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: "Status not updated" });
    }

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Visit Dham Banner section close  here ///////////////////////////

//////////////////////////////////////// Visit Dham Travel Dham  section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT    
   =========================================================== */

router.post(
  "/insertvisitdham_traveldham",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        title,
        how_to_reach_title,
        map_title,
        map_url,
        travel_modes,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title)
        return res.status(400).json({ error: "Title is required!" });

      // ✅ Extract uploaded image
      let image = "";
      if (req.files && req.files.image && req.files.image[0]) {
        image = "/uploads/" + req.files.image[0].filename;
      }

      // ✅ Parse travel_modes
      let travelModesData;
      try {
        travelModesData = Array.isArray(travel_modes)
          ? travel_modes
          : JSON.parse(travel_modes || "[]");
      } catch (err) {
        travelModesData = [];
      }

      // ✅ Final SQL Query (correct field order)
      const sql = `
        INSERT INTO visitdham_traveldham
        (title, how_to_reach_title, image, map_title, map_url, travel_modes, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        how_to_reach_title,
        image, // correct position
        map_title,
        map_url,
        JSON.stringify(travelModesData),
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        title,
        how_to_reach_title,
        image,
        map_title,
        map_url,
        travel_modes: travelModesData,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectvisitdham_traveldham", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM visitdham_traveldham");

    // ✅ Parse travel_modes JSON for each record
    const parsedRows = rows.map((row) => ({
      ...row,
      travel_modes: (() => {
        try {
          return JSON.parse(row.travel_modes || "[]");
        } catch {
          return [row.travel_modes];
        }
      })(),
    }));

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updatevisitdham_traveldham/:id",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        how_to_reach_title,
        map_title,
        map_url,
        travel_modes,
        created_by,
        status,
        creation_date,
      } = req.body;

      // --------- FETCH OLD RECORD ----------
      const [rows] = await db.query(
        "SELECT * FROM visitdham_traveldham WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let oldRecord = rows[0];

      // --------- HANDLE TRAVEL MODES (JSON) ----------
      let travel_modesData;
      try {
        travel_modesData = Array.isArray(travel_modes)
          ? travel_modes
          : JSON.parse(travel_modes || "[]");
      } catch {
        travel_modesData = oldRecord.travel_modes
          ? JSON.parse(oldRecord.travel_modes)
          : [];
      }

      // --------- HANDLE IMAGE ----------
      let imagePath = oldRecord.image; // keep old image

      if (req.files?.image && req.files.image[0]) {
        imagePath = "/uploads/" + req.files.image[0].filename; // new image
      }

      // --------- BUILD UPDATE FIELDS ----------
      const sql = `
        UPDATE visitdham_traveldham SET
          title=?,
          how_to_reach_title=?,
          image=?,
          map_title=?,
          map_url=?,
          travel_modes=?,
          status=?,
          created_by=?,
          creation_date=?
        WHERE id=?
      `;

      const values = [
        title || oldRecord.title,
        how_to_reach_title || oldRecord.how_to_reach_title,
        imagePath, // final image
        map_title || oldRecord.map_title,
        map_url || oldRecord.map_url,
        JSON.stringify(travel_modesData),
        status || oldRecord.status,
        created_by || oldRecord.created_by,
        creation_date || oldRecord.creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // --------- SEND UPDATED RECORD ----------
      const [updatedRows] = await db.query(
        "SELECT * FROM visitdham_traveldham WHERE id=?",
        [id]
      );

      const updatedRecord = updatedRows[0];
      updatedRecord.travel_modes = JSON.parse(updatedRecord.travel_modes);

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updatedRecord,
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletevisitdham_traveldham/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM visitdham_traveldham WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM visitdham_traveldham WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Cancer Hospital Research Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusvisitdham_traveldham/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM visitdham_traveldham WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE visitdham_traveldham SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Visit Dham Travel Dham section close here ///////////////////////////

//////////////////////////////////////// Visit Dham Train Route section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT    
   =========================================================== */

router.post(
  "/insertvisitdham_trainroute",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        title,
        subtitle1,
        subtitle2,
        stations,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title)
        return res.status(400).json({ error: "Title is required!" });

      let image = "";
      if (req.files && req.files.image && req.files.image[0]) {
        image = "/uploads/" + req.files.image[0].filename;
      }

      // Parse stations
      let stationsData = [];
      try {
        stationsData = JSON.parse(stations || "[]");
      } catch (err) {
        stationsData = [];
      }

      // Correct SQL (removed map_url)
      const sql = `
        INSERT INTO visitdham_trainroute
        (title, subtitle1, image, subtitle2, stations, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        subtitle1,
        image,
        subtitle2,
        JSON.stringify(stationsData),
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        title,
        subtitle1,
        image,
        subtitle2,
        stations: stationsData,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectvisitdham_trainroute", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM visitdham_trainroute");

    const parsedRows = rows.map((row) => {
      let stations = [];

      try {
        // When MySQL stores stations as JSON string
        if (typeof row.stations === "string" && row.stations.trim() !== "") {
          stations = JSON.parse(row.stations);
        }
      } catch (err) {
        stations = [];
      }

      // If stations still not an array → convert to empty array
      if (!Array.isArray(stations)) {
        stations = [];
      }

      return {
        ...row,
        stations,
      };
    });

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({
      error: "Failed to fetch data",
      details: err.message,
    });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updatevisitdham_trainroute/:id",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        subtitle1,
        subtitle2,
        stations,
        created_by,
        status,
        creation_date,
      } = req.body;

      // --------- FETCH OLD RECORD ----------
      const [rows] = await db.query(
        "SELECT * FROM visitdham_trainroute WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let oldRecord = rows[0];

      // --------- HANDLE TRAVEL MODES (JSON) ----------
      let stationsData;
      try {
        stationsData = Array.isArray(stations)
          ? stations
          : JSON.parse(stations || "[]");
      } catch {
        stationsData = oldRecord.stations
          ? JSON.parse(oldRecord.stations)
          : [];
      }

      // --------- HANDLE IMAGE ----------
      let imagePath = oldRecord.image; // keep old image

      if (req.files?.image && req.files.image[0]) {
        imagePath = "/uploads/" + req.files.image[0].filename; // new image
      }

      // --------- BUILD UPDATE FIELDS ----------
      const sql = `
        UPDATE visitdham_trainroute SET
          title=?,
          subtitle1=?,
          image=?,
          subtitle2=?,
          stations=?,
          status=?,
          created_by=?,
          creation_date=?
        WHERE id=?
      `;

      const values = [
        title || oldRecord.title,
        subtitle1 || oldRecord.subtitle1,
        imagePath, // final image
        subtitle2 || oldRecord.subtitle2,
        JSON.stringify(stationsData),
        status || oldRecord.status,
        created_by || oldRecord.created_by,
        creation_date || oldRecord.creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // --------- SEND UPDATED RECORD ----------
      const [updatedRows] = await db.query(
        "SELECT * FROM visitdham_trainroute WHERE id=?",
        [id]
      );

      const updatedRecord = updatedRows[0];
      updatedRecord.stations = JSON.parse(updatedRecord.stations);

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updatedRecord,
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletevisitdham_trainroute/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM visitdham_trainroute WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM visitdham_trainroute WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Cancer Hospital Research Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusvisitdham_trainroute/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM visitdham_trainroute WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE visitdham_trainroute SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Visit Dham Train Route section close here ///////////////////////////

//////////////////////////////////////// Visit Dham Plain Route section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT    
   =========================================================== */

router.post(
  "/insertvisitdham_planroute",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        title,
        subtitle1,
        subtitle2,
        airport,
        distanceInfo,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!title)
        return res.status(400).json({ error: "Title is required!" });

      let image = "";
      if (req.files && req.files.image && req.files.image[0]) {
        image = "/uploads/" + req.files.image[0].filename;
      }

      // Parse distanceInfo
      let distanceInfoData = [];
      try {
        distanceInfoData = JSON.parse(distanceInfo || "[]");
      } catch (err) {
        distanceInfoData = [];
      }

      // Correct SQL (removed map_url)
      const sql = `
        INSERT INTO visitdham_planroute
        (title, subtitle1, image, subtitle2,airport, distanceInfo, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await db.query(sql, [
        title,
        subtitle1,
        image,
        subtitle2,
        airport,
        JSON.stringify(distanceInfoData),
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        title,
        subtitle1,
        image,
        subtitle2,
        airport,
        distanceInfo: distanceInfoData,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectvisitdham_planroute", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM visitdham_planroute");

    const parsedRows = rows.map((row) => {
      let distanceInfo = [];

      try {
        // When MySQL stores distanceInfo as JSON string
        if (typeof row.distanceInfo === "string" && row.distanceInfo.trim() !== "") {
          distanceInfo = JSON.parse(row.distanceInfo);
        }
      } catch (err) {
        distanceInfo = [];
      }

      // If distanceInfo still not an array → convert to empty array
      if (!Array.isArray(distanceInfo)) {
        distanceInfo = [];
      }

      return {
        ...row,
        distanceInfo,
      };
    });

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({
      error: "Failed to fetch data",
      details: err.message,
    });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updatevisitdham_planroute/:id",
  checkApiKey,
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        title,
        subtitle1,
        subtitle2,
        airport,
        distanceInfo,
        created_by,
        status,
        creation_date,
      } = req.body;

      // --------- FETCH OLD RECORD ----------
      const [rows] = await db.query(
        "SELECT * FROM visitdham_planroute WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let oldRecord = rows[0];

      // --------- HANDLE TRAVEL MODES (JSON) ----------
      let distanceInfoData;
      try {
        distanceInfoData = Array.isArray(distanceInfo)
          ? distanceInfo
          : JSON.parse(distanceInfo || "[]");
      } catch {
        distanceInfoData = oldRecord.distanceInfo
          ? JSON.parse(oldRecord.distanceInfo)
          : [];
      }

      // --------- HANDLE IMAGE ----------
      let imagePath = oldRecord.image; // keep old image

      if (req.files?.image && req.files.image[0]) {
        imagePath = "/uploads/" + req.files.image[0].filename; // new image
      }

      // --------- BUILD UPDATE FIELDS ----------
      const sql = `
        UPDATE visitdham_planroute SET
          title=?,
          subtitle1=?,
          image=?,
          subtitle2=?,
          airport=?,
          distanceInfo=?,
          status=?,
          created_by=?,
          creation_date=?
        WHERE id=?
      `;

      const values = [
        title || oldRecord.title,
        subtitle1 || oldRecord.subtitle1,
        imagePath, // final image
        subtitle2 || oldRecord.subtitle2,
        airport || oldRecord.airport,
        JSON.stringify(distanceInfoData),
        status || oldRecord.status,
        created_by || oldRecord.created_by,
        creation_date || oldRecord.creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // --------- SEND UPDATED RECORD ----------
      const [updatedRows] = await db.query(
        "SELECT * FROM visitdham_planroute WHERE id=?",
        [id]
      );

      const updatedRecord = updatedRows[0];
      updatedRecord.distanceInfo = JSON.parse(updatedRecord.distanceInfo);

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updatedRecord,
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletevisitdham_planroute/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM visitdham_planroute WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM visitdham_planroute WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Cancer Hospital Research Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statusvisitdham_planroute/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM visitdham_planroute WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE visitdham_planroute SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Visit Dham Plain Route section close here ///////////////////////////


//////////////////////////////////////// Contact Us section start here ///////////////////////////
/* ===========================================================
   ✅ INSERT    
   =========================================================== */

router.post(
  "/insertcontact_us",
  checkApiKey,
  upload.fields([{ name: "banner_image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        description,
        address,
        email1,
        email2,
        phone1,
        phone2,
        website,
        social_icons,
        status,
        created_by,
        creation_date,
      } = req.body;

      if (!address)
        return res.status(400).json({ error: "Address is required!" });

      let banner_image = "";
      if (req.files && req.files.banner_image && req.files.banner_image[0]) {
        banner_image = "/uploads/" + req.files.banner_image[0].filename;
      }

      // Parse JSON safely
      let social_iconsData = [];
      try {
        social_iconsData = JSON.parse(social_icons || "[]");
      } catch (err) {
        social_iconsData = [];
      }

      // IMPORTANT: Correct SQL order
      const sql = `
        INSERT INTO contact_us
        (description, address, email1, email2, phone1, phone2, website, social_icons, banner_image, status, created_by, creation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // IMPORTANT: Correct values order
      const [result] = await db.query(sql, [
        description,
        address,
        email1,
        email2,
        phone1,
        phone2,
        website,
        JSON.stringify(social_iconsData), // MUST match correct column
        banner_image,                     // placed correctly
        status,
        created_by,
        creation_date,
      ]);

      res.json({
        id: result.insertId,
        description,
        address,
        email1,
        email2,
        phone1,
        phone2,
        website,
        social_icons: social_iconsData,
        banner_image,
        status,
        created_by,
        creation_date,
      });
    } catch (err) {
      console.error("❌ Insert Error:", err);
      res.status(500).json({ error: "Insert failed!", details: err.message });
    }
  }
);



/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectcontact_us", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM contact_us");

    const parsedRows = rows.map((row) => {
      let social_icons = [];

      try {
        // When MySQL stores social_icons as JSON string
        if (typeof row.social_icons === "string" && row.social_icons.trim() !== "") {
          social_icons = JSON.parse(row.social_icons);
        }
      } catch (err) {
        social_icons = [];
      }

      // If social_icons still not an array → convert to empty array
      if (!Array.isArray(social_icons)) {
        social_icons = [];
      }

      return {
        ...row,
        social_icons,
      };
    });

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({
      error: "Failed to fetch data",
      details: err.message,
    });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.put(
  "/updatecontact_us/:id",
  checkApiKey,
  upload.fields([{ name: "banner_image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
       description,
        address,
        email1,
        email2,
        phone1,
        phone2,
        website,
        social_icons,
        created_by,
        status,
        creation_date,
      } = req.body;

      // --------- FETCH OLD RECORD ----------
      const [rows] = await db.query(
        "SELECT * FROM contact_us WHERE id=?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Record not found!" });
      }

      let oldRecord = rows[0];

      // --------- HANDLE TRAVEL MODES (JSON) ----------
      let social_iconsData;
      try {
        social_iconsData = Array.isArray(social_icons)
          ? social_icons
          : JSON.parse(social_icons || "[]");
      } catch {
        social_iconsData = oldRecord.social_icons
          ? JSON.parse(oldRecord.social_icons)
          : [];
      }

      // --------- HANDLE banner_image ----------
      let banner_imagePath = oldRecord.banner_image; // keep old banner_image

      if (req.files?.banner_image && req.files.banner_image[0]) {
        banner_imagePath = "/uploads/" + req.files.banner_image[0].filename; // new banner_image
      }

      // --------- BUILD UPDATE FIELDS ----------
      const sql = `
        UPDATE contact_us SET
          description=?,
          address=?,
          email1=?,
          email2=?,
          phone1=?,
          phone2=?,
          website=?,
          banner_image=?,
          social_icons=?,
          status=?,
          created_by=?,
          creation_date=?
        WHERE id=?
      `;

      const values = [
        description || oldRecord.description,
        address || oldRecord.address,
        banner_imagePath, // final banner_image
        email1 || oldRecord.email1,
        email2 || oldRecord.email2,
        phone1 || oldRecord.phone1,
        phone2 || oldRecord.phone2,
        website || oldRecord.website,
        JSON.stringify(social_iconsData),
        status || oldRecord.status,
        created_by || oldRecord.created_by,
        creation_date || oldRecord.creation_date,
        id,
      ];

      const [result] = await db.query(sql, values);

      if (result.affectedRows === 0) {
        return res.status(400).json({ error: "Update failed!" });
      }

      // --------- SEND UPDATED RECORD ----------
      const [updatedRows] = await db.query(
        "SELECT * FROM contact_us WHERE id=?",
        [id]
      );

      const updatedRecord = updatedRows[0];
      updatedRecord.social_icons = JSON.parse(updatedRecord.social_icons);

      res.json({
        success: true,
        message: "Updated Successfully",
        data: updatedRecord,
      });
    } catch (err) {
      console.error("❌ Update Error:", err);
      res.status(500).json({ error: "Update failed!", details: err.message });
    }
  }
);


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletecontact_us/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM contact_us WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM contact_us WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Cancer Hospital Research Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statuscontact_us/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM contact_us WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE contact_us SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

//////////////////////////////////////// Contact Us section close here ///////////////////////////


//////////////////////////////////////// Sign Up section start here ///////////////////////////

router.post("/sign_up", checkApiKey, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const sql = `
      INSERT INTO sign_up (name, email, password, status, created_by, creation_date)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.query(sql, [
      name,
      email,
      password,
      "Active",   // default
      "Admin",    // default
    ]);

    return res.json({
      success: true,
      message: "Signup Successful!",
      insertedId: result.insertId,
    });

  } catch (err) {
    console.log("Insert Error:", err);
    return res.json({
      success: false,
      message: "DB ERROR",
      error: err.message,
    });
  }
});


/* ===========================================================
   ✅ SELECT ALL
   =========================================================== */
router.get("/selectsign_up", checkApiKey, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM sign_up");

    res.json(parsedRows);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch data", details: err.message });
  }
});

/* ===========================================================
   ✅ UPDATE
   =========================================================== */
router.post("/sign_up/reset", async (req, res) => {
  try {
    const { email, newpassword } = req.body;

    if (!email || !newpassword) {
      return res.json({
        success: false,
        message: "Email and New Password required",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM sign_up WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Email not found!",
      });
    }

    await db.query(
      "UPDATE sign_up SET password = ? WHERE email = ?",
      [newpassword, email]
    );

    return res.json({
      success: true,
      message: "Password updated successfully",
    });

  } catch (err) {
    console.log("RESET ERROR:", err);
    return res.json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});


/* ===========================================================
   ✅ DELETE
   =========================================================== */
router.delete("/deletesign_up/:id", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM sign_up WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found!" });

    await db.query("DELETE FROM sign_up WHERE id=?", [id]);
    res.json({ success: true, message: "✅ Guaraksha Cow Protection Data deleted successfully!" });
  } catch (err) {
    console.error("❌ Delete Error:", err);
    res.status(500).json({ error: "Delete failed!", details: err.message });
  }
});

/* ===========================================================
   ✅ TOGGLE STATUS
   =========================================================== */
router.patch("/statussign_up/:id/status", checkApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT status FROM sign_up WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Record not found" });

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const [result] = await db.query(
      "UPDATE sign_up SET status=? WHERE id=?",
      [newStatus, id]
    );

    if (result.affectedRows === 0)
      return res.status(400).json({ error: "Status not updated" });

    res.json({ success: true, message: "Status updated!", status: newStatus });
  } catch (err) {
    console.error("❌ Status Update Error:", err);
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});




// login api start here

router.post("/sign_up/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ success: false, message: "Email & Password required" });

  try {
    const [rows] = await db.query(
      "SELECT * FROM sign_up WHERE email = ? AND password = ? LIMIT 1",
      [email, password]
    );

    if (rows.length === 0) {
      return res.json({ success: false, message: "Invalid Email or Password" });
    }

    res.json({
      success: true,
      message: "Login Successful",
      user: rows[0],
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "DB ERROR", error: err });
  }
});



// router.post("/sign_up/reset", async (req, res) => {
//   try {
//     const { email, newpassword } = req.body;

//     if (!email || !newpassword) {
//       return res.json({
//         success: false,
//         message: "Email and New Password required",
//       });
//     }

//     // Your DB Update Logic Here
//     // await User.updateOne({ email }, { password: newpassword });

//     return res.json({
//       success: true,
//       message: "Password updated successfully",
//     });
//   } catch (err) {
//     return res.json({
//       success: false,
//       message: "Server error",
//       error: err.message,
//     });
//   }
// });


//////////////////////////////////////// Sign Up section close here ///////////////////////////

export default router;
