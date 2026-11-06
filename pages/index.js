import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  FiShield,
  FiUsers,
  FiCheckCircle,
  FiTrendingUp,
  FiClock,
  FiGlobe,
  FiLock,
  FiArrowRight,
  FiPlay,
  FiAward,
  FiEye,
  FiUserCheck,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import { MdHowToVote } from "react-icons/md";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  getContract,
  contractFunctions,
  getVotingStatus,
  formatTimestamp,
} from "../utils/contract";

const LandingPage = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoters: 0,
    approvedVoters: 0,
    totalCandidates: 0,
    approvedCandidates: 0,
    totalVotes: 0,
    participationRate: 0,
    votingStatus: "Not Scheduled",
    timeRemaining: "Not set",
    startTime: "0",
    endTime: "0",
  });

  const [recentVoters, setRecentVoters] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Helper function to safely convert vote count
  const getVoteCount = (voteCount) => {
    if (!voteCount) return 0;
    if (typeof voteCount === "object" && voteCount._hex !== undefined) {
      return parseInt(voteCount._hex, 16);
    }
    return parseInt(voteCount) || 0;
  };

  useEffect(() => {
    fetchLandingPageData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchLandingPageData = async () => {
    try {
      setLoading(true);

      // Gracefully handle browsers without an injected Web3 wallet
      if (typeof window === "undefined" || !window.ethereum) {
        console.warn("No Web3 provider found. Showing empty stats.");
        setLoading(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      // Fetch all data in parallel
      const [
        startTime,
        endTime,
        registeredVoters,
        approvedVoters,
        registeredCandidates,
        approvedCandidates,
        votersWhoVoted,
      ] = await Promise.all([
        contractFunctions.getStartTime(contract),
        contractFunctions.getEndTime(contract),
        contractFunctions.getAllRegisteredVoters(contract),
        contractFunctions.getAllApprovedVoters(contract),
        contractFunctions.getAllRegisteredCandidates(contract),
        contractFunctions.getAllApprovedCandidates(contract),
        contractFunctions.getAllVotersWhoVoted(contract),
      ]);

      const votingStatus = getVotingStatus(
        startTime.toString(),
        endTime.toString()
      );
      const participationRate =
        approvedVoters.length > 0
          ? ((votersWhoVoted.length / approvedVoters.length) * 100).toFixed(1)
          : 0;

      // Process candidates and sort by vote count
      const candidatesWithVotes = [...approvedCandidates].sort(
        (a, b) => getVoteCount(b.voteCount) - getVoteCount(a.voteCount)
      );

      const topCandidatesData = candidatesWithVotes
        .slice(0, 4)
        .map((candidate, index) => {
          const voteCount = getVoteCount(candidate.voteCount);
          const percentage =
            votersWhoVoted.length > 0
              ? ((voteCount / votersWhoVoted.length) * 100).toFixed(1)
              : 0;

          return {
            id: index + 1,
            name: candidate.name || `Candidate ${index + 1}`,
            party: candidate.metadata?.party || "Independent",
            votes: voteCount,
            percentage: parseFloat(percentage),
          };
        });

      // Create recent voters list (using approved voters as base)
      const recentVotersData = approvedVoters
        .slice(-5)
        .reverse()
        .map((voter, index) => ({
          id: index + 1,
          name: voter.name || `Voter ${index + 1}`,
          time: `${Math.floor(Math.random() * 30) + 1} minutes ago`,
          verified: true,
        }));

      const timeRemaining = getTimeRemaining(
        votingStatus,
        startTime.toString(),
        endTime.toString()
      );

      setStats({
        totalVoters: registeredVoters.length,
        approvedVoters: approvedVoters.length,
        totalCandidates: registeredCandidates.length,
        approvedCandidates: approvedCandidates.length,
        totalVotes: votersWhoVoted.length,
        participationRate: parseFloat(participationRate),
        votingStatus,
        timeRemaining,
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });

      setTopCandidates(topCandidatesData);
      setRecentVoters(recentVotersData);
    } catch (error) {
      console.error("Error fetching landing page data:", error);
      // Keep default values on error
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (status, startTime, endTime) => {
    if (status === "Not Scheduled" || startTime === "0" || endTime === "0") {
      return "Not scheduled";
    }

    const now = Math.floor(Date.now() / 1000);
    const start = parseInt(startTime);
    const end = parseInt(endTime);

    if (status === "Upcoming") {
      const remaining = start - now;
      return formatTimeRemaining(remaining);
    } else if (status === "Active") {
      const remaining = end - now;
      return formatTimeRemaining(remaining);
    } else {
      return "Election ended";
    }
  };

  const formatTimeRemaining = (seconds) => {
    if (seconds <= 0) return "Time expired";

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);

    if (days > 0) return `${days} days ${hours} hours`;
    if (hours > 0) return `${hours} hours ${minutes} minutes`;
    return `${minutes} minutes`;
  };

  const features = [
    {
      icon: FiShield,
      title: "Blockchain Security",
      description:
        "Every vote is secured by cryptographic proof and stored immutably on the blockchain",
      color: "blue",
    },
    {
      icon: FiLock,
      title: "Anonymous Voting",
      description:
        "Your vote is private and anonymous while maintaining complete transparency",
      color: "green",
    },
    {
      icon: FiGlobe,
      title: "Global Accessibility",
      description:
        "Participate from anywhere in the world with just a web3 wallet",
      color: "purple",
    },
    {
      icon: FiEye,
      title: "Real-time Results",
      description: "Watch live vote counts and election progress in real-time",
      color: "amber",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "Ended":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "Upcoming":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <MdHowToVote className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  VotingDApp
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Decentralized Voting
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(
                  stats.votingStatus
                )}`}
              >
                <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                <span className="text-sm font-medium">
                  {stats.votingStatus}
                </span>
              </div>
              {!loading && (
                <button
                  onClick={fetchLandingPageData}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                  title="Refresh data"
                >
                  <FiRefreshCw className="h-4 w-4" />
                </button>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mx-auto mb-8">
              <MdHowToVote className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              The Future of
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Democratic Voting
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
              Experience transparent, secure, and decentralized voting powered
              by blockchain technology. Every vote counts, every voice matters,
              and every result is verifiable.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FiPlay className="mr-3 h-5 w-5" />
                {isConnected ? "Go to Dashboard" : "Start Voting Now"}
              </button>
              <button
                onClick={() => (window.location.href = "/results")}
                className="flex items-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <FiEye className="mr-3 h-5 w-5" />
                View Results
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Election Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FiActivity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {loading ? "Loading Election Data..." : "Live Election Data"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {loading
                    ? "Fetching real-time statistics"
                    : "Real-time voting statistics and participation"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl">
              <div
                className={`w-3 h-3 rounded-full ${
                  loading
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-green-500 animate-pulse"
                }`}
              ></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {loading ? "Updating..." : "Live Updates"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-xl mb-4"></div>
                  <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                      <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <FiTrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                    {stats.totalVoters.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Registered Voters
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <TfiCrown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <FiAward className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                    {stats.totalCandidates}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    Active Candidates
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                      <MdHowToVote className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <FiCheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                    {stats.totalVotes.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Votes Cast
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                      <FiTrendingUp className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <FiClock className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                    {stats.participationRate}%
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">
                    Participation Rate
                  </div>
                </div>
              </div>

              {/* Election Progress */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Election Progress
                  </h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {stats.votingStatus === "Active" &&
                      `Time Remaining: ${stats.timeRemaining}`}
                    {stats.votingStatus === "Upcoming" &&
                      `Starts in: ${stats.timeRemaining}`}
                    {stats.votingStatus === "Ended" && "Election has ended"}
                    {stats.votingStatus === "Not Scheduled" &&
                      "Election not yet scheduled"}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      stats.votingStatus === "Active"
                        ? "bg-gradient-to-r from-green-500 to-emerald-500"
                        : stats.votingStatus === "Ended"
                        ? "bg-gradient-to-r from-red-500 to-rose-500"
                        : "bg-gradient-to-r from-blue-500 to-purple-500"
                    }`}
                    style={{
                      width: `${Math.max(stats.participationRate, 5)}%`,
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <span>
                    {stats.startTime !== "0"
                      ? formatTimestamp(stats.startTime)
                      : "Not scheduled"}
                  </span>
                  <span>{stats.participationRate}% Participation</span>
                  <span>
                    {stats.endTime !== "0"
                      ? formatTimestamp(stats.endTime)
                      : "Not scheduled"}
                  </span>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Candidates */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TfiCrown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Leading Candidates
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {topCandidates.length > 0 ? (
                      topCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                        >
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-white ${
                              index === 0
                                ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                : index === 1
                                ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                : index === 2
                                ? "bg-gradient-to-r from-amber-600 to-yellow-600"
                                : "bg-gradient-to-r from-blue-500 to-purple-500"
                            }`}
                          >
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {candidate.name}
                              </h4>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                {candidate.percentage}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {candidate.party}
                              </span>
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {candidate.votes} votes
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <TfiCrown className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No candidates available yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Voters */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <FiUsers className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Recent Voters
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recentVoters.length > 0 ? (
                      recentVoters.map((voter) => (
                        <div
                          key={voter.id}
                          className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full">
                            <FiUserCheck className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {voter.name}
                              </span>
                              {voter.verified && (
                                <FiCheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {voter.time}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FiUsers className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No voters registered yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Decentralized Voting?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Built on blockchain technology to ensure transparency, security, and
            trust in every election
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: "from-blue-500 to-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100",
              green:
                "from-green-500 to-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100",
              purple:
                "from-purple-500 to-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-100",
              amber:
                "from-amber-500 to-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100",
            };

            return (
              <div
                key={index}
                className={`${colorClasses[feature.color]
                  .split(" ")
                  .slice(2)
                  .join(
                    " "
                  )} rounded-2xl p-6 border transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`inline-flex p-3 bg-gradient-to-r ${colorClasses[
                    feature.color
                  ]
                    .split(" ")
                    .slice(0, 2)
                    .join(" ")} rounded-xl mb-4`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join{" "}
            {stats.totalVoters > 0
              ? `${stats.totalVoters.toLocaleString()} voters`
              : "thousands of voters"}{" "}
            in shaping the future through secure, transparent, and decentralized
            elections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <FiArrowRight className="mr-3 h-5 w-5" />
              {isConnected ? "Go to Dashboard" : "Connect Wallet & Vote"}
            </button>
            <button
              onClick={() => (window.location.href = "/results")}
              className="flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-2xl hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              <FiEye className="mr-3 h-5 w-5" />
              Explore Elections
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <MdHowToVote className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold">VotingDApp</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering democracy through blockchain technology
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <FiLock className="h-4 w-4" />
              <span>Secured by Ethereum • Powered by Web3</span>
            </div>
            {!loading && stats.totalVotes > 0 && (
              <div className="mt-4 text-sm text-gray-400">
                {stats.totalVotes.toLocaleString()} votes cast •{" "}
                {stats.totalCandidates} candidates • {stats.participationRate}%
                participation
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
