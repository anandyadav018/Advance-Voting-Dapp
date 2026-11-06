import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiTrendingUp,
  FiActivity,
  FiClipboard,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import DashboardLayout from "../components/Layout/DashboardLayout";
import StatsCard from "../components/UI/StatsCard";
import VotingTimeline from "../components/Dashboard/VotingTimeline";
import RecentActivity from "../components/Dashboard/RecentActivity";
import VotingChart from "../components/Dashboard/VotingChart";
import {
  getContract,
  contractFunctions,
  getVotingStatus,
} from "../utils/contract";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVoters: 0,
    approvedVoters: 0,
    totalCandidates: 0,
    approvedCandidates: 0,
    totalVotes: 0,
    votingStatus: "Not Scheduled",
  });
  const [votingTimes, setVotingTimes] = useState({
    startTime: "0",
    endTime: "0",
  });
  const [isOwner, setIsOwner] = useState(false);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (isConnected) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      // Fetch all data in parallel
      const [
        owner,
        startTime,
        endTime,
        registeredVoters,
        approvedVoters,
        registeredCandidates,
        approvedCandidates,
        votersWhoVoted,
      ] = await Promise.all([
        contractFunctions.getOwner(contract),
        contractFunctions.getStartTime(contract),
        contractFunctions.getEndTime(contract),
        contractFunctions.getAllRegisteredVoters(contract),
        contractFunctions.getAllApprovedVoters(contract),
        contractFunctions.getAllRegisteredCandidates(contract),
        contractFunctions.getAllApprovedCandidates(contract),
        contractFunctions.getAllVotersWhoVoted(contract),
      ]);

      // Update stats
      setStats({
        totalVoters: registeredVoters.length,
        approvedVoters: approvedVoters.length,
        totalCandidates: registeredCandidates.length,
        approvedCandidates: approvedCandidates.length,
        totalVotes: votersWhoVoted.length,
        votingStatus: getVotingStatus(startTime.toString(), endTime.toString()),
      });

      setVotingTimes({
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });

      setIsOwner(owner.toLowerCase() === address.toLowerCase());
      setCandidates(approvedCandidates);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "emerald";
      case "Ended":
        return "red";
      case "Scheduled":
        return "amber";
      default:
        return "slate";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":
        return FiCheckCircle;
      case "Ended":
        return FiAlertCircle;
      default:
        return FiClock;
    }
  };

  const statsCards = [
    {
      title: "Total Voters",
      value: stats.totalVoters,
      icon: FiUsers,
      color: "blue",
      subtitle: `${stats.approvedVoters} approved`,
      trend: stats.approvedVoters > 0 ? "up" : "neutral",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      icon: FiUserCheck,
      color: "emerald",
      subtitle: `${stats.approvedCandidates} approved`,
      trend: stats.approvedCandidates > 0 ? "up" : "neutral",
    },
    {
      title: "Total Votes",
      value: stats.totalVotes,
      icon: MdHowToVote,
      color: "purple",
      subtitle: "Votes cast",
      trend: stats.totalVotes > 0 ? "up" : "neutral",
    },
    {
      title: "Voting Status",
      value: stats.votingStatus,
      icon: getStatusIcon(stats.votingStatus),
      color: getStatusColor(stats.votingStatus),
      subtitle: "Current status",
      trend: "neutral",
    },
  ];

  if (!isConnected) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center mb-6">
                <FiClipboard className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Connect your wallet to access the voting platform and
                participate in the democratic process.
              </p>
            </div>
            <div className="space-y-4">
              <ConnectButton />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powered by Web3 • Secure • Transparent
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading dashboard...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-blue-100 dark:border-blue-800/30 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to VotingDApp
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {isOwner ? "Admin Dashboard" : "Voter Dashboard"} - Monitor
                voting activity and participate in elections
              </p>
            </div>
            <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="transform transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatsCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                subtitle={stat.subtitle}
                trend={stat.trend}
              />
            </div>
          ))}
        </div>

        {/* Charts and Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Voting Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl mr-3">
                <FiTrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Vote Distribution
              </h3>
            </div>
            <VotingChart candidates={candidates} />
          </div>

          {/* Voting Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl mr-3">
                <FiClock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Voting Timeline
              </h3>
            </div>
            <VotingTimeline
              startTime={votingTimes.startTime}
              endTime={votingTimes.endTime}
              status={stats.votingStatus}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl mr-3">
              <FiActivity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <RecentActivity
            totalVotes={stats.totalVotes}
            approvedVoters={stats.approvedVoters}
            approvedCandidates={stats.approvedCandidates}
            votingStatus={stats.votingStatus}
          />
        </div>

        {/* Quick Actions */}
        {isOwner && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Quick Admin Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Manage Voters", href: "/admin" },
                { label: "Manage Candidates", href: "/admin" },
                { label: "Set Voting Period", href: "/admin" },
                { label: "View Results", href: "/results" },
              ].map((action, index) => (
                <button
                  key={action.label}
                  onClick={() => (window.location.href = action.href)}
                  className="group relative overflow-hidden bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center transition-all duration-300 hover:shadow-md hover:scale-105"
                >
                  <span className="relative z-10 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors duration-300">
                    {action.label}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
