import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiUsers,
  FiCheck,
  FiX,
  FiSearch,
  FiEye,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiUserCheck,
  FiTrendingUp,
  FiAlertCircle,
  FiShield,
  FiGlobe,
  FiCalendar,
} from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
  parseApprovalStatus,
  formatAddress,
} from "../../utils/contract";
import { fetchFromIPFS } from "../../utils/ipfs";
import VoterModal from "./VoterModal";
import toast from "react-hot-toast";

const VoterManagement = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voters, setVoters] = useState([]);
  const [filteredVoters, setFilteredVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [votedFilter, setVotedFilter] = useState("all");
  const [selectedVoter, setSelectedVoter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchVoters();
  }, []);

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
        toast.success("Voters refreshed successfully!");
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
              .includes(searchTerm.toLowerCase())) ||
          (voter.metadata.occupation &&
            voter.metadata.occupation
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

  const handleApprove = async (voterAddress) => {
    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setProcessing(voterAddress);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);
      const message =
        "Your voter registration has been approved. You can now participate in elections.";

      const approveProgress = toast.loading("Approving voter...");
      const tx = await contractFunctions.approveVoter(
        contract,
        voterAddress,
        message
      );

      toast.loading("Waiting for confirmation...", { id: approveProgress });
      await tx.wait();

      toast.success("Voter approved successfully!", { id: approveProgress });
      await fetchVoters();
    } catch (error) {
      console.error("Error approving voter:", error);
      toast.error(error.message || "Failed to approve voter");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (voterAddress) => {
    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      setProcessing(voterAddress);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);
      const message = `Your voter registration has been rejected. Reason: ${reason}`;

      const rejectProgress = toast.loading("Rejecting voter...");
      const tx = await contractFunctions.rejectVoter(
        contract,
        voterAddress,
        message
      );

      toast.loading("Waiting for confirmation...", { id: rejectProgress });
      await tx.wait();

      toast.success("Voter rejected", { id: rejectProgress });
      await fetchVoters();
    } catch (error) {
      console.error("Error rejecting voter:", error);
      toast.error(error.message || "Failed to reject voter");
    } finally {
      setProcessing(null);
    }
  };

  const handleViewDetails = (voter) => {
    setSelectedVoter(voter);
    setIsModalOpen(true);
  };

  const getStats = () => {
    const approved = voters.filter(
      (v) => parseApprovalStatus(v.status) === "Approved"
    );
    const pending = voters.filter(
      (v) => parseApprovalStatus(v.status) === "Pending"
    );
    const rejected = voters.filter(
      (v) => parseApprovalStatus(v.status) === "Rejected"
    );
    const voted = voters.filter((v) => v.hasVoted);
    const participationRate =
      approved.length > 0 ? (voted.length / approved.length) * 100 : 0;

    return {
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      voted: voted.length,
      participationRate,
    };
  };

  const stats = getStats();

  const getStatusConfig = (status) => {
    const parsedStatus = parseApprovalStatus(status);
    switch (parsedStatus) {
      case "Approved":
        return {
          icon: FiCheckCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
        };
      case "Rejected":
        return {
          icon: FiXCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        };
      default:
        return {
          icon: FiClock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 dark:bg-amber-900/30",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        };
    }
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || votedFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setVotedFilter("all");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
          Loading voters...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FiUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                Voter Management
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Review and manage voter registrations and eligibility
              </p>
            </div>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {voters.length}
            </div>
          </div>
          <div className="bg-green-100 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Approved
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.approved}
            </div>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Pending
              </span>
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {stats.pending}
            </div>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MdHowToVote className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Voted
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.voted}
            </div>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiTrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                Participation
              </span>
            </div>
            <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {stats.participationRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <FiFilter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filter & Manage Voters
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Search and filter voters, perform bulk actions
              </p>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <FiX className="mr-2 h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Voters
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, address, nationality, or occupation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
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
              <option value="pending">⏳ Pending Review</option>
              <option value="approved">✅ Approved</option>
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

        {/* Bulk Actions */}
        {stats.pending > 0 && (
          <div className="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <FiAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {stats.pending} voters pending review
            </span>
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={async () => {
                  const pendingVoters = voters.filter(
                    (v) => parseApprovalStatus(v.status) === "Pending"
                  );
                  for (const v of pendingVoters) {
                    await handleApprove(v.voterAddress);
                  }
                }}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Approve All Pending
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Voters Display */}
      {filteredVoters.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-6">
            <FiUsers className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {hasActiveFilters ? "No voters found" : "No registered voters"}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search or filter criteria to find more voters."
              : "Voters will appear here once they register for the election."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Showing {filteredVoters.length} of {voters.length} voters
              </h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FiUserCheck className="h-4 w-4" />
                <span>{stats.approved} approved</span>
                <span>•</span>
                <MdHowToVote className="h-4 w-4" />
                <span>{stats.voted} voted</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Voter Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Personal Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Voting Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredVoters.map((voter) => {
                  const statusConfig = getStatusConfig(voter.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={voter.voterAddress}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                            <FiUser className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {voter.name}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <FiShield className="h-3 w-3" />
                              <span>ID: #{voter.registerId.toString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          {voter.metadata.nationality && (
                            <div className="flex items-center space-x-2">
                              <FiGlobe className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {voter.metadata.nationality}
                              </span>
                            </div>
                          )}
                          {voter.metadata.occupation && (
                            <div className="flex items-center space-x-2">
                              <FiUser className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {voter.metadata.occupation}
                              </span>
                            </div>
                          )}
                          {voter.metadata.age && (
                            <div className="flex items-center space-x-2">
                              <FiCalendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Age: {voter.metadata.age}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                          {formatAddress(voter.voterAddress)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-2 rounded-lg ${statusConfig.bgColor}`}
                          >
                            <StatusIcon
                              className={`h-4 w-4 ${statusConfig.color}`}
                            />
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${statusConfig.badge}`}
                          >
                            {parseApprovalStatus(voter.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`p-2 rounded-lg ${
                              voter.hasVoted
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-gray-100 dark:bg-gray-700"
                            }`}
                          >
                            <MdHowToVote
                              className={`h-4 w-4 ${
                                voter.hasVoted
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              voter.hasVoted
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {voter.hasVoted ? "Voted" : "Not Voted"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(voter)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          {parseApprovalStatus(voter.status) === "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(voter.voterAddress)
                                }
                                disabled={processing === voter.voterAddress}
                                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Approve Voter"
                              >
                                <FiCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(voter.voterAddress)}
                                disabled={processing === voter.voterAddress}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Reject Voter"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {parseApprovalStatus(voter.status) === "Rejected" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(voter.voterAddress)
                                }
                                disabled={processing === voter.voterAddress}
                                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Approve Voter"
                              >
                                <FiCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleReject(voter.voterAddress)}
                                disabled={processing === voter.voterAddress}
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Reject Voter"
                              >
                                <FiX className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Voter Details Modal */}
      <VoterModal
        voter={selectedVoter}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVoter(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />
    </div>
  );
};

export default VoterManagement;
