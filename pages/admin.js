import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiSettings,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiShield,
  FiRotateCcw,
  FiAlertTriangle,
  FiLock,
  FiUnlock,
  FiCheckCircle,
  FiEye,
  FiDatabase,
  FiActivity,
  FiStar,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";
import DashboardLayout from "../components/Layout/DashboardLayout";
import VoterManagement from "../components/Admin/VoterManagement";
import CandidateManagement from "../components/Admin/CandidateManagement";
import VotingSettings from "../components/Admin/VotingSettings";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
} from "../utils/contract";
import toast from "react-hot-toast";

const Admin = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [activeTab, setActiveTab] = useState("voters");
  const [resetting, setResetting] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      checkOwnership();
    }
  }, [isConnected, address]);

  const checkOwnership = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      const owner = await contractFunctions.getOwner(contract);
      setIsOwner(owner.toLowerCase() === address.toLowerCase());
    } catch (error) {
      console.error("Error checking ownership:", error);
      toast.error("Failed to verify admin status");
    } finally {
      setLoading(false);
    }
  };

  const handleResetContract = async () => {
    if (!walletClient || !isOwner) {
      toast.error("Only contract owner can reset the contract");
      return;
    }

    try {
      setResetting(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      const resetProgress = toast.loading("Resetting contract...");

      const tx = await contractFunctions.resetContract(contract);

      toast.loading("Waiting for confirmation...", { id: resetProgress });
      await tx.wait();

      toast.success("Contract reset successfully!", { id: resetProgress });
      setShowResetWarning(false);

      // Refresh the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error resetting contract:", error);
      toast.error(error.message || "Failed to reset contract");
    } finally {
      setResetting(false);
    }
  };

  const tabs = [
    {
      id: "voters",
      name: "Voter Management",
      icon: FiUsers,
      description: "Approve and manage voter registrations",
      color: "blue",
    },
    {
      id: "candidates",
      name: "Candidate Management",
      icon: FiUserCheck,
      description: "Review and approve candidate applications",
      color: "purple",
    },
    {
      id: "settings",
      name: "Election Settings",
      icon: FiClock,
      description: "Configure voting periods and parameters",
      color: "green",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Admin Panel">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Verifying admin credentials...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // if (!isOwner) {
  //   return (
  //     <DashboardLayout title="Admin Panel">
  //       <div className="flex flex-col items-center justify-center min-h-[60vh]">
  //         <div className="max-w-md mx-auto text-center">
  //           <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl flex items-center justify-center mb-6">
  //             <FiShield className="h-12 w-12 text-red-600 dark:text-red-400" />
  //           </div>
  //           <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
  //             Access Restricted
  //           </h2>
  //           <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
  //             Only the contract owner can access the admin panel. Your wallet
  //             address is not authorized to view this content.
  //           </p>
  //           <div className="space-y-4">
  //             <button
  //               onClick={() => (window.location.href = "/")}
  //               className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 mx-auto"
  //             >
  //               <FiActivity className="mr-2 h-4 w-4" />
  //               Go to Dashboard
  //             </button>
  //             <p className="text-sm text-gray-500 dark:text-gray-400">
  //               Contact the system administrator if you believe this is an error
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     </DashboardLayout>
  //   );
  // }
  if (!isOwner) {
    return (
      <DashboardLayout title="Admin Panel">
        <div className="flex w-full flex-col items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-lg mx-auto text-center">
            {/* Animated Icon Container */}
            <div className="relative mx-auto w-32 h-32 mb-8">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-rose-500 rounded-3xl opacity-20 animate-pulse"></div>

              {/* Main icon container */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-red-100 via-red-50 to-rose-100 dark:from-red-950/40 dark:via-red-900/30 dark:to-rose-950/40 rounded-3xl flex items-center justify-center border-2 border-red-200 dark:border-red-800 shadow-xl">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <FiShield className="h-16 w-16 text-red-600 dark:text-red-400 relative z-10" />

                {/* Floating particles */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce opacity-60"></div>
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-300 opacity-60"></div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-4">
                  Access Restricted
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full mx-auto mb-6"></div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl p-6 border border-red-200 dark:border-red-800">
                <p className="text-lg text-red-800 dark:text-red-200 leading-relaxed">
                  Only the contract owner can access the admin panel. Your
                  wallet address is not authorized to view this content.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="group relative flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl mx-auto shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <FiActivity className="mr-3 h-5 w-5 relative z-10" />
                  <span className="relative z-10">Go to Dashboard</span>
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 mx-auto"
                >
                  <FiRefreshCw className="mr-2 h-4 w-4" />
                  Retry Connection
                </button>
              </div>

              {/* Help Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <FiInfo className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Need Access?
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Contact the system administrator if you believe this is an
                      error. Make sure you're connected with the correct wallet
                      that has admin privileges.
                    </p>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <details className="text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200">
                  Technical Details
                </summary>
                <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Status:
                      </span>
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        Unauthorized
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Required Role:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Contract Owner
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 dark:text-gray-400">
                        Access Level:
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Admin Panel
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Admin Panel">
      <div className="flex flex-col max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FiSettings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  Admin Control Panel
                </h1>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-lg">
                    <FiCheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Authorized Access
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
                    <FiEye className="h-4 w-4" />
                    <span className="text-sm">
                      Owner: {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                <FiDatabase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  System Admin
                </span>
              </div>
              <button
                onClick={() => setShowResetWarning(true)}
                disabled={resetting}
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors duration-200"
              >
                <FiRotateCcw className="mr-2 h-4 w-4" />
                Danger Zone
              </button>
            </div>
          </div>
        </div>

        {/* Security Warning for Reset */}
        {showResetWarning && (
          <div className="flex-shrink-0 bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-start space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex-shrink-0">
                <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-2">
                  ⚠️ Critical System Reset
                </h3>
                <p className="text-red-800 dark:text-red-200 mb-4">
                  You are about to permanently delete ALL election data
                  including voters, candidates, votes, and settings. This action
                  is <strong>irreversible</strong> and will reset the contract
                  to its initial state.
                </p>

                <div className="bg-red-100 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    This will permanently remove:
                  </h4>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    <li>• All registered voter accounts and approvals</li>
                    <li>• All candidate registrations and campaigns</li>
                    <li>• All cast votes and election results</li>
                    <li>• Current voting period settings</li>
                    <li>• All historical election data</li>
                  </ul>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleResetContract}
                    disabled={resetting}
                    className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    {resetting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Resetting System...
                      </>
                    ) : (
                      <>
                        <FiRotateCcw className="mr-2 h-4 w-4" />
                        Confirm Reset Contract
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowResetWarning(false)}
                    className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Navigation Tabs */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex" aria-label="Admin Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center space-y-2 py-6 px-4 text-center transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl transition-colors duration-200 ${
                      activeTab === tab.id
                        ? "bg-blue-100 dark:bg-blue-900/30"
                        : "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    <tab.icon
                      className={`h-6 w-6 ${
                        activeTab === tab.id
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{tab.name}</span>
                    <p
                      className={`text-xs mt-1 ${
                        activeTab === tab.id
                          ? "text-blue-500 dark:text-blue-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <div className="animate-fadeIn">
              {activeTab === "voters" && <VoterManagement />}
              {activeTab === "candidates" && <CandidateManagement />}
              {activeTab === "settings" && <VotingSettings />}
            </div>
          </div>
        </div>

        {/* Admin Features Footer */}
        <div className="flex-shrink-0 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <FiStar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Admin Privileges
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have full administrative control over this election system
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                <FiLock className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Secure Access
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                <FiActivity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Real-time Management
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Admin;
