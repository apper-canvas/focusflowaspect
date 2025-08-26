export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export const parseQuickEntry = (text) => {
  const patterns = {
    duration: /(\d+(?:\.\d+)?)\s*(h|hr|hours?|m|min|minutes?)/gi,
    project: /#(\w+)/gi,
    tags: /@(\w+)/gi
  };

  let description = text;
  let duration = null;
  let project = null;
  const tags = [];

  // Extract duration
  const durationMatch = patterns.duration.exec(text);
  if (durationMatch) {
    const value = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    
    if (unit.startsWith("h")) {
      duration = value * 3600; // hours to seconds
    } else if (unit.startsWith("m")) {
      duration = value * 60; // minutes to seconds
    }
    
    description = description.replace(durationMatch[0], "").trim();
  }

  // Extract project
  const projectMatch = patterns.project.exec(text);
  if (projectMatch) {
    project = projectMatch[1];
    description = description.replace(projectMatch[0], "").trim();
  }

  // Extract tags
  let tagMatch;
  while ((tagMatch = patterns.tags.exec(text)) !== null) {
    tags.push(tagMatch[1]);
    description = description.replace(tagMatch[0], "").trim();
  }

  return {
    description: description.trim(),
    duration,
    project,
    tags
  };
};

export const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

export const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day;
  const weekStart = new Date(today.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.getTime();
};

export const generateTimeSlots = (startTime, endTime) => {
  const slots = [];
  const current = new Date(startTime);
  const end = new Date(endTime);
  
  while (current <= end) {
    slots.push({
      time: formatTime(current.getTime()),
      timestamp: current.getTime()
    });
    current.setMinutes(current.getMinutes() + 30);
  }
  
  return slots;
};