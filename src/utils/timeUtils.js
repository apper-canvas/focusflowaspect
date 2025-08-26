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

// Goal tracking utilities
export const calculateGoalProgress = (current, target) => {
  if (!target || target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

export const getGoalStatus = (current, target) => {
  const progress = calculateGoalProgress(current, target);
  if (progress >= 100) return 'completed';
  if (progress >= 75) return 'on-track';
  if (progress >= 50) return 'behind';
  return 'critical';
};

export const calculateProductivityScore = (timeEntries, goals = {}) => {
  if (!timeEntries || timeEntries.length === 0) return 0;
  
  const today = getTodayStart();
  const todayEntries = timeEntries.filter(entry => entry.startTime >= today);
  
  const totalTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const focusTime = todayEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const sessionCount = todayEntries.length;
  
  // Base score from time worked (0-40 points)
  const timeScore = Math.min((totalTime / 28800) * 40, 40); // 8 hours = max points
  
  // Focus ratio bonus (0-30 points)
  const focusRatio = totalTime > 0 ? focusTime / totalTime : 0;
  const focusScore = focusRatio * 30;
  
  // Session consistency bonus (0-30 points)
  const sessionScore = Math.min((sessionCount / 6) * 30, 30); // 6+ sessions = max points
  
  return Math.round(timeScore + focusScore + sessionScore);
};

export const getProductivityTrend = (timeEntries, days = 7) => {
  const trends = [];
  const now = Date.now();
  
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = now - (i * 24 * 60 * 60 * 1000);
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const dayEntries = timeEntries.filter(entry => 
      entry.startTime >= dayStart && entry.startTime < dayEnd
    );
    
    const totalTime = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    trends.push({ date: dayStart, totalTime, score: calculateProductivityScore(dayEntries) });
  }
  
  return trends;
};

export const generateGoalRecommendations = (timeEntries, currentGoals = {}) => {
  const recommendations = [];
  const weekStart = getWeekStart();
  const weekEntries = timeEntries.filter(entry => entry.startTime >= weekStart);
  
  const totalWeekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const avgDailyTime = totalWeekTime / 7;
  
  // Recommend daily goal based on current pattern
  if (!currentGoals.dailyHours) {
    const recommendedDaily = Math.ceil(avgDailyTime / 3600);
    recommendations.push({
      type: 'daily',
      goal: recommendedDaily,
      reason: `Based on your average of ${Math.round(avgDailyTime / 36) / 100}h per day`
    });
  }
  
  // Recommend project-specific goals
  const projectTimes = {};
  weekEntries.forEach(entry => {
    projectTimes[entry.project] = (projectTimes[entry.project] || 0) + entry.duration;
  });
  
  const topProject = Object.entries(projectTimes)
    .sort(([,a], [,b]) => b - a)[0];
  
  if (topProject && !currentGoals[`project_${topProject[0]}`]) {
    recommendations.push({
      type: 'project',
      project: topProject[0],
      goal: Math.ceil(topProject[1] / 3600 * 1.2), // 20% increase
      reason: 'Your most active project this week'
    });
}
  
  return recommendations;
};