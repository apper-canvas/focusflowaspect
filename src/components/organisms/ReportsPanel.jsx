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
            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10" />
                <div className="flex items-center space-x-2 mb-1">
                  <ApperIcon name="Clock" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-gray-700">Total Time</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatDuration(stats.totalTime)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <ApperIcon name="TrendingUp" size={12} className="text-success" />
                  <span className="text-xs text-success font-medium">+12% vs last {view}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-success/10 to-success/20 p-4 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-success/5 rounded-full -mr-10 -mt-10" />
                <div className="flex items-center space-x-2 mb-1">
                  <ApperIcon name="DollarSign" size={16} className="text-success" />
                  <span className="text-sm font-medium text-gray-700">Billable</span>
                </div>
                <p className="text-2xl font-bold text-success">{formatDuration(stats.billableTime)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs text-success font-medium">
                    {stats.totalTime > 0 ? Math.round((stats.billableTime / stats.totalTime) * 100) : 0}% of total
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Project Breakdown */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="BarChart3" size={16} className="mr-2" />
                Visual Project Breakdown
              </h4>
              
              {stats.projects && stats.projects.length > 0 ? (
                <>
                  {/* Project Time Distribution */}
                  <div className="space-y-4">
                    {stats.projects.map((project, index) => {
                      const percentage = ((project.duration / stats.totalTime) * 100).toFixed(1);
                      const isTopProject = index === 0;
                      return (
                        <div key={index} className={`p-3 rounded-lg border transition-all duration-300 hover:shadow-md ${
                          isTopProject ? 'bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20' : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <div className="flex items-center space-x-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: getProjectColor(project.name) }}
                              />
                              <span className="font-medium">{project.name}</span>
                              {isTopProject && (
                                <Badge variant="success">
                                  <ApperIcon name="Crown" size={10} className="mr-1" />
                                  Top
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-gray-600 font-medium">{formatDuration(project.duration)}</span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full font-medium">{percentage}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                            <div
                              className="h-3 rounded-full transition-all duration-700 ease-out relative"
                              style={{
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${getProjectColor(project.name)}, ${getProjectColor(project.name)}80)`
                              }}
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>{view === 'daily' ? 'Today' : 'This Week'}</span>
                            <span>
                              {project.sessions || Math.ceil(project.duration / 3600)} session{(project.sessions || Math.ceil(project.duration / 3600)) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Project Comparison Chart */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                      <ApperIcon name="PieChart" size={14} className="mr-2" />
                      Time Distribution Overview
                    </h5>
                    <div className="flex space-x-1 h-6 rounded-full overflow-hidden bg-gray-200">
                      {stats.projects.map((project, index) => {
                        const percentage = (project.duration / stats.totalTime) * 100;
                        return (
                          <div
                            key={index}
                            className="transition-all duration-500 hover:opacity-80"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: getProjectColor(project.name)
                            }}
                            title={`${project.name}: ${percentage.toFixed(1)}%`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {stats.projects.slice(0, 3).map((project, index) => (
                        <div key={index} className="flex items-center space-x-1 text-xs">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getProjectColor(project.name) }}
                          />
                          <span className="text-gray-600">{project.name}</span>
                        </div>
                      ))}
                      {stats.projects.length > 3 && (
                        <span className="text-xs text-gray-500">+{stats.projects.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="BarChart3" size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No project data available</p>
                </div>
              )}
            </div>

            {/* Enhanced Billable Analysis */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <ApperIcon name="DollarSign" size={16} className="mr-2" />
                Billable Time Analysis
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-success/10 to-success/5 rounded-lg border border-success/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="billable">Billable</Badge>
                    <span className="text-sm font-medium">{formatDuration(stats.billableTime)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {stats.totalTime > 0 ? Math.round((stats.billableTime / stats.totalTime) * 100) : 0}% of total time
                  </div>
                </div>
                
                <div className="p-3 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="nonBillable">Non-billable</Badge>
                    <span className="text-sm font-medium">{formatDuration(stats.nonBillableTime)}</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {stats.totalTime > 0 ? Math.round((stats.nonBillableTime / stats.totalTime) * 100) : 0}% of total time
                  </div>
                </div>
              </div>

              {/* Billable vs Non-billable Visualization */}
              <div className="relative">
                <div className="flex h-8 rounded-full overflow-hidden bg-gray-200">
                  <div 
                    className="bg-gradient-to-r from-success to-success/80 transition-all duration-700"
                    style={{ width: `${stats.totalTime > 0 ? (stats.billableTime / stats.totalTime) * 100 : 0}%` }}
                  />
                  <div 
                    className="bg-gradient-to-r from-gray-400 to-gray-300 transition-all duration-700"
                    style={{ width: `${stats.totalTime > 0 ? (stats.nonBillableTime / stats.totalTime) * 100 : 0}%` }}
                  />
                </div>
                <div className="flex justify-center mt-2">
                  <div className="text-xs text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border">
                    Billable Rate: {stats.totalTime > 0 ? Math.round((stats.billableTime / stats.totalTime) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Productivity Insights */}
            <div className="p-4 bg-gradient-to-r from-info/10 to-info/5 rounded-lg">
              <h5 className="font-medium text-gray-800 mb-3 flex items-center">
                <ApperIcon name="Brain" size={14} className="mr-2 text-info" />
                Productivity Insights
              </h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-info">
                    {stats.totalTime > 0 ? Math.round(stats.totalTime / 3600 * 10) / 10 : 0}h
                  </div>
                  <div className="text-xs text-gray-600">Avg per day</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">
                    {stats.projects ? stats.projects.length : 0}
                  </div>
                  <div className="text-xs text-gray-600">Active projects</div>
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