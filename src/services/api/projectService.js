import projectsData from "@/services/mockData/projects.json";

let projects = [...projectsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const projectService = {
  async getAll() {
    await delay(200);
    return projects.map(project => ({ ...project }));
  },

  async getById(id) {
    await delay(150);
    const project = projects.find(project => project.Id === parseInt(id));
    return project ? { ...project } : null;
  },

  async create(projectData) {
    await delay(300);
    const newId = Math.max(...projects.map(project => project.Id), 0) + 1;
    const newProject = {
      Id: newId,
      ...projectData,
      color: projectData.color || "#5B4FB6"
    };
    
    projects.push(newProject);
    return { ...newProject };
  },

  async update(id, updateData) {
    await delay(250);
    const index = projects.findIndex(project => project.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    projects[index] = { ...projects[index], ...updateData };
    return { ...projects[index] };
  },

  async delete(id) {
    await delay(200);
    const index = projects.findIndex(project => project.Id === parseInt(id));
    
    if (index === -1) {
      throw new Error("Project not found");
    }
    
    const deletedProject = projects.splice(index, 1)[0];
    return { ...deletedProject };
  }
};