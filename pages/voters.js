import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiUser,
  FiUserCheck,
  FiTrendingUp,
  FiEye,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";
import DashboardLayout from "../components/Layout/DashboardLayout";
import VoterCard from "../components/Voters/VoterCard";
import {
  getContract,
  contractFunctions,
  parseApprovalStatus,
} from "../utils/contract";
import { fetchFromIPFS } from "../utils/ipfs";
import toast from "react-hot-toast";

const Voters = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [votedFilter, setVotedFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (isConnected) {
      fetchVoters();
    }
  }, [isConnected]);

  useEffect(() => {
    filterVoters();
  }, [voters, searchTerm, statusFilter, votedFilter]);

  const fetchVoters = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      const registeredVoters = await contractFunctions.getAllRegisteredVoters(
        contract
      );

      // Fetch metadata for each voter
      const votersWithMetadata = await Promise.all(
        registeredVoters.map(async (voter) => {
          try {
            const metadata = await fetchFromIPFS(voter.ipfs);
            return {
              ...voter,
              metadata,
            };
          } catch (error) {
            console.error("Error fetching voter metadata:", error);
            return {
              ...voter,
              metadata: { description: "Unable to load metadata" },
            };
          }
        })
      );

      setVoters(votersWithMetadata);

      if (showRefreshToast) {
        toast.success("Voters data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching voters:", error);
      toast.error("Failed to load voters");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchVoters(true);
  };

  const filterVoters = () => {
    let filtered = voters;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (voter) =>
          voter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voter.voterAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (voter.metadata.nationality &&
            voter.metadata.nationality
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (voter) =>
          parseApprovalStatus(voter.status).toLowerCase() === statusFilter
      );
    }

    // Filter by voting status
    if (votedFilter !== "all") {
      filtered = filtered.filter((voter) =>
        votedFilter === "voted" ? voter.hasVoted : !voter.hasVoted
      );
    }

    setFilteredVoters(filtered);
  };

  const getStats = () => {
    const approved = voters.filter(
      (v) => parseApprovalStatus(v.status) === "Approved"
    );
    const voted = voters.filter((v) => v.hasVoted);
    const pending = voters.filter(
      (v) => parseApprovalStatus(v.status) === "Pending"
    );
    const rejected = voters.filter(
      (v) => parseApprovalStatus(v.status) === "Rejected"
    );

    return {
      total: voters.length,
      approved: approved.length,
      voted: voted.length,
      pending: pending.length,
      rejected: rejected.length,
      participationRate:
        approved.length > 0 ? (voted.length / approved.length) * 100 : 0,
    };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setVotedFilter("all");
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || votedFilter !== "all";

  const stats = getStats();

  const statsConfig = [
    {
      label: "Total Voters",
      value: stats.total,
      icon: FiUsers,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: FiCheckCircle,
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      iconBg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Has Voted",
      value: stats.voted,
      icon: MdHowToVote,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: FiClock,
      color: "amber",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Participation Rate",
      value: `${stats.participationRate.toFixed(1)}%`,
      icon: FiTrendingUp,
      color: "indigo",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      textColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Voters">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading voters...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Voters">
      <div className="flex flex-col max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  Registered Voters
                </h1>
                <p className="text-blue-700 dark:text-blue-300 mt-1">
                  Monitor and manage voter registrations and participation
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                <FiEye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {filteredVoters.length} showing
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors duration-200"
              >
                <FiRefreshCw
                  className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
                    <Icon className={`h-5 w-5 ${stat.textColor}`} />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                  {stat.value}
                </div>
                <div className={`text-sm ${stat.textColor} opacity-80`}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <FiFilter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Filter Voters
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Search and filter voters by various criteria
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  <FiXCircle className="mr-2 h-4 w-4" />
                  Clear Filters
                </button>
              )}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <FiGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === "list"
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  <FiList className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Voters
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, address, or nationality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FiXCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voting Status
              </label>
              <select
                value={votedFilter}
                onChange={(e) => setVotedFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="all">All Voters</option>
                <option value="voted">🗳️ Has Voted</option>
                <option value="not-voted">⭕ Not Voted</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <FiFilter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Active filters:
                  {searchTerm && ` Search: "${searchTerm}"`}
                  {statusFilter !== "all" && ` | Status: ${statusFilter}`}
                  {votedFilter !== "all" && ` | Voting: ${votedFilter}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Voters Display */}
        <div className="flex-1">
          {filteredVoters.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-6">
                <FiUsers className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {hasActiveFilters ? "No voters found" : "No voters registered"}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria to find more voters."
                  : "Voters will appear here once they register and get approved by administrators."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 mx-auto"
                >
                  <FiXCircle className="mr-2 h-4 w-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Showing {filteredVoters.length} of {voters.length} voters
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <FiUser className="h-4 w-4" />
                  <span>
                    {
                      filteredVoters.filter(
                        (v) => parseApprovalStatus(v.status) === "Approved"
                      ).length
                    }{" "}
                    approved
                  </span>
                  <span>•</span>
                  <MdHowToVote className="h-4 w-4" />
                  <span>
                    {filteredVoters.filter((v) => v.hasVoted).length} voted
                  </span>
                </div>
              </div>

              <div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6"
                //   className={`
                //   ${
                //     viewMode === "grid"
                //       ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6"
                //       : "space-y-4"
                //   }
                // `}
              >
                {filteredVoters.map((voter, index) => (
                  <div
                    key={voter.voterAddress}
                    className="transform transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <VoterCard voter={voter} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredVoters.length > 0 && (
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <FiTrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Participation Summary
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Overall voter engagement metrics
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.participationRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  of approved voters have participated
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Voters;
