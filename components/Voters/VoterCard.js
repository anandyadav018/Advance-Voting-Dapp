import React, { useState } from "react";
import {
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiCheck,
  FiX,
  FiClock,
  FiImage,
  FiFile,
  FiShield,
  FiEye,
  FiChevronDown,
  FiChevronUp,
  FiExternalLink,
  FiMail,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiGlobe,
} from "react-icons/fi";
import { parseApprovalStatus, formatAddress } from "../../utils/contract";
import { getIPFSUrl } from "../../utils/ipfs";

const VoterCard = ({ voter }) => {
  const [showDetails, setShowDetails] = useState(false);

  const metadata = voter.metadata || {};
  const status = parseApprovalStatus(voter.status);

  const getStatusConfig = (status) => {
    switch (status) {
      case "Approved":
        return {
          icon: FiCheck,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
          gradient: "from-green-500 to-emerald-500",
        };
      case "Rejected":
        return {
          icon: FiX,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
          gradient: "from-red-500 to-rose-500",
        };
      default:
        return {
          icon: FiClock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
          gradient: "from-amber-500 to-orange-500",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getVotingBadgeStyle = () => {
    if (voter.hasVoted) {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border border-blue-200 dark:border-blue-800";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 border border-gray-200 dark:border-gray-700";
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border ${statusConfig.borderColor} ${statusConfig.bgColor}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-md">
              <FiUsers className="h-8 w-8 text-white" />
            </div>
            {voter.hasVoted && (
              <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1">
                <FiCheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>

          {/* Voter Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {voter.name}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FiShield className="h-4 w-4" />
                <span>ID: #{voter.registerId.toString()}</span>
              </div>
              {metadata.nationality && (
                <div className="flex items-center space-x-1">
                  <FiMapPin className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {metadata.nationality}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`p-2 rounded-xl ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
            </div>
            <span
              className={`px-3 py-1 rounded-xl text-sm font-semibold ${statusConfig.badge}`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Voting Status Highlight */}
      <div className="mb-6">
        <div
          className={`p-4 rounded-2xl ${
            voter.hasVoted
              ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
              : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-xl ${
                  voter.hasVoted
                    ? "bg-blue-100 dark:bg-blue-900/50"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                {voter.hasVoted ? (
                  <FiCheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                ) : (
                  <FiUser className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </div>
              <div>
                <h4
                  className={`font-semibold ${
                    voter.hasVoted
                      ? "text-blue-900 dark:text-blue-100"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  Voting Status
                </h4>
                <p
                  className={`text-sm ${
                    voter.hasVoted
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {voter.hasVoted
                    ? "Has participated in the election"
                    : "Has not voted yet"}
                </p>
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-xl text-sm font-bold ${getVotingBadgeStyle()}`}
            >
              {voter.hasVoted ? "✓ Voted" : "Not Voted"}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FiUser className="h-4 w-4" />
          <span>Personal Information</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metadata.age && (
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FiCalendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {metadata.age} years
                </p>
              </div>
            </div>
          )}

          {metadata.occupation && (
            <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <FiBriefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Occupation
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {metadata.occupation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {metadata.description && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <FiUser className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              About the Voter
            </span>
          </div>
          <p
            className={`text-gray-700 dark:text-gray-300 leading-relaxed ${
              !showDetails ? "line-clamp-3" : ""
            }`}
          >
            {metadata.description}
          </p>
        </div>
      )}

      {/* Toggle Details Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center space-x-2 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 mb-6"
      >
        <FiEye className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {showDetails ? "Hide Details" : "View Complete Profile"}
        </span>
        {showDetails ? (
          <FiChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <FiChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Detailed Information */}
      {showDetails && (
        <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          {/* Profile Photo */}
          {metadata.photoHash && (
            <div className="text-center">
              <div className="flex items-center space-x-2 mb-4">
                <FiImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  Profile Photo
                </h5>
              </div>
              <div className="flex justify-center">
                <img
                  src={getIPFSUrl(metadata.photoHash)}
                  alt={`${voter.name} profile`}
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Identity Document */}
          {metadata.documentHash && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FiFile className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h5 className="font-semibold text-gray-900 dark:text-white">
                  Identity Document
                </h5>
              </div>
              <a
                href={getIPFSUrl(metadata.documentHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors duration-200"
              >
                <FiFile className="h-4 w-4" />
                <span className="font-medium">View Identity Document</span>
                <FiExternalLink className="h-3 w-3" />
              </a>
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
                {voter.message || "No admin message provided."}
              </p>
            </div>
          </div>

          {/* Technical Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
            <div className="flex items-center space-x-2 mb-4">
              <FiGlobe className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h5 className="font-semibold text-gray-900 dark:text-white">
                Technical Information
              </h5>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg flex-1">
                    {formatAddress(voter.voterAddress)}
                  </p>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(voter.voterAddress)
                    }
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                    title="Copy full address"
                  >
                    <FiExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {metadata.registeredAt && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
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

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Full Wallet Address
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-600 p-3 rounded-lg break-all leading-relaxed">
                  {voter.voterAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Metadata */}
          {(metadata.updatedAt ||
            metadata.photoHash ||
            metadata.documentHash) && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
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
      )}

      {/* Voting Participation Banner */}
      {voter.hasVoted && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl text-center shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <FiCheckCircle className="h-5 w-5 text-white" />
            <p className="text-lg font-bold text-white">
              ✓ Participated in Election
            </p>
            <FiCheckCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-white/90 text-sm mt-1">
            This voter has successfully cast their ballot
          </p>
        </div>
      )}
    </div>
  );
};

export default VoterCard;
