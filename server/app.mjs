import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  };

  try {
     await connectionPool.query(
      `INSERT INTO assignments (user_id ,title, content, category, length, status, created_at, updated_at, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        newAssignment.user_id,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.length,
        newAssignment.status,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    );
  } catch (error) {
    return res.status(500).json({
       "message": "Server could not create assignment because database connection" 
      })
  }

  return res.status(201).json({
    "message": "Create assignment successfully",
  })
})

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
