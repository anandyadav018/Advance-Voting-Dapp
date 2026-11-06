import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  FiBarChart,
  FiTrendingUp,
  FiUsers,
  FiRefreshCw,
  FiDownload,
  FiCalendar,
  FiPercent,
  FiPieChart,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiShare,
  FiFileText,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import { MdHowToVote } from "react-icons/md";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  getContract,
  contractFunctions,
  getVotingStatus,
  formatTimestamp,
} from "../utils/contract";
import { fetchFromIPFS } from "../utils/ipfs";
import toast from "react-hot-toast";

const Results = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [results, setResults] = useState({
    candidates: [],
    totalVotes: 0,
    totalVoters: 0,
    participationRate: 0,
    winner: null,
    votingStatus: "Not Scheduled",
    votingTimes: { startTime: "0", endTime: "0" },
  });

  useEffect(() => {
    if (isConnected) {
      fetchResults();
    }
  }, [isConnected]);

  const fetchResults = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      // Fetch all necessary data
      const [
        approvedCandidates,
        approvedVoters,
        votersWhoVoted,
        startTime,
        endTime,
      ] = await Promise.all([
        contractFunctions.getAllApprovedCandidates(contract),
        contractFunctions.getAllApprovedVoters(contract),
        contractFunctions.getAllVotersWhoVoted(contract),
        contractFunctions.getStartTime(contract),
        contractFunctions.getEndTime(contract),
      ]);

      // Fetch candidate metadata
      const candidatesWithMetadata = await Promise.all(
        approvedCandidates.map(async (candidate) => {
          try {
            const metadata = await fetchFromIPFS(candidate.ipfs);
            return {
              ...candidate,
              metadata,
              voteCount: parseInt(candidate.voteCount.toString()),
            };
          } catch (error) {
            console.error("Error fetching candidate metadata:", error);
            return {
              ...candidate,
              metadata: { description: "Unable to load metadata" },
              voteCount: parseInt(candidate.voteCount.toString()),
            };
          }
        })
      );

      // Sort candidates by vote count
      const sortedCandidates = candidatesWithMetadata.sort(
        (a, b) => b.voteCount - a.voteCount
      );

      // Calculate results
      const totalVotes = votersWhoVoted.length;
      const totalVoters = approvedVoters.length;
      const participationRate =
        totalVoters > 0 ? (totalVotes / totalVoters) * 100 : 0;
      const winner =
        sortedCandidates.length > 0 && totalVotes > 0
          ? sortedCandidates[0]
          : null;
      const votingStatus = getVotingStatus(
        startTime.toString(),
        endTime.toString()
      );

      setResults({
        candidates: sortedCandidates,
        totalVotes,
        totalVoters,
        participationRate,
        winner,
        votingStatus,
        votingTimes: {
          startTime: startTime.toString(),
          endTime: endTime.toString(),
        },
      });

      if (showRefreshToast) {
        toast.success("Results refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchResults(true);
  };

  const exportResults = () => {
    const resultsData = {
      votingPeriod: {
        start: formatTimestamp(results.votingTimes.startTime),
        end: formatTimestamp(results.votingTimes.endTime),
        status: results.votingStatus,
      },
      statistics: {
        totalVotes: results.totalVotes,
        totalVoters: results.totalVoters,
        participationRate: `${results.participationRate.toFixed(2)}%`,
      },
      candidates: results.candidates.map((candidate, index) => ({
        rank: index + 1,
        name: candidate.name,
        party: candidate.metadata.party || "Independent",
        votes: candidate.voteCount,
        percentage:
          results.totalVotes > 0
            ? `${((candidate.voteCount / results.totalVotes) * 100).toFixed(
                2
              )}%`
            : "0%",
      })),
      winner: results.winner
        ? {
            name: results.winner.name,
            party: results.winner.metadata.party || "Independent",
            votes: results.winner.voteCount,
            percentage:
              results.totalVotes > 0
                ? `${(
                    (results.winner.voteCount / results.totalVotes) *
                    100
                  ).toFixed(2)}%`
                : "0%",
          }
        : null,
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(resultsData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `voting_results_${new Date().getTime()}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Results exported successfully!");
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Active":
        return {
          color: "green",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          textColor: "text-green-800 dark:text-green-200",
          icon: FiCheckCircle,
        };
      case "Ended":
        return {
          color: "blue",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          textColor: "text-blue-800 dark:text-blue-200",
          icon: FiCheckCircle,
        };
      default:
        return {
          color: "gray",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          textColor: "text-gray-800 dark:text-gray-200",
          icon: FiClock,
        };
    }
  };

  const statusConfig = getStatusConfig(results.votingStatus);

  const statsConfig = [
    {
      label: "Total Votes Cast",
      value: results.totalVotes,
      icon: MdHowToVote,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      description: "Total votes cast in this election",
    },
    {
      label: "Participation Rate",
      value: `${results.participationRate.toFixed(1)}%`,
      icon: FiTrendingUp,
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
      description: `${results.totalVotes} of ${results.totalVoters} eligible voters participated`,
    },
    {
      label: "Total Candidates",
      value: results.candidates.length,
      icon: TfiCrown,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
      description: "Approved candidates in this election",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Election Results">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading election results...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Election Results">
      <div className="flex flex-col max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FiBarChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  Election Results
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${statusConfig.bgColor}`}
                  >
                    <statusConfig.icon
                      className={`h-4 w-4 ${statusConfig.textColor}`}
                    />
                    <span
                      className={`text-sm font-medium ${statusConfig.textColor}`}
                    >
                      {results.votingStatus}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                    <FiCalendar className="h-4 w-4" />
                    <span className="text-sm">
                      {formatTimestamp(results.votingTimes.startTime)} -{" "}
                      {formatTimestamp(results.votingTimes.endTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                <FiEye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Live Results
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors duration-200"
              >
                <FiRefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={exportResults}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors duration-200"
              >
                <FiDownload className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsConfig.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`${stat.bgColor} rounded-2xl p-6 border border-gray-100 dark:border-gray-700 transform transition-all duration-300 hover:scale-105`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
                  {stat.value}
                </div>
                <div className={`text-sm font-medium ${stat.textColor} mb-1`}>
                  {stat.label}
                </div>
                <div className={`text-xs ${stat.textColor} opacity-75`}>
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Winner Announcement */}
        {results.winner && results.votingStatus === "Ended" && (
          <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-8 border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-start space-x-6">
              <div className="flex items-center justify-center w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex-shrink-0">
                <TfiCrown className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <FiAward className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                    Election Winner
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Winner
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {results.winner.name}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Party
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {results.winner.metadata.party || "Independent"}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Votes
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {results.winner.voteCount}
                    </p>
                  </div>
                  <div className="p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Percentage
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {results.totalVotes > 0
                        ? (
                            (results.winner.voteCount / results.totalVotes) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
                {results.winner.metadata.slogan && (
                  <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                    <p className="text-amber-800 dark:text-amber-200 italic text-lg">
                      "{results.winner.metadata.slogan}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <FiPieChart className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detailed Results
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete breakdown of votes by candidate
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <FiUsers className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {results.candidates.length} candidates
              </span>
            </div>
          </div>

          {results.candidates.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-6">
                <FiBarChart className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                No Results Available
              </h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Results will appear here once candidates are registered and
                voting begins. Check back after the voting period starts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Party
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Vote Share
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.candidates.map((candidate, index) => {
                    const percentage =
                      results.totalVotes > 0
                        ? (candidate.voteCount / results.totalVotes) * 100
                        : 0;
                    const isWinner = index === 0 && results.totalVotes > 0;
                    const isTop3 = index < 3 && results.totalVotes > 0;

                    return (
                      <tr
                        key={candidate.candidateAddress}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 ${
                          isWinner
                            ? "bg-amber-50 dark:bg-amber-900/20"
                            : isTop3
                            ? "bg-blue-50 dark:bg-blue-900/10"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {isWinner && (
                              <TfiCrown className="h-5 w-5 text-amber-500" />
                            )}
                            {index === 1 && (
                              <FiAward className="h-4 w-4 text-gray-400" />
                            )}
                            {index === 2 && (
                              <FiAward className="h-4 w-4 text-orange-400" />
                            )}
                            <span
                              className={`text-lg font-bold ${
                                isWinner
                                  ? "text-amber-700 dark:text-amber-300"
                                  : isTop3
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              #{index + 1}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`${
                              isWinner
                                ? "text-amber-900 dark:text-amber-100"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            <div className="text-sm font-semibold">
                              {candidate.name}
                            </div>
                            {candidate.metadata.slogan && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">
                                "{candidate.metadata.slogan}"
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                              isWinner
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                : isTop3
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {candidate.metadata.party || "Independent"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-lg font-bold ${
                              isWinner
                                ? "text-amber-700 dark:text-amber-300"
                                : isTop3
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {candidate.voteCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className={`text-lg font-semibold ${
                              isWinner
                                ? "text-amber-700 dark:text-amber-300"
                                : isTop3
                                ? "text-blue-700 dark:text-blue-300"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {percentage.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-32">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                                  isWinner
                                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                    : isTop3
                                    ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                    : "bg-gradient-to-r from-gray-400 to-gray-500"
                                }`}
                                style={{
                                  width: `${Math.max(percentage, 2)}%`,
                                  animationDelay: `${index * 200}ms`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Election Summary Footer */}
        {results.candidates.length > 0 && (
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <FiFileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Election Summary
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {results.votingStatus === "Ended"
                      ? "Final results"
                      : "Live results"}{" "}
                    • Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <FiFileText className="mr-2 h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Election Results",
                        text: `${
                          results.winner
                            ? results.winner.name +
                              " wins with " +
                              results.winner.voteCount +
                              " votes!"
                            : "Election results"
                        }`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                >
                  <FiShare className="mr-2 h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Results;
