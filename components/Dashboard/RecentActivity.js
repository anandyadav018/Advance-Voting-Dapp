import React from "react";
import {
  FiUsers,
  FiUserCheck,
  FiActivity,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiBarChart,
  FiPlay,
  FiPause,
  FiStopCircle,
} from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";

const RecentActivity = ({
  totalVotes,
  approvedVoters,
  approvedCandidates,
  votingStatus,
}) => {
  const getVotingStatusConfig = (status) => {
    switch (status) {
      case "Active":
        return {
          icon: FiPlay,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-950/30",
          message: "Voting is currently active",
          gradient: "from-green-500 to-emerald-500",
        };
      case "Ended":
        return {
          icon: FiStopCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-950/30",
          message: "Voting has ended",
          gradient: "from-red-500 to-rose-500",
        };
      case "Upcoming":
        return {
          icon: FiClock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-950/30",
          message: "Voting period is upcoming",
          gradient: "from-amber-500 to-orange-500",
        };
      default:
        return {
          icon: FiPause,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-100 dark:bg-gray-950/30",
          message: "Voting status not set",
          gradient: "from-gray-500 to-slate-500",
        };
    }
  };

  const statusConfig = getVotingStatusConfig(votingStatus);

  const activities = [
    {
      id: 1,
      type: "voter_approved",
      title: "Approved Voters",
      message: `${approvedVoters} ${
        approvedVoters === 1 ? "voter has" : "voters have"
      } been approved for the election`,
      icon: FiUsers,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      gradient: "from-blue-500 to-indigo-500",
      time: "Voter Registration",
      count: approvedVoters,
      isActive: approvedVoters > 0,
    },
    {
      id: 2,
      type: "candidate_approved",
      title: "Approved Candidates",
      message: `${approvedCandidates} ${
        approvedCandidates === 1 ? "candidate has" : "candidates have"
      } been approved to participate`,
      icon: FiUserCheck,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800",
      gradient: "from-green-500 to-emerald-500",
      time: "Candidate Registration",
      count: approvedCandidates,
      isActive: approvedCandidates > 0,
    },
    {
      id: 3,
      type: "votes_cast",
      title: "Votes Cast",
      message: `${totalVotes} ${
        totalVotes === 1 ? "vote has" : "votes have"
      } been cast in this election`,
      icon: MdHowToVote,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      gradient: "from-purple-500 to-indigo-500",
      time: "Voting Activity",
      count: totalVotes,
      isActive: totalVotes > 0,
    },
    {
      id: 4,
      type: "voting_status",
      title: "Election Status",
      message: statusConfig.message,
      icon: statusConfig.icon,
      color: statusConfig.color,
      bgColor: statusConfig.bgColor,
      borderColor: `border-${
        statusConfig.color.split("-")[1]
      }-200 dark:border-${statusConfig.color.split("-")[1]}-800`,
      gradient: statusConfig.gradient,
      time: "Current Status",
      count: null,
      isActive: true,
      priority: votingStatus === "Active",
    },
  ];

  const hasActivity = activities.some((activity) => activity.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
          <FiBarChart className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Activity
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Real-time election statistics and status updates
          </p>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              activity.priority
                ? "ring-2 ring-green-200 dark:ring-green-800 shadow-md"
                : "hover:shadow-md"
            } ${
              activity.isActive
                ? `${activity.bgColor} ${activity.borderColor} hover:-translate-y-1`
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75"
            }`}
          >
            {/* Gradient Background for Priority Items */}
            {activity.priority && (
              <div
                className={`absolute inset-0 bg-gradient-to-r ${activity.gradient} opacity-5`}
              ></div>
            )}

            <div className="relative p-6">
              <div className="flex items-start space-x-4">
                {/* Icon */}
                <div className={`flex-shrink-0 relative`}>
                  <div
                    className={`p-3 rounded-2xl ${activity.bgColor} ${
                      activity.priority
                        ? "ring-2 ring-white dark:ring-gray-800 shadow-lg"
                        : ""
                    }`}
                  >
                    <activity.icon className={`h-6 w-6 ${activity.color}`} />
                  </div>
                  {activity.priority && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4
                      className={`font-semibold ${
                        activity.isActive
                          ? "text-gray-900 dark:text-white"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {activity.title}
                    </h4>
                    {activity.count !== null && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-bold ${
                          activity.isActive
                            ? `bg-white dark:bg-gray-800 ${activity.color}`
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {activity.count}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm leading-relaxed mb-3 ${
                      activity.isActive
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {activity.message}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-lg ${
                        activity.isActive
                          ? `${activity.bgColor} ${activity.color}`
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {activity.time}
                    </span>

                    {activity.isActive &&
                      activity.count !== null &&
                      activity.count > 0 && (
                        <div className="flex items-center space-x-1">
                          <FiTrendingUp
                            className={`h-3 w-3 ${activity.color}`}
                          />
                          <span
                            className={`text-xs font-medium ${activity.color}`}
                          >
                            Active
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!hasActivity && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-10"></div>
            </div>
            <div className="relative">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl inline-block shadow-lg mb-4">
                <FiActivity className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Activity Yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                System activity will appear here as voters register, candidates
                are approved, and votes are cast.
              </p>
              <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400 dark:text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiUsers className="h-4 w-4" />
                  <span>Voters</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiUserCheck className="h-4 w-4" />
                  <span>Candidates</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MdHowToVote className="h-4 w-4" />
                  <span>Votes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      {hasActivity && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2 mb-4">
            <FiCheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Election Summary
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {approvedVoters}
              </div>
              <div className="text-xs text-purple-800 dark:text-purple-200">
                Approved Voters
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {approvedCandidates}
              </div>
              <div className="text-xs text-purple-800 dark:text-purple-200">
                Candidates
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {totalVotes}
              </div>
              <div className="text-xs text-purple-800 dark:text-purple-200">
                Votes Cast
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
