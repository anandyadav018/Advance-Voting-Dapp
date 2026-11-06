import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import {
  FiUserCheck,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiTrendingUp,
  FiUsers,
  FiAward,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiGrid,
  FiList,
  FiEye,
  FiStar,
  FiTarget,
  FiFlag,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import { MdHowToVote } from "react-icons/md";
import DashboardLayout from "../components/Layout/DashboardLayout";
import CandidateDisplayCard from "../components/Candidates/CandidateDisplayCard";
import {
  getContract,
  contractFunctions,
  parseApprovalStatus,
} from "../utils/contract";
import { fetchFromIPFS } from "../utils/ipfs";
import toast from "react-hot-toast";

const Candidates = () => {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("votes");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    if (isConnected) {
      fetchCandidates();
    }
  }, [isConnected]);

  useEffect(() => {
    filterAndSortCandidates();
  }, [candidates, searchTerm, statusFilter, sortBy]);

  const fetchCandidates = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      const registeredCandidates =
        await contractFunctions.getAllRegisteredCandidates(contract);

      // Fetch metadata for each candidate
      const candidatesWithMetadata = await Promise.all(
        registeredCandidates.map(async (candidate) => {
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

      setCandidates(candidatesWithMetadata);

      if (showRefreshToast) {
        toast.success("Candidates data refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchCandidates(true);
  };

  const filterAndSortCandidates = () => {
    let filtered = candidates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.candidateAddress
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (candidate.metadata.party &&
            candidate.metadata.party
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (candidate.metadata.slogan &&
            candidate.metadata.slogan
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (candidate) =>
          parseApprovalStatus(candidate.status).toLowerCase() === statusFilter
      );
    }

    // Sort candidates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "votes":
          return b.voteCount - a.voteCount;
        case "name":
          return a.name.localeCompare(b.name);
        case "party":
          const partyA = a.metadata.party || "Independent";
          const partyB = b.metadata.party || "Independent";
          return partyA.localeCompare(partyB);
        case "id":
          return (
            parseInt(a.registerId.toString()) -
            parseInt(b.registerId.toString())
          );
        default:
          return 0;
      }
    });

    setFilteredCandidates(filtered);
  };

  const getStats = () => {
    const approved = candidates.filter(
      (c) => parseApprovalStatus(c.status) === "Approved"
    );
    const pending = candidates.filter(
      (c) => parseApprovalStatus(c.status) === "Pending"
    );
    const rejected = candidates.filter(
      (c) => parseApprovalStatus(c.status) === "Rejected"
    );
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
    const leadingCandidate =
      approved.length > 0
        ? approved.reduce((prev, current) =>
            prev.voteCount > current.voteCount ? prev : current
          )
        : null;

    return {
      total: candidates.length,
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      totalVotes,
      leadingCandidate,
    };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("votes");
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || sortBy !== "votes";

  const stats = getStats();

  const statsConfig = [
    {
      label: "Total Candidates",
      value: stats.total,
      icon: TfiCrown,
      color: "purple",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      textColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
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
      label: "Pending",
      value: stats.pending,
      icon: FiClock,
      color: "amber",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Total Votes",
      value: stats.totalVotes,
      icon: MdHowToVote,
      color: "blue",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Candidates">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading candidates...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Candidates">
      <div className="flex flex-col max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <TfiCrown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  Election Candidates
                </h1>
                <p className="text-purple-700 dark:text-purple-300 mt-1">
                  Browse and analyze candidate information and performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                <FiEye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  {filteredCandidates.length} showing
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-medium rounded-xl transition-colors duration-200"
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
        <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Leading Candidate Highlight */}
        {stats.leadingCandidate && stats.totalVotes > 0 && (
          <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex-shrink-0">
                <FiAward className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <FiStar className="h-5 w-5 text-amber-500" />
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                    Current Leader: {stats.leadingCandidate.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Party
                    </p>
                    <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      {stats.leadingCandidate.metadata.party || "Independent"}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Vote Count
                    </p>
                    <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      {stats.leadingCandidate.voteCount} votes
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Lead Percentage
                    </p>
                    <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                      {stats.totalVotes > 0
                        ? (
                            (stats.leadingCandidate.voteCount /
                              stats.totalVotes) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
                {stats.leadingCandidate.metadata.slogan && (
                  <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200 italic">
                      "{stats.leadingCandidate.metadata.slogan}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <FiFilter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Filter & Sort Candidates
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Search and organize candidates by various criteria
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Candidates
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, party, or slogan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="all">All Status</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              >
                <option value="votes">🏆 Vote Count</option>
                <option value="name">📝 Name</option>
                <option value="party">🏛️ Party</option>
                <option value="id">📅 Registration Order</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Filter
              </label>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => {
                    setStatusFilter("approved");
                    setSortBy("votes");
                  }}
                  className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/30 transition-colors duration-200"
                >
                  🏆 Top Performers
                </button>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2">
                <FiFilter className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Active filters:
                  {searchTerm && ` Search: "${searchTerm}"`}
                  {statusFilter !== "all" && ` | Status: ${statusFilter}`}
                  {sortBy !== "votes" && ` | Sort: ${sortBy}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Candidates Display */}
        <div className="flex-1">
          {filteredCandidates.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-6">
                <TfiCrown className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {hasActiveFilters
                  ? "No candidates found"
                  : "No candidates registered"}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                {hasActiveFilters
                  ? "Try adjusting your search or filter criteria to find more candidates."
                  : "Candidates will appear here once they register and get approved by administrators."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 mx-auto"
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
                  Showing {filteredCandidates.length} of {candidates.length}{" "}
                  candidates
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <FiCheckCircle className="h-4 w-4" />
                  <span>
                    {
                      filteredCandidates.filter(
                        (c) => parseApprovalStatus(c.status) === "Approved"
                      ).length
                    }{" "}
                    approved
                  </span>
                  <span>•</span>
                  <MdHowToVote className="h-4 w-4" />
                  <span>
                    {filteredCandidates.reduce(
                      (sum, c) => sum + c.voteCount,
                      0
                    )}{" "}
                    total votes
                  </span>
                </div>
              </div>

              <div
                //   className={`
                //   ${
                //     viewMode === "grid"
                //       ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                //       : "space-y-4"
                //   }
                // `}
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6"
              >
                {filteredCandidates.map((candidate, index) => (
                  <div
                    key={candidate.candidateAddress}
                    className="transform transition-all duration-300 hover:scale-105"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CandidateDisplayCard
                      candidate={candidate}
                      rank={sortBy === "votes" ? index + 1 : null}
                      isLeading={
                        sortBy === "votes" &&
                        index === 0 &&
                        candidate.voteCount > 0
                      }
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Election Summary */}
        {filteredCandidates.length > 0 && stats.totalVotes > 0 && (
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <FiTarget className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Election Summary
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current election statistics and performance
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.totalVotes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  total votes cast across all candidates
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Candidates;
