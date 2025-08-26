import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { projectService } from "@/services/api/projectService";
import { toast } from "react-toastify";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    client: "",
    hourlyRate: "",
    defaultBillable: true,
    color: "#5B4FB6"
  });

  const projectColors = [
    "#5B4FB6", "#3B82F6", "#10B981", "#8B5CF6", 
    "#F59E0B", "#EF4444", "#EC4899", "#14B8A6"
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const projectData = await projectService.getAll();
      setProjects(projectData);
    } catch (err) {
      setError("Failed to load projects");
      console.error("Load projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      const projectData = {
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      };

      if (editingId) {
        const updatedProject = await projectService.update(editingId, projectData);
        setProjects(projects.map(p => p.Id === editingId ? updatedProject : p));
        toast.success("Project updated successfully");
      } else {
        const newProject = await projectService.create(projectData);
        setProjects([...projects, newProject]);
        toast.success("Project created successfully");
      }

      resetForm();
    } catch (error) {
      toast.error(editingId ? "Failed to update project" : "Failed to create project");
      console.error("Project save error:", error);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      client: project.client || "",
      hourlyRate: project.hourlyRate?.toString() || "",
      defaultBillable: project.defaultBillable,
      color: project.color
    });
    setEditingId(project.Id);
    setIsCreating(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await projectService.delete(id);
      setProjects(projects.filter(p => p.Id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
      console.error("Delete project error:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      client: "",
      hourlyRate: "",
      defaultBillable: true,
      color: "#5B4FB6"
    });
    setIsCreating(false);
    setEditingId(null);
  };

  if (loading) return <Loading message="Loading projects..." />;
  if (error) return <Error message={error} onRetry={loadProjects} />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Projects</h1>
          <p className="text-gray-600">Manage your projects and billing rates</p>
        </div>
        
        <Button onClick={() => setIsCreating(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {projects.length === 0 ? (
            <Empty 
              message="No projects created yet"
              action={() => setIsCreating(true)}
              actionLabel="Create First Project"
              icon="FolderPlus"
            />
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.Id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 font-display">
                          {project.name}
                        </h3>
                        {project.client && (
                          <p className="text-sm text-gray-600">Client: {project.client}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant={project.defaultBillable ? "billable" : "nonBillable"}>
                            {project.defaultBillable ? "Billable" : "Non-billable"}
                          </Badge>
                          
                          {project.hourlyRate > 0 && (
                            <span className="text-sm text-gray-600">
                              ${project.hourlyRate}/hour
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <ApperIcon name="Edit2" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.Id)}
                        className="text-error hover:text-error"
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          {isCreating && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-display">
                  {editingId ? "Edit Project" : "New Project"}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Project Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />

                <FormField
                  label="Client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Client name (optional)"
                />

                <FormField
                  label="Hourly Rate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                    Project Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {projectColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? "border-gray-900" : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="defaultBillable"
                    checked={formData.defaultBillable}
                    onChange={(e) => setFormData({ ...formData, defaultBillable: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="defaultBillable" className="text-sm text-gray-700">
                    Billable by default
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">
                    <ApperIcon name={editingId ? "Save" : "Plus"} size={16} className="mr-2" />
                    {editingId ? "Update" : "Create"} Project
                  </Button>
                  <Button type="button" variant="secondary" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Project Stats */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Project Stats
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Projects</span>
                <span className="text-lg font-bold text-primary">{projects.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Billable Projects</span>
                <span className="text-lg font-bold text-success">
                  {projects.filter(p => p.defaultBillable).length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Rate</span>
                <span className="text-lg font-bold text-gray-900">
                  ${projects.length > 0 
                    ? (projects.reduce((sum, p) => sum + (p.hourlyRate || 0), 0) / projects.length).toFixed(0)
                    : 0
                  }
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Projects;