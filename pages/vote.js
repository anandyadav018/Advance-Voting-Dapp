import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiCheck,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiTarget,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiUserCheck,
  FiPlay,
  FiPause,
  FiStopCircle,
  FiCalendar,
} from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";
import DashboardLayout from "../components/Layout/DashboardLayout";
import CandidateCard from "../components/Vote/CandidateCard";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
  isVotingActive,
  getVotingStatus,
  formatTimestamp,
  parseApprovalStatus,
} from "../utils/contract";
import { fetchFromIPFS } from "../utils/ipfs";
import toast from "react-hot-toast";

const Vote = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [voterStatus, setVoterStatus] = useState(null);
  const [votingTimes, setVotingTimes] = useState({
    startTime: "0",
    endTime: "0",
  });
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    if (isConnected && address) {
      fetchVotingData();
    }
  }, [isConnected, address]);

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      // Fetch voting data
      const [approvedCandidates, startTime, endTime, voterInfo] =
        await Promise.all([
          contractFunctions.getAllApprovedCandidates(contract),
          contractFunctions.getStartTime(contract),
          contractFunctions.getEndTime(contract),
          contractFunctions.getVoter(contract, address),
        ]);

      // Fetch candidate metadata from IPFS
      const candidatesWithMetadata = await Promise.all(
        approvedCandidates.map(async (candidate) => {
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
      setVotingTimes({
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });

      // Check if user is a registered voter
      if (
        voterInfo.voterAddress !== "0x0000000000000000000000000000000000000000"
      ) {
        setVoterStatus(voterInfo);
      }
    } catch (error) {
      console.error("Error fetching voting data:", error);
      toast.error("Failed to load voting data");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateAddress) => {
    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    if (
      !voterStatus ||
      parseApprovalStatus(voterStatus.status) !== "Approved"
    ) {
      toast.error("You are not an approved voter");
      return;
    }

    if (voterStatus.hasVoted) {
      toast.error("You have already voted");
      return;
    }

    if (!isVotingActive(votingTimes.startTime, votingTimes.endTime)) {
      toast.error("Voting is not currently active");
      return;
    }

    try {
      setVoting(true);
      setSelectedCandidate(candidateAddress);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      const voteProgress = toast.loading("Submitting your vote...");
      const tx = await contractFunctions.vote(contract, candidateAddress);

      toast.loading("Waiting for confirmation...", { id: voteProgress });
      await tx.wait();

      toast.success("Vote submitted successfully!", { id: voteProgress });

      // Refresh data
      await fetchVotingData();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to submit vote");
    } finally {
      setVoting(false);
      setSelectedCandidate(null);
    }
  };

  const votingStatus = getVotingStatus(
    votingTimes.startTime,
    votingTimes.endTime
  );

  const getVotingStatusConfig = (status) => {
    switch (status) {
      case "Active":
        return {
          icon: FiPlay,
          color: "green",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-800 dark:text-green-200",
          iconColor: "text-green-600 dark:text-green-400",
        };
      case "Ended":
        return {
          icon: FiStopCircle,
          color: "red",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600 dark:text-red-400",
        };
      case "Upcoming":
        return {
          icon: FiPause,
          color: "blue",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-800 dark:text-blue-200",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      default:
        return {
          icon: FiClock,
          color: "gray",
          bgColor: "bg-gray-50 dark:bg-gray-900/20",
          borderColor: "border-gray-200 dark:border-gray-800",
          textColor: "text-gray-800 dark:text-gray-200",
          iconColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const getVoterStatusConfig = (status, hasVoted) => {
    if (parseApprovalStatus(status) === "Approved") {
      if (hasVoted) {
        return {
          icon: FiCheckCircle,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800",
          textColor: "text-blue-800 dark:text-blue-200",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      } else {
        return {
          icon: FiUserCheck,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-800 dark:text-green-200",
          iconColor: "text-green-600 dark:text-green-400",
        };
      }
    } else {
      return {
        icon: FiXCircle,
        bgColor: "bg-red-50 dark:bg-red-900/20",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-800 dark:text-red-200",
        iconColor: "text-red-600 dark:text-red-400",
      };
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Vote">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Loading voting data...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const statusConfig = getVotingStatusConfig(votingStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout title="Vote">
      <div className="flex flex-col max-w-7xl mx-auto space-y-8">
        {/* Voting Status */}
        <div
          className={`flex-shrink-0 rounded-2xl p-6 border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-xl ${statusConfig.bgColor}`}>
                <StatusIcon className={`h-6 w-6 ${statusConfig.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${statusConfig.textColor}`}>
                  Election Status
                </h2>
                <p className={`${statusConfig.textColor} opacity-80`}>
                  Current voting period status
                </p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-xl font-semibold ${statusConfig.bgColor} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
            >
              {votingStatus}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className={`p-4 rounded-xl ${statusConfig.bgColor} bg-opacity-50`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <FiPlay className={`h-4 w-4 ${statusConfig.iconColor}`} />
                <p className={`text-sm font-medium ${statusConfig.textColor}`}>
                  Voting Start
                </p>
              </div>
              <p className={`text-lg font-bold ${statusConfig.textColor}`}>
                {formatTimestamp(votingTimes.startTime)}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl ${statusConfig.bgColor} bg-opacity-50`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <FiStopCircle className={`h-4 w-4 ${statusConfig.iconColor}`} />
                <p className={`text-sm font-medium ${statusConfig.textColor}`}>
                  Voting End
                </p>
              </div>
              <p className={`text-lg font-bold ${statusConfig.textColor}`}>
                {formatTimestamp(votingTimes.endTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Voter Status */}
        {voterStatus ? (
          <div className="flex-shrink-0">
            {(() => {
              const config = getVoterStatusConfig(
                voterStatus.status,
                voterStatus.hasVoted
              );
              const VoterIcon = config.icon;
              return (
                <div
                  className={`rounded-2xl p-6 border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-xl ${config.bgColor}`}>
                        <VoterIcon className={`h-6 w-6 ${config.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${config.textColor}`}>
                        Voter Status: {parseApprovalStatus(voterStatus.status)}
                      </h3>
                      <p className={`mt-2 ${config.textColor} opacity-80`}>
                        {voterStatus.hasVoted
                          ? "Thank you for participating in this election!"
                          : voterStatus.message}
                      </p>
                      {voterStatus.hasVoted && (
                        <div
                          className={`mt-4 p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle
                              className={`h-4 w-4 ${config.iconColor}`}
                            />
                            <span
                              className={`text-sm font-medium ${config.textColor}`}
                            >
                              Vote successfully cast and recorded on blockchain
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <FiAlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                  Voter Registration Required
                </h3>
                <p className="text-amber-800 dark:text-amber-200 mt-2 mb-4">
                  You need to register as a voter and get approved before you
                  can participate in elections.
                </p>
                <button
                  onClick={() => (window.location.href = "/register-voter")}
                  className="flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FiUserCheck className="mr-2 h-4 w-4" />
                  Register as Voter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidates Section */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FiTarget className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Candidates
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {candidates.length}{" "}
                  {candidates.length === 1 ? "candidate" : "candidates"}{" "}
                  available
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-lg">
              <FiInfo className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Choose wisely
              </span>
            </div>
          </div>

          {candidates.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-4">
                <FiUser className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Candidates Available
              </h4>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                There are currently no approved candidates for this election.
                Check back later or contact the administrator.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
              {candidates.map((candidate, index) => (
                <div
                  key={candidate.candidateAddress}
                  className="transform transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CandidateCard
                    candidate={candidate}
                    onVote={handleVote}
                    canVote={
                      voterStatus &&
                      parseApprovalStatus(voterStatus.status) === "Approved" &&
                      !voterStatus.hasVoted &&
                      votingStatus === "Active"
                    }
                    isVoting={
                      voting && selectedCandidate === candidate.candidateAddress
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Voting Instructions */}
        {votingStatus === "Active" &&
          voterStatus &&
          parseApprovalStatus(voterStatus.status) === "Approved" &&
          !voterStatus.hasVoted && (
            <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
                  <MdHowToVote className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                    How to Vote
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mt-0.5">
                          1
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Review each candidate's information, manifesto, and
                          qualifications carefully
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mt-0.5">
                          2
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Click the "Vote" button on your preferred candidate's
                          card
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold mt-0.5">
                          3
                        </div>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Confirm the transaction in your wallet when prompted
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          You can only vote once per election
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Your vote is anonymous and secure on the blockchain
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Results will be available after voting ends
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Security Notice */}
                  <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start space-x-3">
                      <FiCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Secure & Transparent
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          This election uses blockchain technology to ensure
                          vote integrity, transparency, and immutability. Your
                          vote cannot be changed or tampered with once
                          submitted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Voting Ended Notice */}
        {votingStatus === "Ended" && (
          <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <FiCalendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Voting Period Ended
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    This election is now closed. Check the results page for
                    final outcomes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => (window.location.href = "/results")}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                View Results
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Vote;
