import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

//------------------------------------------------------------------------------
app.post("/assignments", async (req, res, next) => {
  try {
    const { title, content, category, length, status } = req.body || {};

    if (!title || !content || !category) {
      return res.status(404).json({
        message: "⚠️ Server could not create assignment because there are missing data from client."
      });
    }

    const newPost = {
      title,
      content,
      category,
      length: length ?? null,
      status: status ?? "Draft",
      created_at: new Date(),
      updated_at: new Date(),
      published_at: new Date(),
    };

    await connectionPool.query(
      `
      insert into assignments 
        (title, content, category, length, status, created_at, updated_at, published_at)
      values ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
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

    return res.status(201).json({
      message: "Created assignment sucessfully"
    });
  } catch (error) {
    // console.error("Database error in Post /assignments:", error);
    return next(error);
  };
});

//------------------------------------------------------------------------------
app.get("/assignments", async (req, res, next) => {
  try {
    const result = await connectionPool.query("select * from assignments");
    return res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    // console.error("Database error in Get /assignments:", err);
    return next(error);
  }
});

//------------------------------------------------------------------------------
app.get("/assignments/:assignmentsId", async (req, res, next) => {
  const assignmentsIdFromClient = req.params.assignmentsId;

  try {
    const result = await connectionPool.query(
      `
        select * from assignments 
        where assignment_id=$1
      `,
      [assignmentsIdFromClient]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "⚠️ Server could not find a requested assignment."
      });
    };

    return res.status(200).json({
      data: result.rows
    });
  } catch (error) {
    // console.error("Database error in Get /assignments/:assignmentsId", error);
    return next(error);
  }
});

//------------------------------------------------------------------------------
app.put("/assignments/:assignmentId", async (req, res, next) => {
  const assignmentsIdFromClient = req.params.assignmentId;
  const updatedAssignments = { ...req.body, updated_at: new Date() };
  try {
    const result = await connectionPool.query(
      `
        update assignments
        set title = $2,
            content = $3,
            category = $4,
            length = $5,
            status = $6,
            updated_at = $7
        where assignment_id = $1
        RETURNING *
      `,
      [
        assignmentsIdFromClient,
        updatedAssignments.title,
        updatedAssignments.content,
        updatedAssignments.category,
        updatedAssignments.length,
        updatedAssignments.status,
        updatedAssignments.updated_at,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "⚠️ Server could not find a requested assignment to update."
      });
    };

    return res.status(200).json({
      message: "Updated assignment sucessfully"
    });
  } catch (error) {
    // console.error("Database error in Put /assignments/:assignmentsId", error);
    return next(error);
  }
});

//------------------------------------------------------------------------------
app.delete("/assignments/:assignmentId", async (req, res, next) => {
  const assignmentsIdFromClient = req.params.assignmentId;

  try {
    let result = await connectionPool.query(
      `
        DELETE from assignments
        WHERE assignment_id = $1
      `,
      [assignmentsIdFromClient]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete"
      });
    }

    return res.status(200).json({
      message: "Deleted assignment sucessfully"
    });
  } catch (error) {
    // console.error("Database error in Delete /assignments/:assignmentsId", error);
    return next(error);
  }
})

//Global error handler----------------------------------------------------------
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Server could not create assignment because database connection",
  });
});

//------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});


