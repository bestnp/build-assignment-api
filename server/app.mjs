import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/assignments", async (req, res) => {
  let assignments;
  try {
    const result = await connectionPool.query("SELECT * FROM assignments");
    assignments = result.rows;
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not read assignments because database connection" 
    });
  };

  return res.status(200).json(assignments);
});

app.get("/assignments/:id", async (req, res) => {
  const id = req.params.id;
  let assignment;
  try {
    const result = await connectionPool.query(
      "SELECT * FROM assignments WHERE assignment_id = $1",
      [id]
    );
    assignment = result.rows[0];
  } catch (error) {
    return res.status(500).json({
      "message": "Server could not read assignment because database connection" 
    });
  }

  if (!assignment) {
    return res.status(404).json({
      "message": "Server could not find a requested assignment"
    });
  }

  return res.status(200).json(assignment);
});

app.put("/assignments/:id", async (req, res) => {
  const id = req.params.id;
  const updatedAssignment = {
    ...req.body,
    updated_at: new Date(),
  };

  try {
     await connectionPool.query(
      `UPDATE assignments
      SET user_id = $1, title = $2, content = $3, category = $4, length = $5, status = $6, updated_at = $7
      WHERE assignment_id = $8`,
      [
        updatedAssignment.user_id,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.length,
        updatedAssignment.status,
        updatedAssignment.updated_at,
        id,
      ]
    );
  } catch (error) {
    console.error("Update error:", error.message);
    return res.status(500).json({
       "message": "Server could not update assignment because database connection" 
      })
  }

  return res.status(200).json({
    "message": "Update assignment successfully",
  })
});

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
});

app.delete("/assignments/:id", async (req, res) => {
  const id = req.params.id;

  try {
     await connectionPool.query(
      `DELETE FROM assignments WHERE assignment_id = $1`,
      [id]
    );
  } catch (error) {
    return res.status(500).json({
       "message": "Server could not delete assignment because database connection" 
      })
  }

  return res.status(200).json({
    "message": "Delete assignment successfully",
  })
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
