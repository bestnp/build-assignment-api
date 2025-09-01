import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res, next) => {
  try {
    const { title, content, category, length, status } = req.body || {};
    if (!title || !content || !category) {
      return res.status(404).json({ 
        message: "⚠️ Server could not create assignment because there are missing data from client." });
    }
    const newPost = {
      title,
      content,
      category: category ?? null,
      length: length ?? null,
      status: status ?? "-",
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date(),
    };

    await connectionPool.query(
      `insert into assignments 
        (title, content, category, length, status, created_at, updated_at, published_at)
      values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        newPost.title,
        newPost.content,
        newPost.category,
        newPost.length,
        newPost.status,
        newPost.created_at,
        newPost.updated_at,
        newPost.published_at,
      ]
    );

    return res.status(201).json({ message: "Created assignment sucessfully" });
  } catch (error) {
    next(error);
  };
});

app.use((req, res, next) => {
  res.status(500).json({
    message: "Server could not create assignment because database connection",
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});


