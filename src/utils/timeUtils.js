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
      project: topProject[0],
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
export const getGoalStatus = (progress) => {
  if (progress >= 100) return { status: 'completed', color: 'success', message: 'Goal achieved!' };
  if (progress >= 80) return { status: 'on-track', color: 'primary', message: 'Excellent progress' };
  if (progress >= 60) return { status: 'good', color: 'info', message: 'Good pace' };
  if (progress >= 40) return { status: 'behind', color: 'warning', message: 'Needs attention' };
  return { status: 'critical', color: 'error', message: 'Action required' };
};

export const calculateRemainingTime = (current, target) => {
  const remaining = Math.max(target - current, 0);
  return {
    hours: Math.floor(remaining),
    minutes: Math.round((remaining % 1) * 60),
    total: remaining
  };
};

export const generateGoalRecommendations = (goals, stats) => {
  const recommendations = [];
  
  if (!goals || !stats) return recommendations;
  
  const todayHours = stats.today / 3600;
  const weekHours = stats.week / 3600;
  const billableHours = stats.billable / 3600;
  
  // Daily goal recommendations
  const dailyProgress = calculateGoalProgress(todayHours, goals.daily.workHours);
  if (dailyProgress < 50 && new Date().getHours() > 14) {
    recommendations.push({
      type: 'daily',
      priority: 'high',
      message: `You're behind on daily goals. Consider focusing on high-priority tasks.`,
      action: 'Start a focus session'
    });
  }
  
  // Weekly goal recommendations
  const weeklyProgress = calculateGoalProgress(billableHours, goals.weekly.billableHours);
  const dayOfWeek = new Date().getDay();
  if (weeklyProgress < (dayOfWeek / 7 * 100) && dayOfWeek > 2) {
    recommendations.push({
      type: 'weekly',
      priority: 'medium',
      message: `Weekly billable hours are falling behind schedule.`,
      action: 'Schedule more client work'
    });
  }
  
  return recommendations;
};

export const getProductivityTrend = (currentWeek, previousWeek) => {
  if (!previousWeek || previousWeek === 0) return { trend: 'new', change: 0 };
  
  const change = ((currentWeek - previousWeek) / previousWeek) * 100;
  
  if (change > 10) return { trend: 'up', change: Math.round(change) };
  if (change < -10) return { trend: 'down', change: Math.round(Math.abs(change)) };
  return { trend: 'stable', change: Math.round(Math.abs(change)) };
};

export const calculateProductivityScore = (goals, stats) => {
  if (!goals || !stats) return 0;
  
  const todayHours = stats.today / 3600;
  const weekHours = stats.week / 3600;
  const billableHours = stats.billable / 3600;
  
  const dailyScore = Math.min((todayHours / goals.daily.workHours) * 40, 40);
  const weeklyScore = Math.min((billableHours / goals.weekly.billableHours) * 40, 40);
  
  let projectScore = 0;
  if (goals.projects && goals.projects.length > 0) {
    const avgProjectProgress = goals.projects.reduce((sum, project) => {
      return sum + Math.min((weekHours / project.weeklyTarget) * 100, 100);
    }, 0) / goals.projects.length;
    projectScore = (avgProjectProgress / 100) * 20;
  } else {
    projectScore = 20; // Full score if no projects defined
  }
  
  return Math.round(dailyScore + weeklyScore + projectScore);
};

export const getGoalInsights = (goals, stats) => {
  const insights = [];
  
  if (!goals || !stats) return insights;
  
  const todayHours = stats.today / 3600;
  const weekHours = stats.week / 3600;
  const billableHours = stats.billable / 3600;
  
  // Time distribution insights
  if (stats.week > 0) {
    const billablePercentage = (billableHours / (weekHours || 1)) * 100;
    if (billablePercentage > 80) {
      insights.push({
        type: 'positive',
        message: `Excellent billable time ratio: ${Math.round(billablePercentage)}%`
      });
    } else if (billablePercentage < 50) {
      insights.push({
        type: 'improvement',
        message: `Consider increasing billable work focus (currently ${Math.round(billablePercentage)}%)`
      });
    }
  }
  
  // Daily consistency insights
  const dailyAverage = weekHours / 7;
  if (todayHours > dailyAverage * 1.2) {
    insights.push({
      type: 'positive',
      message: 'Great productivity day - above weekly average!'
    });
  }
  
  return insights;
};

export const checkGoalAchievements = (goals, stats) => {
  const achievements = [];
  
  if (!goals || !stats) return achievements;
  
  const todayHours = stats.today / 3600;
  const billableHours = stats.billable / 3600;
  
  // Check daily achievement
  if (todayHours >= goals.daily.workHours) {
    achievements.push({
      type: 'daily',
      title: 'Daily Goal Achieved!',
      message: `Completed ${goals.daily.workHours} hours of work today`,
      icon: 'Sun',
      color: 'success'
    });
  }
  
  // Check weekly achievement
  if (billableHours >= goals.weekly.billableHours) {
    achievements.push({
      type: 'weekly',
      title: 'Weekly Goal Achieved!',
      message: `Reached ${goals.weekly.billableHours} billable hours this week`,
      icon: 'Calendar',
      color: 'primary'
    });
  }
  
  // Check project achievements
  if (goals.projects) {
    goals.projects.forEach(project => {
      const projectProgress = calculateGoalProgress(stats.week / 3600, project.weeklyTarget);
      if (projectProgress >= 100) {
        achievements.push({
          type: 'project',
          title: 'Project Goal Achieved!',
          message: `Completed weekly target for ${project.name}`,
          icon: 'Target',
          color: 'secondary'
        });
      }
    });
  }
  
  return achievements;
};
export const getGoalInsights = (timeEntries, goals) => {
  const insights = [];
  
  if (!goals || !timeEntries.length) return insights;
  
  const today = getTodayStart();
  const week = getWeekStart();
  
  const todayEntries = timeEntries.filter(entry => entry.startTime >= today);
  const weekEntries = timeEntries.filter(entry => entry.startTime >= week);
  
  const todayTime = todayEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
  const weekTime = weekEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 3600;
  
  // Daily insights
  if (goals.daily) {
    const dailyProgress = (todayTime / goals.daily.workHours) * 100;
    
    if (dailyProgress < 50) {
      insights.push({
        type: 'warning',
        category: 'daily',
        message: `You're ${Math.round(100 - dailyProgress)}% behind your daily goal. ${Math.round((goals.daily.workHours - todayTime) * 10) / 10}h remaining.`,
        action: 'Consider starting a focus session to catch up.'
      });
    } else if (dailyProgress >= 100) {
      insights.push({
        type: 'success',
        category: 'daily',
        message: 'Daily goal completed! Great work maintaining consistency.',
        action: 'Keep up the momentum tomorrow.'
      });
    } else {
      insights.push({
        type: 'info',
        category: 'daily',
        message: `${Math.round(dailyProgress)}% complete. You're on track!`,
        action: `${Math.round((goals.daily.workHours - todayTime) * 10) / 10}h more to reach your daily goal.`
      });
    }
  }
  
  // Weekly insights
  if (goals.weekly) {
    const weeklyProgress = (weekTime / goals.weekly.billableHours) * 100;
    const daysLeft = 7 - (new Date().getDay() || 7);
    const dailyNeed = daysLeft > 0 ? (goals.weekly.billableHours - weekTime) / daysLeft : 0;
    
    if (weeklyProgress < 60 && daysLeft <= 2) {
      insights.push({
        type: 'urgent',
        category: 'weekly',
        message: `Behind on weekly goal with ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left.`,
        action: `Need ${Math.round(dailyNeed * 10) / 10}h per day to catch up.`
      });
    }
}
  
  return insights;
};