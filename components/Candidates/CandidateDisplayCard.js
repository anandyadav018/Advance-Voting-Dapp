import React, { useState } from "react";
import {
  FiTrendingUp,
  FiBookOpen,
  FiBriefcase,
  FiTarget,
  FiCheck,
  FiX,
  FiClock,
  FiImage,
  FiFile,
  FiCalendar,
  FiShield,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiAward,
  FiStar,
  FiUser,
  FiFlag,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import { parseApprovalStatus, formatAddress } from "../../utils/contract";
import { getIPFSUrl } from "../../utils/ipfs";

const CandidateDisplayCard = ({ candidate, rank, isLeading }) => {
  const [showDetails, setShowDetails] = useState(false);

  const metadata = candidate.metadata || {};
  const status = parseApprovalStatus(candidate.status);

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
        };
      case "Rejected":
        return {
          icon: FiX,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
        };
      default:
        return {
          icon: FiClock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const getCardStyle = () => {
    if (isLeading) {
      return "border-2 border-gradient-to-r from-yellow-400 to-orange-400 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/40 dark:via-orange-950/40 dark:to-amber-950/40 shadow-xl ring-2 ring-yellow-200 dark:ring-yellow-800";
    }
    return `border ${statusConfig.borderColor} ${statusConfig.bgColor} hover:shadow-lg transition-all duration-300`;
  };

  const getRankBadgeStyle = () => {
    if (rank === 1) {
      return "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg";
    } else if (rank === 2) {
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-md";
    } else if (rank === 3) {
      return "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md";
    }
    return "bg-gradient-to-r from-purple-500 to-indigo-500 text-white";
  };

  const getVoteCountStyle = () => {
    if (isLeading) {
      return "text-yellow-600 dark:text-yellow-400";
    }
    return "text-purple-600 dark:text-purple-400";
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${getCardStyle()}`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar/Crown Icon */}
          <div className="relative">
            <div
              className={`flex items-center justify-center w-16 h-16 rounded-2xl ${
                isLeading
                  ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md"
              }`}
            >
              <TfiCrown className="h-8 w-8 text-white" />
            </div>
            {isLeading && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                <FiStar className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Candidate Info */}
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {candidate.name}
              </h3>
              {rank && (
                <span
                  className={`px-3 py-1 text-sm font-bold rounded-xl ${getRankBadgeStyle()}`}
                >
                  #{rank}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <FiShield className="h-4 w-4" />
                <span>ID: #{candidate.registerId.toString()}</span>
              </div>
              {metadata.party && (
                <div className="flex items-center space-x-1">
                  <FiFlag className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {metadata.party}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vote Count */}
        <div className="text-right">
          <div
            className={`flex items-center justify-end space-x-2 mb-1 ${getVoteCountStyle()}`}
          >
            <FiTrendingUp className="h-5 w-5" />
            <span className="text-2xl font-bold">{candidate.voteCount}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">votes</p>
        </div>
      </div>

      {/* Status & Leading Indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${statusConfig.bgColor}`}>
            <StatusIcon className={`h-4 w-4 ${statusConfig.color}`} />
          </div>
          <span
            className={`px-3 py-1 rounded-xl text-sm font-semibold ${statusConfig.badge}`}
          >
            {status}
          </span>
        </div>

        {isLeading && (
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-xl">
            <FiAward className="h-4 w-4 text-white" />
            <span className="text-sm font-bold text-white">Leading</span>
          </div>
        )}
      </div>

      {/* Campaign Slogan */}
      {metadata.slogan && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
              <FiTarget className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Campaign Slogan
            </span>
          </div>
          <p className="text-purple-900 dark:text-purple-100 font-medium italic text-center">
            "{metadata.slogan}"
          </p>
        </div>
      )}

      {/* Description Preview */}
      {metadata.description && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <FiUser className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              About the Candidate
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
        className="w-full flex items-center justify-center space-x-2 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 mb-6"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {showDetails ? "Hide Details" : "View Full Profile"}
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
          {/* Photo Section */}
          {metadata.photoHash && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FiImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Campaign Photo
                </h4>
              </div>
              <div className="flex justify-center">
                <img
                  src={getIPFSUrl(metadata.photoHash)}
                  alt={`${candidate.name} campaign photo`}
                  className="w-40 h-40 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Professional Background */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            {metadata.education && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiBookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Education
                  </h4>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {metadata.education}
                </p>
              </div>
            )}

            {/* Experience */}
            {metadata.experience && (
              <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiBriefcase className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Experience
                  </h4>
                </div>
                <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                  {metadata.experience}
                </p>
              </div>
            )}
          </div>

          {/* Campaign Manifesto */}
          {metadata.manifesto && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-3">
                <FiTarget className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                  Campaign Manifesto
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {metadata.manifesto}
                </p>
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          {metadata.documentHash && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <FiFile className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Supporting Documents
                </h4>
              </div>
              <a
                href={getIPFSUrl(metadata.documentHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-xl hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors duration-200"
              >
                <FiFile className="h-4 w-4" />
                <span className="font-medium">View Documents</span>
                <FiExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Technical Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              Technical Information
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded-lg flex-1">
                    {formatAddress
                      ? formatAddress(candidate.candidateAddress)
                      : candidate.candidateAddress}
                  </p>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(candidate.candidateAddress)
                    }
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
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
      )}

      {/* Leading Banner */}
      {isLeading && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl text-center shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <FiAward className="h-5 w-5 text-white" />
            <p className="text-lg font-bold text-white">
              🏆 Currently Leading the Race!
            </p>
            <FiAward className="h-5 w-5 text-white" />
          </div>
          <p className="text-white/90 text-sm mt-1">
            This candidate has the highest vote count
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateDisplayCard;
