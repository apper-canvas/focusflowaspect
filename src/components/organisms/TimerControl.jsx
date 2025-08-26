import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import ProjectSelector from "@/components/molecules/ProjectSelector";
import TimerDisplay from "@/components/molecules/TimerDisplay";
import ApperIcon from "@/components/ApperIcon";
import { timeEntryService } from "@/services/api/timeEntryService";
import { projectService } from "@/services/api/projectService";
import { parseQuickEntry } from "@/utils/timeUtils";
import { toast } from "react-toastify";

const TimerControl = ({ onEntryCreated }) => {
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [activeEntryId, setActiveEntryId] = useState(null);
  
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
    checkActiveEntry();
  }, []);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const loadProjects = async () => {
    try {
      const projectData = await projectService.getAll();
      setProjects(projectData);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const checkActiveEntry = async () => {
    try {
      const activeEntry = await timeEntryService.getActiveEntry();
      if (activeEntry) {
        setActiveEntryId(activeEntry.Id);
        setStartTime(activeEntry.startTime);
        setDuration(Math.floor((Date.now() - activeEntry.startTime) / 1000));
        setDescription(activeEntry.description || "");
        setSelectedProject(activeEntry.project || "");
        setIsRunning(true);
      }
    } catch (error) {
      console.error("Failed to check active entry:", error);
    }
  };

  const handleStart = async () => {
    if (isRunning) return;

    setLoading(true);
    try {
      const now = Date.now();
      const project = projects.find(p => p.name === selectedProject);
      
      const newEntry = await timeEntryService.create({
        startTime: now,
        endTime: null,
        duration: 0,
        project: selectedProject || "Untitled",
        tags: [],
        billable: project?.defaultBillable || false,
        description: description || "",
        autoDetected: false
      });

      setActiveEntryId(newEntry.Id);
      setStartTime(now);
      setDuration(0);
      setIsRunning(true);
      
      toast.success("Timer started!");
    } catch (error) {
      toast.error("Failed to start timer");
      console.error("Start timer error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!isRunning || !activeEntryId) return;

    setLoading(true);
    try {
      const endTime = Date.now();
      const finalDuration = Math.floor((endTime - startTime) / 1000);

      await timeEntryService.update(activeEntryId, {
        endTime,
        duration: finalDuration
      });

      setIsRunning(false);
      setActiveEntryId(null);
      setStartTime(null);
      setDuration(0);
      setDescription("");
      setSelectedProject("");
      
      toast.success(`Timer stopped! Tracked ${Math.floor(finalDuration / 60)} minutes`);
      
      if (onEntryCreated) {
        onEntryCreated();
      }
    } catch (error) {
      toast.error("Failed to stop timer");
      console.error("Stop timer error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEntry = async (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      const parsed = parseQuickEntry(description);
      
      if (parsed.duration) {
        setLoading(true);
        try {
          const project = projects.find(p => p.name === (parsed.project || selectedProject));
          const endTime = Date.now();
          const startTime = endTime - (parsed.duration * 1000);

          await timeEntryService.create({
            startTime,
            endTime,
            duration: parsed.duration,
            project: parsed.project || selectedProject || "Quick Entry",
            tags: parsed.tags,
            billable: project?.defaultBillable || false,
            description: parsed.description || description,
            autoDetected: false
          });

          setDescription("");
          toast.success(`Quick entry added: ${Math.floor(parsed.duration / 60)} minutes`);
          
          if (onEntryCreated) {
            onEntryCreated();
          }
        } catch (error) {
          toast.error("Failed to create quick entry");
          console.error("Quick entry error:", error);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-white to-surface">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 font-display">Timer Control</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-success animate-pulse" : "bg-gray-300"}`} />
            <span className="text-sm text-gray-600">
              {isRunning ? "Running" : "Stopped"}
            </span>
          </div>
        </div>

        <div className="text-center py-4">
          <TimerDisplay duration={duration} isRunning={isRunning} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleQuickEntry}
            placeholder="What are you working on? (Ctrl+Enter for quick entry)"
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-900 mb-1.5 block">
              Project
            </label>
            <ProjectSelector
              projects={projects}
              value={selectedProject}
              onChange={setSelectedProject}
              placeholder="Select or type project name"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              disabled={loading}
              size="lg"
              className="min-w-32"
            >
              {loading ? (
                <ApperIcon name="Loader2" size={20} className="animate-spin mr-2" />
              ) : (
                <ApperIcon name="Play" size={20} className="mr-2" />
              )}
              Start Timer
            </Button>
          ) : (
            <Button 
              onClick={handleStop}
              disabled={loading}
              variant="danger"
              size="lg"
              className="min-w-32"
            >
              {loading ? (
                <ApperIcon name="Loader2" size={20} className="animate-spin mr-2" />
              ) : (
                <ApperIcon name="Square" size={20} className="mr-2" />
              )}
              Stop Timer
            </Button>
          )}
        </div>

        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>💡 Quick Entry: Type "design work 2h #project @tag" and press Ctrl+Enter</p>
          <p>⏰ Formats: 30m, 2.5h, 90min</p>
        </div>
      </div>
    </Card>
  );
};

export default TimerControl;