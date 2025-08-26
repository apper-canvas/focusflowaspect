import React from "react";
import { useSelector } from "react-redux";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const SyncStatusIndicator = ({ compact = false, showDetails = true }) => {
  const sync = useSelector(state => state.sync);

  const getStatusColor = () => {
    switch (sync.status) {
      case 'syncing':
      case 'connecting':
      case 'discovering':
        return 'text-warning';
      case 'completed':
        return 'text-success';
      case 'error':
        return 'text-error';
      default:
        return sync.enabled ? 'text-primary' : 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (sync.status) {
      case 'syncing':
        return 'RefreshCw';
      case 'connecting':
        return 'Wifi';
      case 'discovering':
        return 'Search';
      case 'completed':
        return 'CheckCircle';
      case 'error':
        return 'AlertCircle';
      default:
        return sync.enabled ? 'Smartphone' : 'SmartphoneNfc';
    }
  };

  const getStatusText = () => {
    if (!sync.enabled) return 'Sync disabled';
    
    switch (sync.status) {
      case 'discovering':
        return 'Discovering devices...';
      case 'connecting':
        return 'Connecting...';
      case 'syncing':
        return 'Syncing data...';
      case 'completed':
        return 'Sync completed';
      case 'error':
        return `Error: ${sync.error}`;
      default:
        if (sync.lastSync) {
          const lastSyncDate = new Date(sync.lastSync);
          const now = new Date();
          const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60));
          
          if (diffMinutes < 1) return 'Just synced';
          if (diffMinutes < 60) return `Synced ${diffMinutes}m ago`;
          
          const diffHours = Math.floor(diffMinutes / 60);
          if (diffHours < 24) return `Synced ${diffHours}h ago`;
          
          const diffDays = Math.floor(diffHours / 24);
          return `Synced ${diffDays}d ago`;
        }
        return 'Ready to sync';
    }
  };

  const formatDeviceCount = () => {
    if (sync.deviceCount === 0) return 'No devices';
    if (sync.deviceCount === 1) return '1 device';
    return `${sync.deviceCount} devices`;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <ApperIcon 
            name={getStatusIcon()} 
            size={16} 
            className={cn(
              getStatusColor(),
              sync.status === 'syncing' && 'animate-spin'
            )} 
          />
          {sync.encrypted && (
            <div className="absolute -top-1 -right-1">
              <ApperIcon name="Shield" size={8} className="text-success" />
            </div>
          )}
        </div>
        
        {sync.enabled && (
          <Badge variant="sync" size="sm">
            {sync.deviceCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
      <div className="relative">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          sync.enabled ? "bg-primary/10" : "bg-gray-100"
        )}>
          <ApperIcon 
            name={getStatusIcon()} 
            size={20} 
            className={cn(
              getStatusColor(),
              sync.status === 'syncing' && 'animate-spin'
            )} 
          />
        </div>
        
        {sync.encrypted && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
            <ApperIcon name="Shield" size={12} className="text-white" />
          </div>
        )}
        
        {sync.status === 'syncing' && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-3 h-3 bg-warning rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            Cross-Device Sync
          </p>
          {sync.encrypted && (
            <Badge variant="encryption" size="sm">
              Encrypted
            </Badge>
          )}
        </div>
        
        {showDetails && (
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-xs text-gray-500 truncate">
              {getStatusText()}
            </p>
            
            {sync.enabled && (
              <Badge variant="sync" size="sm">
                {formatDeviceCount()}
              </Badge>
            )}
          </div>
        )}
        
        {sync.progress.message && (
          <div className="mt-2">
            <p className="text-xs text-gray-400">{sync.progress.message}</p>
            {sync.progress.total > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(sync.progress.current / sync.progress.total) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {sync.enabled && sync.status !== 'syncing' && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.syncService?.triggerSync()}
          disabled={!sync.enabled}
        >
          <ApperIcon name="RefreshCw" size={14} />
        </Button>
      )}
    </div>
  );
};

export default SyncStatusIndicator;