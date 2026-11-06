import React from "react";
import {
  FiPieChart,
  FiTrendingUp,
  FiAward,
  FiBarChart,
  FiUsers,
  FiStar,
  FiTarget,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";
import { TfiCrown } from "react-icons/tfi";

const VotingChart = ({ candidates = [] }) => {
  // Helper function to safely convert vote count to number
  const getVoteCount = (voteCount) => {
    if (!voteCount) return 0;
    // Handle BigNumber objects from ethers.js
    if (typeof voteCount === "object" && voteCount._hex !== undefined) {
      return parseInt(voteCount._hex, 16);
    }
    // Handle regular numbers and strings
    return parseInt(voteCount) || 0;
  };

  const totalVotes = candidates.reduce(
    (sum, candidate) => sum + getVoteCount(candidate.voteCount),
    0
  );

  // Enhanced color palette with gradients
  const colorConfig = [
    {
      bg: "bg-gradient-to-r from-blue-500 to-blue-600",
      solid: "bg-blue-500",
      text: "text-blue-600 dark:text-blue-400",
      light: "bg-blue-100 dark:bg-blue-950/30",
      ring: "ring-blue-200 dark:ring-blue-800",
    },
    {
      bg: "bg-gradient-to-r from-green-500 to-emerald-600",
      solid: "bg-green-500",
      text: "text-green-600 dark:text-green-400",
      light: "bg-green-100 dark:bg-green-950/30",
      ring: "ring-green-200 dark:ring-green-800",
    },
    {
      bg: "bg-gradient-to-r from-purple-500 to-indigo-600",
      solid: "bg-purple-500",
      text: "text-purple-600 dark:text-purple-400",
      light: "bg-purple-100 dark:bg-purple-950/30",
      ring: "ring-purple-200 dark:ring-purple-800",
    },
    {
      bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
      solid: "bg-yellow-500",
      text: "text-yellow-600 dark:text-yellow-400",
      light: "bg-yellow-100 dark:bg-yellow-950/30",
      ring: "ring-yellow-200 dark:ring-yellow-800",
    },
    {
      bg: "bg-gradient-to-r from-red-500 to-rose-600",
      solid: "bg-red-500",
      text: "text-red-600 dark:text-red-400",
      light: "bg-red-100 dark:bg-red-950/30",
      ring: "ring-red-200 dark:ring-red-800",
    },
    {
      bg: "bg-gradient-to-r from-indigo-500 to-purple-600",
      solid: "bg-indigo-500",
      text: "text-indigo-600 dark:text-indigo-400",
      light: "bg-indigo-100 dark:bg-indigo-950/30",
      ring: "ring-indigo-200 dark:ring-indigo-800",
    },
    {
      bg: "bg-gradient-to-r from-pink-500 to-rose-600",
      solid: "bg-pink-500",
      text: "text-pink-600 dark:text-pink-400",
      light: "bg-pink-100 dark:bg-pink-950/30",
      ring: "ring-pink-200 dark:ring-pink-800",
    },
    {
      bg: "bg-gradient-to-r from-orange-500 to-red-600",
      solid: "bg-orange-500",
      text: "text-orange-600 dark:text-orange-400",
      light: "bg-orange-100 dark:bg-orange-950/30",
      ring: "ring-orange-200 dark:ring-orange-800",
    },
  ];

  const getPercentage = (votes) => {
    if (totalVotes === 0) return 0;
    const voteCount = getVoteCount(votes);
    return ((voteCount / totalVotes) * 100).toFixed(1);
  };

  const getRankPosition = (index) => {
    if (index === 0)
      return { icon: FaTrophy, label: "1st", color: "text-yellow-600" };
    if (index === 1)
      return { icon: FiAward, label: "2nd", color: "text-gray-600" };
    if (index === 2)
      return { icon: FiStar, label: "3rd", color: "text-amber-600" };
    return { icon: FiTarget, label: `${index + 1}th`, color: "text-gray-500" };
  };

  const sortedCandidates = [...candidates].sort(
    (a, b) => getVoteCount(b.voteCount) - getVoteCount(a.voteCount)
  );

  const leadingCandidate = sortedCandidates[0];

  if (candidates.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
            <FiBarChart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vote Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time voting results and candidate standings
            </p>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full opacity-10"></div>
            </div>
            <div className="relative">
              <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl inline-block shadow-lg mb-4">
                <FiUsers className="h-8 w-8 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Candidates Available
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Candidate voting data will appear here once they are registered
                and approved for the election.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (totalVotes === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
            <FiBarChart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vote Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Waiting for votes to be cast
            </p>
          </div>
        </div>

        {/* Candidates Preview */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="text-center mb-6">
            <FiPieChart className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Ready for Voting
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}{" "}
              registered and ready
            </p>
          </div>

          <div className="space-y-3">
            {candidates.slice(0, 3).map((candidate, index) => (
              <div
                key={candidate.candidateAddress}
                className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl"
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    colorConfig[index % colorConfig.length].solid
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {candidate.name || `Candidate ${index + 1}`}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  Ready
                </span>
              </div>
            ))}
            {candidates.length > 3 && (
              <div className="text-center text-sm text-blue-600 dark:text-blue-400">
                +{candidates.length - 3} more candidate
                {candidates.length - 3 !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
            <FiBarChart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Vote Distribution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Live voting results and rankings
            </p>
          </div>
        </div>

        {/* Total Votes Badge */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-950/30 dark:to-indigo-950/30 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              {totalVotes} Total Votes
            </span>
          </div>
        </div>
      </div>

      {/* Leading Candidate Highlight */}
      {leadingCandidate && getVoteCount(leadingCandidate.voteCount) > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/40 dark:via-orange-950/40 dark:to-amber-950/40 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg ring-2 ring-yellow-100 dark:ring-yellow-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
                <TfiCrown className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <FaTrophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Currently Leading
                  </span>
                </div>
                <h4 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">
                  {leadingCandidate.name || "Unknown Candidate"}
                </h4>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {getVoteCount(leadingCandidate.voteCount)}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                votes ({getPercentage(leadingCandidate.voteCount)}%)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Candidates Rankings */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <FiBarChart className="h-4 w-4" />
          <span>Candidate Rankings</span>
        </h4>

        {sortedCandidates.map((candidate, index) => {
          const colorScheme = colorConfig[index % colorConfig.length];
          const rank = getRankPosition(index);
          const percentage = getPercentage(candidate.voteCount);
          const voteCount = getVoteCount(candidate.voteCount);
          const isLeading = index === 0;

          return (
            <div
              key={candidate.candidateAddress}
              className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                isLeading
                  ? "ring-2 ring-yellow-200 dark:ring-yellow-800 border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30"
                  : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-xl ${
                        isLeading
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                          : `${colorScheme.light} ${colorScheme.text}`
                      }`}
                    >
                      <rank.icon className="h-4 w-4" />
                    </div>

                    {/* Color Indicator */}
                    <div
                      className={`w-4 h-4 rounded-full ${colorScheme.solid} shadow-md`}
                    ></div>

                    {/* Candidate Info */}
                    <div>
                      <h5
                        className={`font-semibold ${
                          isLeading
                            ? "text-yellow-900 dark:text-yellow-100"
                            : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {candidate.name || `Candidate ${index + 1}`}
                      </h5>
                      <span
                        className={`text-xs font-medium ${
                          isLeading
                            ? "text-yellow-700 dark:text-yellow-300"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {rank.label} Place
                      </span>
                    </div>
                  </div>

                  {/* Vote Count */}
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold ${
                        isLeading
                          ? "text-yellow-600 dark:text-yellow-400"
                          : colorScheme.text
                      }`}
                    >
                      {voteCount}
                    </div>
                    <div
                      className={`text-sm ${
                        isLeading
                          ? "text-yellow-700 dark:text-yellow-300"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {percentage}% of votes
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                        isLeading
                          ? "bg-gradient-to-r from-yellow-400 to-orange-400"
                          : colorScheme.bg
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  {/* Percentage Label on Bar */}
                  {percentage > 15 && (
                    <div className="absolute inset-y-0 left-2 flex items-center">
                      <span className="text-xs font-bold text-white">
                        {percentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Leading Indicator */}
                {isLeading && (
                  <div className="mt-3 flex items-center justify-center">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1 rounded-full">
                      <FiAward className="h-3 w-3 text-white" />
                      <span className="text-xs font-bold text-white">
                        Leading
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center space-x-2">
          <FiPieChart className="h-4 w-4" />
          <span>Election Statistics</span>
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {candidates.length}
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
              Total Votes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {leadingCandidate
                ? getPercentage(leadingCandidate.voteCount)
                : "0"}
              %
            </div>
            <div className="text-xs text-purple-800 dark:text-purple-200">
              Leading Share
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingChart;
