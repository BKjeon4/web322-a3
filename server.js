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

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

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

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/* --------------------------
   AUTH Middleware
--------------------------- */
function ensureLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

/* --------------------------
   ROUTES
--------------------------- */

app.get("/about", (req, res) => res.render("about"));

app.get("/", async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.render("home", { projects });
  } catch {
    res.render("home", { projects: [] });
  }
});

app.get("/solutions/projects", async (req, res) => {
  try {
    let projects = await projectService.getAllProjects();

    if (req.query.sector) {
      projects = await projectService.getProjectsBySector(req.query.sector);
    }

    res.render("projects", { projects });
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

app.get("/solutions/project/:id", async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.render("project", { project });
  } catch {
    res.status(404).render("404", { message: "Project not found" });
  }
});

app.get("/solutions/addProject", ensureLogin, (req, res) => {
  res.render("addProject");
});

app.post("/solutions/addProject", ensureLogin, async (req, res) => {
  try {
    await projectService.addProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.render("editProject", { project });
  } catch {
    res.status(404).render("404", { message: "Project not found" });
  }
});

app.post("/solutions/editProject", ensureLogin, async (req, res) => {
  try {
    await projectService.updateProject(req.body);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.redirect("/solutions/projects");
  } catch (err) {
    res.status(500).render("500", { message: err });
  }
});

app.get("/login", (req, res) => {
  res.render("login", { userName: "", errorMessage: "" });
});

app.post("/login", (req, res) => {
  const { userName, password } = req.body;

  if (userName === "admin" && password === "admin") {
    req.session.user = { userName };
    return res.redirect("/solutions/projects");
  }

  res.render("login", {
    userName,
    errorMessage: "Invalid username or password.",
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.use((req, res) => res.status(404).render("404", { message: "Page Not Found" }));

/* --------------------------
   Export for Vercel
--------------------------- */

projectService.initialize();

if (process.env.VERCEL) {
  module.exports = app; // Vercel uses this
} else {
  app.listen(PORT, () =>
    console.log(`Server running locally at http://localhost:${PORT}`)
  );
}