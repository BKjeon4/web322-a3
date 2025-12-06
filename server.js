/******************************************************************************** 
*  WEB322 – Assignment 3
*  
*  I declare that this assignment is my own work in accordance with Seneca's 
*  Academic Integrity Policy: 
*  
*  https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html 
*  
*  Name: Byungwook Jeon   Student ID: 011654159   Date: 2025-12-05
Published URL: 
********************************************************************************/

const express = require("express");
const path = require("path");
const session = require("express-session");
const projectService = require("./modules/projects");

require("dotenv").config();

const app = express();
//const PORT = process.env.PORT || 8080;
const PORT = process.env.PORT;

/* --------------------------
   Middleware
--------------------------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

/* --------------------------
   Session Setup
--------------------------- */
app.use(
  session({
    secret: "web322_assignment3_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// make session available in EJS
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/* --------------------------
   AUTH Middleware
--------------------------- */
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

/* --------------------------
   ROUTES
--------------------------- */
// About
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/", async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.render("home", { projects });
  } catch (err) {
    res.render("home", { projects: [] });
  }
});



// All Projects
app.get("/solutions/projects", async (req, res) => {
  try {
    const sectorName = req.query.sector;

    let projects;

    if (sectorName) {
      // sector filtering
      projects = await projectService.getProjectsBySector(sectorName);
    } else {
      // all projects
      projects = await projectService.getAllProjects();
    }

    res.render("projects", { projects });

  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});


// Project by ID
app.get("/solutions/project/:id", async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).render("404", { message: "Project not found" });
    }

    res.render("project", { project });
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

// Add Project (GET)
app.get("/solutions/addProject", ensureLogin, (req, res) => {
  res.render("addProject");
});

// Add Project (POST)
app.post("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    await projectService.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

// Edit Project (GET)
app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).render("404", { message: "Project not found" });
    }
    res.render("editProject", { project });
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

// Edit Project (POST)
app.post("/solutions/editProject", ensureLogin, async (req, res) => {
  try {
    await projectService.updateProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

// Delete Project
app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render("login", { userName: "", errorMessage: "" });
});

// Login POST
app.post("/login", (req, res) => {
  const { userName, password } = req.body;

  if (userName === "admin" && password === "admin") {
    req.session.user = { userName };
    res.redirect("/solutions/projects");
  } else {
    res.render("login", {
      userName,
      errorMessage: "Invalid username or password.",
    });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render("404", { message: "Page Not Found" });
});

/* --------------------------
   Start Server
--------------------------- */

projectService
  .initialize()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server listening on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.log(err);
  });