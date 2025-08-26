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

export const calculateProductivityScore = (timeEntries) => {
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
goal: Math.ceil(topProject[1] / 3600 * 1.2), // 20% increase
      reason: 'Your most active project this week'
    });
  }
  
  return recommendations;
};
export const checkGoalAchievements = (timeEntries, goals) => {
  const achievements = [];
  
  if (!goals || !timeEntries.length) return achievements;
  
  const today = getTodayStart();
  const week = getWeekStart();
  
  const todayEntries = timeEntries.filter(entry => entry.startTime >= today);
  const weekEntries = timeEntries.filter(entry => entry.startTime >= week);
  
  const todayTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const weekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  
  // Check daily goals
  if (goals.daily) {
    const dailyHours = todayTime / 3600;
    if (dailyHours >= goals.daily.workHours) {
      achievements.push({
        type: 'daily',
        goal: 'workHours',
        achieved: dailyHours,
        target: goals.daily.workHours,
        message: `Daily work goal achieved: ${Math.round(dailyHours * 10) / 10}h`
      });
    }
    
    const focusSessions = todayEntries.length;
    if (focusSessions >= goals.daily.focusSessions) {
      achievements.push({
        type: 'daily',
        goal: 'focusSessions',
        achieved: focusSessions,
        target: goals.daily.focusSessions,
        message: `Daily focus sessions goal achieved: ${focusSessions} sessions`
      });
    }
  }
  
  // Check weekly goals
  if (goals.weekly) {
    const weeklyHours = weekTime / 3600;
    const billableTime = weekEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const billableHours = billableTime / 3600;
    
    if (billableHours >= goals.weekly.billableHours) {
      achievements.push({
        type: 'weekly',
        goal: 'billableHours',
        achieved: billableHours,
        target: goals.weekly.billableHours,
        message: `Weekly billable goal achieved: ${Math.round(billableHours * 10) / 10}h`
      });
    }
  }
  
  return achievements;
};
export const calculateRemainingTime = (current, target) => {
  if (!target || target <= 0) return 0;
  return Math.max(target - current, 0);
};

export const formatGoalProgress = (current, target, unit = 'h') => {
  const remaining = calculateRemainingTime(current, target);
  const progress = calculateGoalProgress(current, target);
  
  if (progress >= 100) {
    return {
      message: `Goal exceeded by ${(current - target).toFixed(1)}${unit}! 🎉`,
      status: 'exceeded',
      color: 'success'
    };
  }
  
  if (remaining === 0) {
    return {
      message: 'Goal achieved! 🎯',
      status: 'completed',
      color: 'success'
    };
  }
  
  return {
    message: `${remaining.toFixed(1)}${unit} remaining`,
    status: progress >= 50 ? 'on-track' : 'behind',
    color: progress >= 75 ? 'primary' : progress >= 50 ? 'info' : progress >= 25 ? 'warning' : 'error'
  };
};

export const getWeeklyGoalInsights = (timeEntries, goals) => {
  const insights = [];
  const weekStart = getWeekStart();
  const weekEntries = timeEntries.filter(entry => entry.startTime >= weekStart);
  
  if (!goals) return insights;
  
  const weekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableTime = weekEntries.filter(entry => entry.billable).reduce((sum, entry) => sum + (entry.duration || 0), 0);
  
  const daysIntoWeek = Math.ceil((Date.now() - weekStart) / (24 * 60 * 60 * 1000));
  const expectedProgress = daysIntoWeek / 7;
  
  // Billable hours insight
  if (goals.weekly?.billableHours) {
    const billableProgress = billableTime / (goals.weekly.billableHours * 3600);
    if (billableProgress < expectedProgress - 0.1) {
      insights.push({
        type: 'warning',
        category: 'billable',
        message: `Billable hours are ${Math.round((expectedProgress - billableProgress) * 100)}% behind weekly target`,
        suggestion: 'Consider prioritizing billable tasks'
      });
    } else if (billableProgress > expectedProgress + 0.1) {
      insights.push({
        type: 'success',
        category: 'billable',
        message: `Excellent pace on billable hours - ${Math.round((billableProgress - expectedProgress) * 100)}% ahead`,
        suggestion: 'Great momentum, keep it up!'
      });
    }
  }
  
  // Project-specific insights
  if (goals.projects?.length > 0) {
    const projectTimes = {};
    weekEntries.forEach(entry => {
      if (entry.project) {
        projectTimes[entry.project] = (projectTimes[entry.project] || 0) + entry.duration;
      }
    });
    
    goals.projects.forEach(project => {
      const projectTime = projectTimes[project.name] || 0;
      const projectProgress = projectTime / (project.weeklyTarget * 3600);
      
      if (projectProgress < expectedProgress - 0.15) {
        insights.push({
          type: 'warning',
          category: 'project',
          message: `${project.name} is behind schedule`,
          suggestion: `Needs ${Math.ceil((project.weeklyTarget * expectedProgress * 3600 - projectTime) / 3600)}h to catch up`,
          priority: project.priority
        });
      }
    });
  }
  
  return insights;
};

export const calculateDailyStreak = (timeEntries, goals) => {
  if (!goals?.daily?.workHours) return 0;
  
  const today = getTodayStart();
  let streak = 0;
  let currentDay = today;
  
  // Look back up to 30 days
  for (let i = 0; i < 30; i++) {
    const dayStart = currentDay - (i * 24 * 60 * 60 * 1000);
    const dayEnd = dayStart + (24 * 60 * 60 * 1000);
    
    const dayEntries = timeEntries.filter(entry => 
      entry.startTime >= dayStart && entry.startTime < dayEnd
    );
    
    const dayTime = dayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const dayHours = dayTime / 3600;
    
    if (dayHours >= goals.daily.workHours) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getMotivationalMessage = (progress, goalType, timeRemaining) => {
  const messages = {
    high: {
      completed: [
        "Outstanding! You've crushed your goal! 🚀",
        "Incredible achievement! You're on fire! 🔥",
        "Goal smashed! You're unstoppable! 💪"
      ],
      onTrack: [
        "Excellent pace! You're right on target! 🎯",
        "Perfect rhythm! Keep this momentum! ⚡",
        "You're crushing it! Stay focused! 🌟"
      ],
      behind: [
        "Time to focus! You've got this! 💪",
        "Push through - success is within reach! 🚀",
        "Turn up the intensity! You can catch up! 🔥"
      ],
      critical: [
        "It's now or never! Give it everything! 💥",
        "Crunch time! You can still make it! ⚡",
        "Final push! Don't give up now! 🚨"
      ]
    },
    medium: {
      completed: [
        "Great job! Goal achieved! 🎉",
        "Well done! You made it! ✨",
        "Success! Keep up the good work! 👏"
      ],
      onTrack: [
        "Good progress! Stay the course! 📈",
        "Nice work! You're on track! 👍",
        "Steady progress! Keep going! 🎯"
      ],
      behind: [
        "Time to pick up the pace! 🏃‍♂️",
        "You can catch up! Stay focused! 💭",
        "Push a bit harder! You've got this! 💪"
      ],
      critical: [
        "Need to focus now! You can do it! 🚨",
        "Time is running out! Push harder! ⏰",
        "Last chance! Give it your all! 🔥"
      ]
    }
  };
  
  const intensity = goalType === 'daily' ? 'high' : 'medium';
  const status = progress >= 100 ? 'completed' : 
                progress >= 75 ? 'onTrack' : 
                progress >= 40 ? 'behind' : 'critical';
const messageList = messages[intensity][status];
  return messageList[Math.floor(Math.random() * messageList.length)];
};

export const calculateRemainingTimeBreakdown = (current, target) => {
  const remaining = Math.max(target - current, 0);
  return {
    hours: Math.floor(remaining),
    minutes: Math.round((remaining % 1) * 60),
    total: remaining
  };
};
export const getProductivityTrendComparison = (currentWeek, previousWeek) => {
  if (!previousWeek || previousWeek === 0) return { trend: 'new', change: 0 };
  
  const change = ((currentWeek - previousWeek) / previousWeek) * 100;
  
  if (change > 10) return { trend: 'up', change: Math.round(change) };
  if (change < -10) return { trend: 'down', change: Math.round(Math.abs(change)) };
  return { trend: 'stable', change: Math.round(Math.abs(change)) };
};