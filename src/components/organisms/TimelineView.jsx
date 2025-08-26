import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { timeEntryService } from "@/services/api/timeEntryService";
import { formatDuration, formatTime, formatDate, getTodayStart } from "@/utils/timeUtils";
import { toast } from "react-toastify";

const TimelineView = ({ refresh }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    loadEntries();
  }, [refresh]);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    try {
      const allEntries = await timeEntryService.getAll();
      const todayStart = getTodayStart();
      const todayEntries = allEntries
        .filter(entry => entry.startTime >= todayStart)
        .sort((a, b) => b.startTime - a.startTime);
      
      setEntries(todayEntries);
    } catch (err) {
      setError("Failed to load time entries");
      console.error("Load entries error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    
    try {
      await timeEntryService.delete(id);
      setEntries(entries.filter(entry => entry.Id !== id));
      toast.success("Entry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete entry");
      console.error("Delete error:", error);
    }
  };

  const handleEditStart = (entry) => {
    setEditingId(entry.Id);
    setEditDescription(entry.description || "");
  };

  const handleEditSave = async (id) => {
    try {
      await timeEntryService.update(id, { description: editDescription });
      setEntries(entries.map(entry => 
        entry.Id === id ? { ...entry, description: editDescription } : entry
      ));
      setEditingId(null);
      setEditDescription("");
      toast.success("Entry updated successfully");
    } catch (error) {
      toast.error("Failed to update entry");
      console.error("Update error:", error);
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditDescription("");
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
  if (error) return <Error message={error} onRetry={loadEntries} />;
  if (entries.length === 0) return <Empty message="No time entries for today" />;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 font-display">Today's Timeline</h3>
        <Button variant="ghost" size="sm" onClick={loadEntries}>
          <ApperIcon name="RefreshCw" size={16} className="mr-1" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3 custom-scrollbar max-h-[400px] overflow-y-auto">
        {entries.map((entry) => (
          <div
            key={entry.Id}
            className="group relative p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getProjectColor(entry.project) }}
                  />
                  <span className="font-medium text-gray-900 truncate">
                    {entry.project}
                  </span>
                  <Badge variant={entry.billable ? "billable" : "nonBillable"}>
                    {entry.billable ? "Billable" : "Non-billable"}
                  </Badge>
                  {entry.autoDetected && (
                    <Badge variant="default">
                      <ApperIcon name="Zap" size={10} className="mr-1" />
                      Auto
                    </Badge>
                  )}
                </div>

                {editingId === entry.Id ? (
                  <div className="space-y-2">
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-primary"
                      placeholder="Entry description..."
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => handleEditSave(entry.Id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-700 text-sm mb-2">
                      {entry.description || "No description"}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{formatTime(entry.startTime)}</span>
                      {entry.endTime && (
                        <>
                          <span>→</span>
                          <span>{formatTime(entry.endTime)}</span>
                        </>
                      )}
                      <span className="font-medium text-primary">
                        {formatDuration(entry.duration)}
                      </span>
                    </div>

                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {editingId !== entry.Id && (
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity space-x-1 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditStart(entry)}
                    className="p-1"
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(entry.Id)}
                    className="p-1 text-error hover:text-error"
                  >
                    <ApperIcon name="Trash2" size={14} />
                  </Button>
                </div>
              )}
            </div>

            {!entry.endTime && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TimelineView;