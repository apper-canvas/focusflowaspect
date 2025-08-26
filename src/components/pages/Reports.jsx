import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReportsPanel from "@/components/organisms/ReportsPanel";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { formatDate } from "@/utils/timeUtils";

const Reports = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("week");
  const [exportFormat, setExportFormat] = useState("csv");

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "quarter", label: "This Quarter" },
    { value: "year", label: "This Year" }
  ];

  const exportOptions = [
    { value: "csv", label: "CSV", icon: "FileText" },
    { value: "excel", label: "Excel", icon: "FileSpreadsheet" },
    { value: "pdf", label: "PDF", icon: "FileImage" }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-display">Time Reports</h1>
          <p className="text-gray-600">Analyze your productivity and time allocation</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <Button variant="secondary" size="sm">
            <ApperIcon name="Download" size={16} className="mr-1" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReportsPanel />
        </div>
        
        <div className="space-y-6">
{/* Goal Setting Interface */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 font-display">
                Goal Setting
              </h3>
<Button 
                size="sm" 
                variant="secondary"
                onClick={() => navigate('/goals')}
              >
                <ApperIcon name="Settings" size={16} className="mr-2" />
                Customize Goals
              </Button>
            </div>
            
            <div className="space-y-6">
              {/* Daily Goals */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <ApperIcon name="Sun" size={16} className="mr-2 text-warning" />
                  Daily Goals
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-warning/5 to-warning/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Work Hours</span>
                        <span className="text-gray-600">6.5/8h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-warning to-warning/80 h-2 rounded-full transition-all duration-500" style={{ width: "81%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>81% Complete</span>
                        <span>1.5h remaining</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-success/5 to-success/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Focus Sessions</span>
                        <span className="text-gray-600">4/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full transition-all duration-500" style={{ width: "80%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>80% Complete</span>
                        <span>1 session left</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Goals */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <ApperIcon name="Calendar" size={16} className="mr-2 text-primary" />
                  Weekly Goals
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Billable Hours</span>
                        <span className="text-gray-600">32/40h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500" style={{ width: "80%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>80% Complete</span>
                        <span>8h remaining</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-info/5 to-info/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Learning Time</span>
                        <span className="text-gray-600">3.5/5h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-info to-info/80 h-2 rounded-full transition-all duration-500" style={{ width: "70%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>70% Complete</span>
                        <span>1.5h remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project-Specific Goals */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <ApperIcon name="Target" size={16} className="mr-2 text-secondary" />
                  Project Goals
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">FocusFlow Development</span>
                        <span className="text-gray-600">18/25h</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-secondary to-secondary/80 h-2 rounded-full transition-all duration-500" style={{ width: "72%" }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>72% Complete</span>
                        <span>7h remaining this week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-6" size="sm">
              <ApperIcon name="Plus" size={16} className="mr-2" />
              Add New Goal
            </Button>
          </Card>

          {/* Achievement Dashboard */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Achievements & Insights
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                <div className="p-2 bg-success rounded-full">
                  <ApperIcon name="Trophy" size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Goal Achieved!</p>
                  <p className="text-sm text-gray-600">Completed daily focus sessions streak (7 days)</p>
                </div>
                <div className="text-xs text-success font-bold">+10 XP</div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
                <div className="p-2 bg-primary rounded-full">
                  <ApperIcon name="TrendingUp" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Productivity Up 23%</p>
                  <p className="text-sm text-gray-600">Compared to last week</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-warning/10 to-warning/5 rounded-lg">
                <div className="p-2 bg-warning rounded-full">
                  <ApperIcon name="Clock" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Best Session Today</p>
                  <p className="text-sm text-gray-600">2h 45m on FocusFlow Development</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-info/10 to-info/5 rounded-lg">
                <div className="p-2 bg-info rounded-full">
                  <ApperIcon name="Zap" size={20} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Peak Hours</p>
                  <p className="text-sm text-gray-600">Most productive: 9 AM - 11 AM</p>
                </div>
              </div>
            </div>
            
            {/* Weekly Progress Summary */}
            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">This Week's Progress</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-success">85%</div>
                  <div className="text-xs text-gray-600">Goals Met</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">42.5h</div>
                  <div className="text-xs text-gray-600">Total Time</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">12</div>
                  <div className="text-xs text-gray-600">Sessions</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;