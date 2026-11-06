import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiPlay,
  FiStopCircle,
  FiCalendar,
  FiSun,
  FiMoon,
  FiActivity,
  FiCheckCircle,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { TfiTimer } from "react-icons/tfi";

import { formatTimestamp } from "../../utils/contract";

const VotingTimeline = ({ startTime, endTime, status }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [timeProgress, setTimeProgress] = useState(0);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate progress percentage
  useEffect(() => {
    if (status === "Active" && startTime && endTime) {
      const start = parseInt(startTime) * 1000;
      const end = parseInt(endTime) * 1000;
      const now = currentTime;

      if (now >= start && now <= end) {
        const progress = ((now - start) / (end - start)) * 100;
        setTimeProgress(Math.min(Math.max(progress, 0), 100));
      }
    } else if (status === "Ended") {
      setTimeProgress(100);
    } else {
      setTimeProgress(0);
    }
  }, [status, startTime, endTime, currentTime]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Active":
        return {
          icon: FiPlay,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
          gradient: "from-green-500 to-emerald-500",
          pulse: true,
        };
      case "Ended":
        return {
          icon: FiStopCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
          gradient: "from-red-500 to-rose-500",
          pulse: false,
        };
      case "Upcoming":
        return {
          icon: TfiTimer,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
          gradient: "from-amber-500 to-orange-500",
          pulse: false,
        };
      default:
        return {
          icon: FiClock,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-950/30",
          borderColor: "border-gray-200 dark:border-gray-800",
          badge:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
          gradient: "from-gray-500 to-slate-500",
          pulse: false,
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getTimeRemaining = () => {
    if (status === "Active" && endTime) {
      const end = parseInt(endTime) * 1000;
      const now = currentTime;
      const remaining = end - now;

      if (remaining > 0) {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
      }
    } else if (status === "Upcoming" && startTime) {
      const start = parseInt(startTime) * 1000;
      const now = currentTime;
      const remaining = start - now;

      if (remaining > 0) {
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );

        if (days > 0) return `Starts in ${days}d ${hours}h`;
        if (hours > 0) return `Starts in ${hours}h`;
        return `Starting soon`;
      }
    }
    return null;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div
          className={`p-2 bg-gradient-to-r ${statusConfig.gradient} rounded-xl`}
        >
          <FiActivity className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Voting Timeline
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Election schedule and current status
          </p>
        </div>
      </div>

      {/* Current Status Card */}
      <div
        className={`rounded-2xl p-6 border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-2xl ${statusConfig.bgColor} ${
                statusConfig.pulse ? "animate-pulse" : ""
              }`}
            >
              <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
            </div>
            <div>
              <h4 className={`text-xl font-bold ${statusConfig.color}`}>
                {status === "Not Scheduled" ? "Not Scheduled" : status}
              </h4>
              {timeRemaining && (
                <p className={`text-sm ${statusConfig.color} opacity-80`}>
                  {timeRemaining}
                </p>
              )}
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.badge}`}
          >
            {status === "Active" ? "Live" : status}
          </span>
        </div>

        {/* Progress Bar for Active Voting */}
        {status === "Active" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className={statusConfig.color}>Election Progress</span>
              <span className={statusConfig.color}>
                {timeProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${statusConfig.gradient} transition-all duration-1000 ease-out`}
                style={{ width: `${timeProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
          <FiCalendar className="h-4 w-4" />
          <span>Election Schedule</span>
        </h4>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
          <div
            className={`absolute left-6 top-8 w-0.5 bg-gradient-to-b ${statusConfig.gradient} transition-all duration-1000`}
            style={{
              height:
                status === "Ended"
                  ? "100%"
                  : status === "Active"
                  ? "50%"
                  : status === "Upcoming"
                  ? "0%"
                  : "0%",
            }}
          ></div>

          <div className="space-y-8">
            {/* Start Time */}
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    status === "Not Scheduled"
                      ? "bg-gray-300 border-gray-300"
                      : "bg-green-500 border-green-500"
                  } shadow-lg`}
                ></div>
                {(status === "Active" || status === "Ended") && (
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-green-500 animate-ping opacity-25"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiSun className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h5 className="font-semibold text-blue-900 dark:text-blue-100">
                      Voting Opens
                    </h5>
                  </div>
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {formatTimestamp(startTime)}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Eligible voters can begin casting their ballots
                  </p>
                </div>
              </div>
            </div>

            {/* End Time */}
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    status === "Ended"
                      ? "bg-red-500 border-red-500"
                      : status === "Active"
                      ? "bg-amber-500 border-amber-500 animate-pulse"
                      : "bg-gray-300 border-gray-300"
                  } shadow-lg`}
                ></div>
                {status === "Active" && (
                  <div className="absolute inset-0 w-4 h-4 rounded-full bg-amber-500 animate-ping opacity-25"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl p-4 border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiMoon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h5 className="font-semibold text-red-900 dark:text-red-100">
                      Voting Closes
                    </h5>
                  </div>
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    {formatTimestamp(endTime)}
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Final opportunity to cast votes before results
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Duration Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2 mb-2">
            <TfiTimer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h5 className="font-semibold text-purple-900 dark:text-purple-100">
              Duration
            </h5>
          </div>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {startTime && endTime && startTime !== "0" && endTime !== "0"
              ? (() => {
                  const duration =
                    (parseInt(endTime) - parseInt(startTime)) * 1000;
                  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
                  const hours = Math.floor(
                    (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  return `${days} days, ${hours} hours`;
                })()
              : "Not set"}
          </p>
        </div>

        {/* Next Action Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2 mb-2">
            <FiTarget className="h-4 w-4 text-green-600 dark:text-green-400" />
            <h5 className="font-semibold text-green-900 dark:text-green-100">
              Next Action
            </h5>
          </div>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {status === "Upcoming"
              ? "Wait for start"
              : status === "Active"
              ? "Voting in progress"
              : status === "Ended"
              ? "View results"
              : "Schedule election"}
          </p>
        </div>
      </div>

      {/* Real-time Updates Indicator */}
      {status === "Active" && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-25"></div>
            </div>
            <div>
              <h5 className="font-medium text-green-900 dark:text-green-100">
                Live Election
              </h5>
              <p className="text-sm text-green-700 dark:text-green-300">
                Timeline updates automatically every minute
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VotingTimeline;
