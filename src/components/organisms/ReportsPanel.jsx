import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { timeEntryService } from "@/services/api/timeEntryService";
import { formatDuration, getTodayStart, getWeekStart } from "@/utils/timeUtils";
import { toast } from "react-toastify";

const ReportsPanel = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("daily"); // daily, weekly
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadReportData();
  }, [view]);

  const loadReportData = async () => {
    setLoading(true);
    setError("");
    
    try {
      const allEntries = await timeEntryService.getAll();
      const startTime = view === "daily" ? getTodayStart() : getWeekStart();
      
      const filteredEntries = allEntries.filter(entry => entry.startTime >= startTime);
      setEntries(filteredEntries);
      
      calculateStats(filteredEntries);
    } catch (err) {
      setError("Failed to load report data");
      console.error("Load report error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entriesData) => {
    const totalTime = entriesData.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const billableTime = entriesData
      .filter(entry => entry.billable)
      .reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const nonBillableTime = totalTime - billableTime;

    const projectTimes = {};
    entriesData.forEach(entry => {
      const project = entry.project || "Untitled";
      projectTimes[project] = (projectTimes[project] || 0) + (entry.duration || 0);
    });

    const projects = Object.entries(projectTimes)
      .map(([name, duration]) => ({ name, duration }))
      .sort((a, b) => b.duration - a.duration);

    setStats({
      totalTime,
      billableTime,
      nonBillableTime,
      projects,
      entriesCount: entriesData.length
    });
  };

  const exportToCSV = () => {
    if (entries.length === 0) {
      toast.warn("No data to export");
      return;
    }

    const headers = ["Date", "Start", "End", "Duration (hours)", "Project", "Description", "Billable", "Tags"];
    const rows = entries.map(entry => [
      new Date(entry.startTime).toLocaleDateString(),
      new Date(entry.startTime).toLocaleTimeString(),
      entry.endTime ? new Date(entry.endTime).toLocaleTimeString() : "Running",
      ((entry.duration || 0) / 3600).toFixed(2),
      entry.project || "",
      entry.description || "",
      entry.billable ? "Yes" : "No",
      (entry.tags || []).join(", ")
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `time-report-${view}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Report exported successfully");
  };

  const getProjectColor = (projectName) => {
    const colors = {
      "FocusFlow Development": "#5B4FB6",
      "Client Website": "#3B82F6", 
      "Meeting": "#10B981",
      "Personal Learning": "#8B5CF6",
      "Admin Tasks": "#F59E0B",
      "Marketing": "#EC4899"
    };
    return colors[projectName] || "#6B7280";
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadReportData} />;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 font-display">Time Reports</h3>
          
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={view === "daily" ? "primary" : "ghost"}
                onClick={() => setView("daily")}
                className="text-xs"
              >
                Daily
              </Button>
              <Button
                size="sm"
                variant={view === "weekly" ? "primary" : "ghost"}
                onClick={() => setView("weekly")}
                className="text-xs"
              >
                Weekly
              </Button>
            </div>
            
            <Button size="sm" variant="secondary" onClick={exportToCSV}>
              <ApperIcon name="Download" size={14} className="mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {entries.length === 0 ? (
          <Empty message={`No entries for ${view} view`} />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <ApperIcon name="Clock" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-gray-700">Total Time</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatDuration(stats.totalTime)}</p>
              </div>
              
              <div className="bg-gradient-to-br from-success/10 to-success/20 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <ApperIcon name="DollarSign" size={16} className="text-success" />
                  <span className="text-sm font-medium text-gray-700">Billable</span>
                </div>
                <p className="text-2xl font-bold text-success">{formatDuration(stats.billableTime)}</p>
              </div>
            </div>

            {/* Project Breakdown */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ApperIcon name="BarChart3" size={16} className="mr-2" />
                Project Breakdown
              </h4>
              
              {stats.projects && stats.projects.length > 0 ? (
                <div className="space-y-3">
                  {stats.projects.map((project, index) => {
                    const percentage = ((project.duration / stats.totalTime) * 100).toFixed(1);
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getProjectColor(project.name) }}
                            />
                            <span className="font-medium">{project.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{formatDuration(project.duration)}</span>
                            <span className="text-xs text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getProjectColor(project.name)
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No project data available</p>
              )}
            </div>

            {/* Billable vs Non-billable */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <ApperIcon name="PieChart" size={16} className="mr-2" />
                Billable Summary
              </h4>
              
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="billable">Billable</Badge>
                  <span className="text-sm font-medium">{formatDuration(stats.billableTime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="nonBillable">Non-billable</Badge>
                  <span className="text-sm font-medium">{formatDuration(stats.nonBillableTime)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ReportsPanel;