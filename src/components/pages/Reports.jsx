import React, { useState } from "react";
import ReportsPanel from "@/components/organisms/ReportsPanel";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { formatDate } from "@/utils/timeUtils";

const Reports = () => {
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
          {/* Export Options */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Export Options
            </h3>
            
            <div className="space-y-3">
              {exportOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setExportFormat(option.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    exportFormat === option.value
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ApperIcon name={option.icon} size={20} />
                    <span className="font-medium">{option.label}</span>
                  </div>
                  {exportFormat === option.value && (
                    <ApperIcon name="Check" size={16} />
                  )}
                </button>
              ))}
            </div>
            
            <Button className="w-full mt-4">
              <ApperIcon name="Download" size={16} className="mr-2" />
              Export as {exportOptions.find(o => o.value === exportFormat)?.label}
            </Button>
          </Card>

          {/* Quick Insights */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Quick Insights
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-success/10 rounded-lg">
                <ApperIcon name="TrendingUp" size={20} className="text-success" />
                <div>
                  <p className="font-medium text-gray-900">Most Productive</p>
                  <p className="text-sm text-gray-600">Tuesday afternoons</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
                <ApperIcon name="Target" size={20} className="text-primary" />
                <div>
                  <p className="font-medium text-gray-900">Top Project</p>
                  <p className="text-sm text-gray-600">FocusFlow Development</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg">
                <ApperIcon name="Clock" size={20} className="text-warning" />
                <div>
                  <p className="font-medium text-gray-900">Average Session</p>
                  <p className="text-sm text-gray-600">1.5 hours</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Time Goals */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 font-display mb-4">
              Weekly Goals
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Billable Hours</span>
                  <span className="text-gray-600">32/40h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-success to-success/80 h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Focus Sessions</span>
                  <span className="text-gray-600">12/15</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Learning Time</span>
                  <span className="text-gray-600">3/5h</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-info to-info/80 h-2 rounded-full" style={{ width: "60%" }}></div>
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