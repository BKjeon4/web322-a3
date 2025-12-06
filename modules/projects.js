
const projectData = require("../data/projectData.json");
const sectorData = require("../data/sectorData.json");

let projects = [];

/* -------------------------------------
   INITIALIZE DATA
-------------------------------------- */
function initialize() {
  return new Promise((resolve, reject) => {
    try {
      projects = [];

      projectData.forEach((proj) => {
        const foundSector = sectorData.find(
          (s) => s.id === proj.sector_id
        );

        const newProject = {
          ...proj,
          sector: foundSector ? foundSector.sector_name : "Unknown"
        };

        projects.push(newProject);
      });

      resolve();
    } catch (err) {
      reject("Error initializing project data: " + err);
    }
  });
}

/* -------------------------------------
   GET ALL PROJECTS
-------------------------------------- */
function getAllProjects() {
  return new Promise((resolve, reject) => {
    if (projects.length > 0) resolve(projects);
    else reject("No project data available");
  });
}

/* -------------------------------------
   GET PROJECT BY ID
-------------------------------------- */
function getProjectById(id) {
  return new Promise((resolve, reject) => {
    const project = projects.find((p) => p.id == id);

    if (project) resolve(project);
    else reject("No project found with id: " + id);
  });
}

/* -------------------------------------
   ADD PROJECT
-------------------------------------- */
function addProject(projectData) {
  return new Promise((resolve, reject) => {
    try {
      const newId = projects.length
        ? Math.max(...projects.map((p) => p.id)) + 1
        : 1;

      const sector = sectorData.find((s) => s.sector_name === projectData.sector);

      const newProject = {
        id: newId,
        title: projectData.title,
        summary_short: projectData.summary_short,
        intro_short: projectData.intro_short,
        impact: projectData.impact,
        original_source_url: projectData.original_source_url,
        feature_img_url: projectData.feature_img_url,
        sector: projectData.sector,
        sector_id: sector ? sector.id : null
      };

      projects.push(newProject);
      resolve();
    } catch (err) {
      reject("Error adding project: " + err);
    }
  });
}

/* -------------------------------------
   UPDATE PROJECT
-------------------------------------- */
function updateProject(updated) {
  return new Promise((resolve, reject) => {
    try {
      const index = projects.findIndex((p) => p.id == updated.id);

      if (index === -1) {
        return reject("Project not found");
      }

      const sector = sectorData.find((s) => s.sector_name === updated.sector);

      projects[index] = {
        ...projects[index],
        title: updated.title,
        summary_short: updated.summary_short,
        intro_short: updated.intro_short,
        impact: updated.impact,
        original_source_url: updated.original_source_url,
        feature_img_url: updated.feature_img_url,
        sector: updated.sector,
        sector_id: sector ? sector.id : null
      };

      resolve();
    } catch (err) {
      reject("Error updating project: " + err);
    }
  });
}

/* -------------------------------------
   DELETE PROJECT
-------------------------------------- */
function deleteProject(id) {
  return new Promise((resolve, reject) => {
    try {
      const index = projects.findIndex((p) => p.id == id);

      if (index === -1) {
        return reject("Project not found");
      }

      projects.splice(index, 1);
      resolve();
    } catch (err) {
      reject("Error deleting project: " + err);
    }
  });
}
/* -------------------------------------
   GET PROJECTS BY SECTOR
-------------------------------------- */
function getProjectsBySector(sectorName) {
  return new Promise((resolve, reject) => {
    const filtered = projects.filter((p) =>
      p.sector &&
      p.sector.toLowerCase().includes(sectorName.toLowerCase())
    );

    if (filtered.length > 0) resolve(filtered);
    else reject("No projects found for sector: " + sectorName);
  });
}


module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  addProject,
  updateProject,
  deleteProject
};
