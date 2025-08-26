import React, { useState, useEffect } from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import { activityDetectionService } from "@/services/activityDetectionService";
import { timeEntryService } from "@/services/api/timeEntryService";
import { formatDuration, formatTime } from "@/utils/timeUtils";
import { toast } from "react-toastify";

const ActivityFeed = ({ onEntryCreated }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());

  useEffect(() => {
    // Load initial activities
    loadActivities();

    // Listen for new activity detections
    const unsubscribe = activityDetectionService.onActivityDetected((event) => {
      if (event.type === 'activity_detected') {
        setActivities(prev => [event.activity, ...prev.slice(0, 19)]);
      }
    });

    return unsubscribe;
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const allActivities = activityDetectionService.getAllActivities();
      setActivities(allActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptActivity = async (activity) => {
    if (processingIds.has(activity.id)) return;
    
    setProcessingIds(prev => new Set([...prev, activity.id]));
    
    try {
      // Accept the activity
      activityDetectionService.acceptActivity(activity.id);
      
      // Create time entry from activity
      const timeEntry = await timeEntryService.create({
        project: `${activity.category} - ${activity.app}`,
        description: activity.context,
        tags: ['ai-detected', activity.category.toLowerCase(), activity.app.toLowerCase()],
        startTime: activity.timestamp - (activity.duration * 1000),
        endTime: activity.timestamp,
        duration: activity.duration,
        autoDetected: true,
        billable: activity.category !== 'Personal'
      });

      // Update activity status in UI
      setActivities(prev => 
        prev.map(a => 
          a.id === activity.id 
            ? { ...a, status: 'accepted' }
            : a
        )
      );

      toast.success(`Activity accepted: ${activity.app} - ${formatDuration(activity.duration)}`);
      
      if (onEntryCreated) {
        onEntryCreated();
      }
    } catch (error) {
      toast.error("Failed to accept activity");
      console.error("Accept activity error:", error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(activity.id);
        return newSet;
      });
    }
  };

  const handleRejectActivity = async (activity) => {
    if (processingIds.has(activity.id)) return;
    
    setProcessingIds(prev => new Set([...prev, activity.id]));
    
    try {
      activityDetectionService.rejectActivity(activity.id);
      
      setActivities(prev => 
        prev.map(a => 
          a.id === activity.id 
            ? { ...a, status: 'rejected' }
            : a
        )
      );

      toast.info("Activity rejected");
    } catch (error) {
      toast.error("Failed to reject activity");
      console.error("Reject activity error:", error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(activity.id);
        return newSet;
      });
    }
  };

  const handleClearActivity = (activityId) => {
    activityDetectionService.clearActivity(activityId);
    setActivities(prev => prev.filter(a => a.id !== activityId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-success';
      case 'rejected': return 'text-error';
      default: return 'text-warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return 'CheckCircle';
      case 'rejected': return 'XCircle';
      default: return 'Clock';
    }
  };

  if (loading) return <Loading />;

  const pendingActivities = activities.filter(a => a.status === 'pending');
  const recentActivities = activities.filter(a => a.status !== 'pending').slice(0, 5);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 font-display">AI Activity Detection</h3>
          <p className="text-sm text-gray-600">Detected activities from your apps and websites</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="default">
            {pendingActivities.length} pending
          </Badge>
          <Button variant="ghost" size="sm" onClick={loadActivities}>
            <ApperIcon name="RefreshCw" size={16} />
          </Button>
        </div>
      </div>

      <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
        {pendingActivities.length === 0 && recentActivities.length === 0 ? (
          <Empty message="No activities detected yet" />
        ) : (
          <>
            {/* Pending Activities */}
            {pendingActivities.map((activity) => (
              <div
                key={activity.id}
                className="group p-4 bg-gradient-to-r from-warning/5 to-info/5 rounded-lg border-2 border-dashed border-warning/30 hover:border-warning/50 transition-all duration-200"
              >
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 p-2 bg-white rounded-lg shadow-sm">
                      <ApperIcon name={activity.icon} size={16} className="text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">
                          {activity.app}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default" className="text-xs">
                            {activity.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {activity.context}
                      </p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-xs text-gray-500">
                        <span>Duration: {formatDuration(activity.duration)}</span>
                        <span>Confidence: {activity.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end sm:justify-start space-x-2 sm:ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleAcceptActivity(activity)}
                      disabled={processingIds.has(activity.id)}
                      className="flex items-center space-x-1"
                    >
                      {processingIds.has(activity.id) ? (
                        <ApperIcon name="Loader2" size={12} className="animate-spin" />
                      ) : (
                        <ApperIcon name="Check" size={12} />
                      )}
                      <span>Accept</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectActivity(activity)}
                      disabled={processingIds.has(activity.id)}
                      className="flex items-center space-x-1"
                    >
                      <ApperIcon name="X" size={12} />
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Recent Activities */}
            {recentActivities.length > 0 && (
              <>
                {pendingActivities.length > 0 && (
                  <div className="border-t pt-4 mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Activities</h4>
                  </div>
                )}
                
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="group p-3 bg-gray-50 rounded-lg border hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <ApperIcon name={activity.icon} size={14} className="text-gray-600" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {activity.app}
                            </span>
                            <ApperIcon 
                              name={getStatusIcon(activity.status)} 
                              size={12} 
                              className={getStatusColor(activity.status)}
                            />
                            <span className="text-xs text-gray-500">
                              {formatTime(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {activity.context}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleClearActivity(activity.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <ApperIcon name="X" size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default ActivityFeed;