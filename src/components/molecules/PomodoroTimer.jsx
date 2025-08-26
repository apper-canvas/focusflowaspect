import React, { useState, useEffect } from "react";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import TimerDisplay from "@/components/molecules/TimerDisplay";
import ApperIcon from "@/components/ApperIcon";
import { toast } from "react-toastify";

const PomodoroTimer = ({ workDuration = 25 * 60, breakDuration = 5 * 60 }) => {
  const [timeLeft, setTimeLeft] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      
      if (!isBreak) {
        setCycles(prev => prev + 1);
        setTimeLeft(breakDuration);
        setIsBreak(true);
        toast.success("Work session complete! Time for a break.");
      } else {
        setTimeLeft(workDuration);
        setIsBreak(false);
        toast.info("Break's over! Ready for another work session?");
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workDuration, breakDuration]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? breakDuration : workDuration);
  };

  const handleSkip = () => {
    setTimeLeft(0);
  };

  return (
    <Card className="p-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <ApperIcon name="Timer" size={24} className="text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Pomodoro Timer
          </h3>
        </div>

        <div className="space-y-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
            isBreak ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
          }`}>
            {isBreak ? "Break Time" : "Focus Time"}
          </div>
          
          <TimerDisplay 
            duration={timeLeft} 
            isRunning={isRunning} 
            size="lg"
            className="my-4"
          />
        </div>

        <div className="flex justify-center space-x-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="sm">
              <ApperIcon name="Play" size={16} className="mr-1" />
              Start
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary" size="sm">
              <ApperIcon name="Pause" size={16} className="mr-1" />
              Pause
            </Button>
          )}
          
          <Button onClick={handleReset} variant="ghost" size="sm">
            <ApperIcon name="RotateCcw" size={16} className="mr-1" />
            Reset
          </Button>
          
          <Button onClick={handleSkip} variant="ghost" size="sm">
            <ApperIcon name="SkipForward" size={16} className="mr-1" />
            Skip
          </Button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Completed Cycles: <span className="font-semibold text-primary">{cycles}</span>
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PomodoroTimer;