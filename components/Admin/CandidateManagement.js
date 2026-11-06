import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiUserCheck,
  FiCheck,
  FiX,
  FiSearch,
  FiEye,
  FiTrendingUp,
  FiFilter,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiStar,
  FiFlag,
  FiMic,
  FiAward,
  FiBook,
  FiTarget,
  FiAlertCircle,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
  parseApprovalStatus,
  formatAddress,
} from "../../utils/contract";
import { fetchFromIPFS } from "../../utils/ipfs";
import CandidateModal from "./CandidateModal";
import toast from "react-hot-toast";

const CandidateManagement = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState([]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, statusFilter]);

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
            };
          } catch (error) {
            console.error("Error fetching candidate metadata:", error);
            return {
              ...candidate,
              metadata: { description: "Unable to load metadata" },
            };
          }
        })
      );

      setCandidates(candidatesWithMetadata);

      if (showRefreshToast) {
        toast.success("Candidates refreshed successfully!");
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

  const filterCandidates = () => {
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

    setFilteredCandidates(filtered);
  };

  const handleApprove = async (candidateAddress) => {
    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setProcessing(candidateAddress);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);
      const message =
        "Your candidate registration has been approved. You are now eligible to receive votes.";

      const approveProgress = toast.loading("Approving candidate...");
      const tx = await contractFunctions.approveCandidate(
        contract,
        candidateAddress,
        message
      );

      toast.loading("Waiting for confirmation...", { id: approveProgress });
      await tx.wait();

      toast.success("Candidate approved successfully!", {
        id: approveProgress,
      });
      await fetchCandidates();
    } catch (error) {
      console.error("Error approving candidate:", error);
      toast.error(error.message || "Failed to approve candidate");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (candidateAddress) => {
    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      setProcessing(candidateAddress);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);
      const message = `Your candidate registration has been rejected. Reason: ${reason}`;

      const rejectProgress = toast.loading("Rejecting candidate...");
      const tx = await contractFunctions.rejectCandidate(
        contract,
        candidateAddress,
        message
      );

      toast.loading("Waiting for confirmation...", { id: rejectProgress });
      await tx.wait();

      toast.success("Candidate rejected", { id: rejectProgress });
      await fetchCandidates();
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      toast.error(error.message || "Failed to reject candidate");
    } finally {
      setProcessing(null);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedCandidates.length === 0) return;

    if (bulkAction === "approve") {
      for (const candidateAddress of selectedCandidates) {
        await handleApprove(candidateAddress);
      }
    } else if (bulkAction === "reject") {
      const reason = prompt("Please provide a reason for bulk rejection:");
      if (!reason) return;

      for (const candidateAddress of selectedCandidates) {
        await handleReject(candidateAddress);
      }
    }

    setSelectedCandidates([]);
    setBulkAction("");
  };

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
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
    const totalVotes = candidates.reduce(
      (sum, c) => sum + parseInt(c.voteCount.toString()),
      0
    );

    return {
      approved: approved.length,
      pending: pending.length,
      rejected: rejected.length,
      totalVotes,
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

  const hasActiveFilters = searchTerm || statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
          Loading candidates...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <TfiCrown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                Candidate Management
              </h3>
              <p className="text-purple-700 dark:text-purple-300">
                Review and manage candidate registrations and approvals
              </p>
            </div>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TfiCrown className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Total
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {candidates.length}
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
          <div className="bg-blue-100 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FiTrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Total Votes
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalVotes}
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
                Filter & Manage Candidates
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Search and filter candidates, perform bulk actions
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Candidates
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, address, party, or slogan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending Review</option>
              <option value="approved">✅ Approved</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {stats.pending > 0 && (
          <div className="flex items-center space-x-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <FiAlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              {stats.pending} candidates pending review
            </span>
            <div className="flex items-center space-x-2 ml-auto">
              <button
                onClick={async () => {
                  const pendingCandidates = candidates.filter(
                    (c) => parseApprovalStatus(c.status) === "Pending"
                  );
                  for (const c of pendingCandidates) {
                    await handleApprove(c.candidateAddress);
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

      {/* Candidates Display */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-6">
            <TfiCrown className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {hasActiveFilters
              ? "No candidates found"
              : "No registered candidates"}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search or filter criteria to find more candidates."
              : "Candidates will appear here once they register for the election."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Showing {filteredCandidates.length} of {candidates.length}{" "}
                candidates
              </h4>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <FiUserCheck className="h-4 w-4" />
                <span>{stats.approved} approved</span>
                <span>•</span>
                <FiClock className="h-4 w-4" />
                <span>{stats.pending} pending</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Candidate Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campaign Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCandidates.map((candidate) => {
                  const statusConfig = getStatusConfig(candidate.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr
                      key={candidate.candidateAddress}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                            <TfiCrown className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {candidate.name}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                              <FiUser className="h-3 w-3" />
                              <span>
                                ID: #{candidate.registerId.toString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <FiFlag className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {candidate.metadata.party || "Independent"}
                            </span>
                          </div>
                          {candidate.metadata.slogan && (
                            <div className="flex items-center space-x-2">
                              <FiMic className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600 dark:text-gray-400 italic">
                                "{candidate.metadata.slogan}"
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                          {formatAddress(candidate.candidateAddress)}
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
                            {parseApprovalStatus(candidate.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <FiTrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {candidate.voteCount.toString()}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            votes
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(candidate)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          {parseApprovalStatus(candidate.status) ===
                            "Pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleApprove(candidate.candidateAddress)
                                }
                                disabled={
                                  processing === candidate.candidateAddress
                                }
                                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Approve Candidate"
                              >
                                <FiCheck className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleReject(candidate.candidateAddress)
                                }
                                disabled={
                                  processing === candidate.candidateAddress
                                }
                                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                title="Reject Candidate"
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

      {/* Candidate Details Modal */}
      <CandidateModal
        candidate={selectedCandidate}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCandidate(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        processing={processing}
      />
    </div>
  );
};

export default CandidateManagement;
