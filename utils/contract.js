import { ethers } from "ethers";
import { VOTING_CONTRACT_ABI } from "./contractABI";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_CONTRACT_ADDRESS;

// Get contract instance
export const getContract = (provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, provider);
};

// Get contract with signer for write operations
export const getContractWithSigner = (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, signer);
};

// Helper function to parse approval status
export const parseApprovalStatus = (status) => {
  const statusMap = {
    0: "Pending",
    1: "Approved",
    2: "Rejected",
  };
  return statusMap[status] || "Unknown";
};

// Helper function to format address
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper function to format timestamp
export const formatTimestamp = (timestamp) => {
  if (!timestamp || timestamp === "0") return "Not set";
  return new Date(parseInt(timestamp) * 1000).toLocaleString();
};

// Helper function to check if voting is active
export const isVotingActive = (startTime, endTime) => {
  const now = Math.floor(Date.now() / 1000);
  return now >= parseInt(startTime) && now <= parseInt(endTime);
};

// Helper function to get voting status
export const getVotingStatus = (startTime, endTime) => {
  const now = Math.floor(Date.now() / 1000);
  const start = parseInt(startTime);
  const end = parseInt(endTime);

  if (start === 0 || end === 0) return "Not Scheduled";
  if (now < start) return "Upcoming";
  if (now > end) return "Ended";
  return "Active";
};

// Contract interaction functions
export const contractFunctions = {
  // Read functions
  async getOwner(contract) {
    return await contract.owner();
  },

  async getStartTime(contract) {
    return await contract.startTime();
  },

  async getEndTime(contract) {
    return await contract.endTime();
  },

  async getAllRegisteredVoters(contract) {
    return await contract.getAllRegisteredVoters();
  },

  async getAllRegisteredCandidates(contract) {
    return await contract.getAllRegisteredCandidates();
  },

  async getAllApprovedVoters(contract) {
    return await contract.getAllApprovedVoters();
  },

  async getAllApprovedCandidates(contract) {
    return await contract.getAllApprovedCandidates();
  },

  async getVoter(contract, address) {
    return await contract.getVoter(address);
  },

  async getCandidate(contract, address) {
    return await contract.getCandidate(address);
  },

  async getCurrentVotingStatus(contract) {
    return await contract.getCurrentVotingStatus();
  },

  async getWinningCandidate(contract) {
    return await contract.getWinningCandidate();
  },

  async getAllVotersWhoVoted(contract) {
    return await contract.getAllVotersWhoVoted();
  },

  // Write functions
  async registerVoter(contract, name, ipfsHash) {
    return await contract.registerVoter(name, ipfsHash);
  },

  async registerCandidate(contract, name, ipfsHash) {
    return await contract.registerCandidate(name, ipfsHash);
  },

  async approveVoter(contract, voterAddress, message) {
    return await contract.approveVoter(voterAddress, message);
  },

  async approveCandidate(contract, candidateAddress, message) {
    return await contract.approveCandidate(candidateAddress, message);
  },

  async rejectVoter(contract, voterAddress, message) {
    return await contract.rejectVoter(voterAddress, message);
  },

  async rejectCandidate(contract, candidateAddress, message) {
    return await contract.rejectCandidate(candidateAddress, message);
  },

  async setVotingPeriod(contract, startTime, endTime) {
    return await contract.setVotingPeriod(startTime, endTime);
  },

  async vote(contract, candidateAddress) {
    return await contract.vote(candidateAddress);
  },

  async updateVoter(contract, name, ipfsHash) {
    return await contract.updateVoter(name, ipfsHash);
  },

  async updateCandidate(contract, name, ipfsHash) {
    return await contract.updateCandidate(name, ipfsHash);
  },

  async changeOwner(contract, newOwner) {
    return await contract.changeOwner(newOwner);
  },

  async resetContract(contract) {
    return await contract.resetContract();
  },
};
