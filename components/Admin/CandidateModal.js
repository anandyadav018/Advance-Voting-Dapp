import React from "react";
import {
  FiX,
  FiCheck,
  FiTrendingUp,
  FiBookOpen,
  FiBriefcase,
  FiTarget,
  FiCalendar,
  FiMic,
  FiFlag,
  FiUser,
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiExternalLink,
  FiMail,
  FiGlobe,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import { parseApprovalStatus, formatAddress } from "../../utils/contract";

const CandidateModal = ({
  candidate,
  isOpen,
  onClose,
  onApprove,
  onReject,
  processing,
}) => {
  if (!isOpen || !candidate) return null;

  const metadata = candidate.metadata || {};
  const parsedStatus = parseApprovalStatus(candidate.status);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Approved":
        return {
          icon: FiCheckCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
        };
      case "Rejected":
        return {
          icon: FiXCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        };
      default:
        return {
          icon: FiClock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        };
    }
  };

  const statusConfig = getStatusConfig(parsedStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Enhanced Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 px-6 pt-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                  <TfiCrown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Candidate Details
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300">
                    Registration Review & Information
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors duration-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Candidate Header Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl">
                    <TfiCrown className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {candidate.name}
                    </h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                        <FiShield className="h-4 w-4" />
                        <span className="text-sm">
                          ID: #{candidate.registerId.toString()}
                        </span>
                      </div>
                      {metadata.party && (
                        <div className="flex items-center space-x-1">
                          <FiFlag className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            {metadata.party}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-2 mb-2">
                    <FiTrendingUp className="h-5 w-5 text-purple-500" />
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {candidate.voteCount.toString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    total votes received
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${statusConfig.bgColor}`}>
                    <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                  </div>
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.badge}`}
                  >
                    {parsedStatus}
                  </span>
                </div>
                {metadata.slogan && (
                  <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                    <FiMic className="h-4 w-4" />
                    <span className="text-sm italic">"{metadata.slogan}"</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-900 px-6 pb-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* About Section */}
                {metadata.description && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <FiUser className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        About
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {metadata.description}
                    </p>
                  </div>
                )}

                {/* Education */}
                {metadata.education && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <FiBookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Education Background
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {metadata.education}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {metadata.experience && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <FiBriefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        Experience & Qualifications
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {metadata.experience}
                    </p>
                  </div>
                )}

                {/* Technical Details */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <FiGlobe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      Technical Information
                    </h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Wallet Address
                      </label>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg flex-1">
                          {formatAddress(candidate.candidateAddress)}
                        </p>
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(
                              candidate.candidateAddress
                            )
                          }
                          className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Copy address"
                        >
                          <FiExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {metadata.registeredAt && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Registration Date
                        </label>
                        <div className="flex items-center space-x-2">
                          <FiCalendar className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(metadata.registeredAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Campaign Manifesto */}
                {metadata.manifesto && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center space-x-2 mb-3">
                      <FiTarget className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h5 className="font-semibold text-purple-900 dark:text-purple-100">
                        Campaign Manifesto
                      </h5>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {metadata.manifesto}
                      </p>
                    </div>
                  </div>
                )}

                {/* Admin Message */}
                <div
                  className={`rounded-2xl p-4 border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <FiMail className={`h-5 w-5 ${statusConfig.color}`} />
                    <h5 className={`font-semibold ${statusConfig.color}`}>
                      Admin Message
                    </h5>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {candidate.message || "No admin message provided."}
                    </p>
                  </div>
                </div>

                {/* Additional Metadata */}
                {(metadata.updatedAt ||
                  metadata.photoHash ||
                  metadata.documentHash) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Additional Information
                    </h5>
                    <div className="space-y-2 text-sm">
                      {metadata.updatedAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Last Updated:
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {new Date(metadata.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {metadata.photoHash && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Photo Uploaded:
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            ✓ Yes
                          </span>
                        </div>
                      )}
                      {metadata.documentHash && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 dark:text-gray-400">
                            Documents Uploaded:
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            ✓ Yes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {parsedStatus === "Pending" && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row-reverse gap-3">
                <button
                  onClick={() => {
                    onApprove(candidate.candidateAddress);
                    onClose();
                  }}
                  disabled={processing === candidate.candidateAddress}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {processing === candidate.candidateAddress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Approving...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2 h-5 w-5" />
                      Approve Candidate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    onReject(candidate.candidateAddress);
                    onClose();
                  }}
                  disabled={processing === candidate.candidateAddress}
                  className="flex items-center justify-center px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {processing === candidate.candidateAddress ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <FiX className="mr-2 h-5 w-5" />
                      Reject Candidate
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Read-only footer for approved/rejected candidates */}
          {parsedStatus !== "Pending" && (
            <div
              className={`px-6 py-4 border-t ${statusConfig.bgColor} ${statusConfig.borderColor}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                <span className={`font-semibold ${statusConfig.color}`}>
                  This candidate has been {parsedStatus.toLowerCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;
