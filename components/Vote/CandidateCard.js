import React, { useState } from "react";
import {
  FiUser,
  FiTrendingUp,
  FiBookOpen,
  FiBriefcase,
  FiTarget,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiFlag,
  FiExternalLink,
  FiCalendar,
  FiCheckCircle,
  FiEye,
  FiImage,
  FiFile,
} from "react-icons/fi";
import { MdHowToVote } from "react-icons/md";
import { TfiCrown } from "react-icons/tfi";
import { formatAddress } from "../../utils/contract";
import { getIPFSUrl } from "../../utils/ipfs";

const CandidateCard = ({
  candidate,
  onVote,
  canVote,
  isVoting,
  rank,
  isLeading,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const metadata = candidate.metadata || {};

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

  const getCardStyle = () => {
    if (isLeading) {
      return "border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 dark:from-yellow-950/40 dark:via-orange-950/40 dark:to-amber-950/40 shadow-xl ring-2 ring-yellow-100 dark:ring-yellow-900";
    }
    return "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300";
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
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          {/* Avatar with special styling for leaders */}
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
                <FiCheckCircle className="h-4 w-4 text-white" />
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
            <span className="text-2xl font-bold">
              {candidate.voteCount.toString()}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">votes</p>
        </div>
      </div>

      {/* Leading Indicator */}
      {isLeading && (
        <div className="mb-6 flex items-center justify-center">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2 rounded-xl">
            <div className="flex items-center space-x-2">
              <FiCheckCircle className="h-4 w-4 text-white" />
              <span className="text-sm font-bold text-white">
                Leading Candidate
              </span>
            </div>
          </div>
        </div>
      )}

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

      {/* About Preview */}
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
        className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 mb-6"
      >
        <FiEye className="h-4 w-4 text-gray-500" />
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
        <div className="space-y-6 mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600">
          {/* Campaign Photo */}
          {metadata.photoHash && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <FiImage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Campaign Photo
                </h4>
              </div>
              <div className="flex justify-center">
                <img
                  src={getIPFSUrl(metadata.photoHash)}
                  alt={`${candidate.name} campaign photo`}
                  className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-200 dark:border-gray-600 shadow-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Professional Background */}
          <div className="grid grid-cols-1 gap-4">
            {/* Education */}
            {metadata.education && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FiBookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Education Background
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
                  <FiBriefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Experience & Qualifications
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
                <FiTarget className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                  Campaign Manifesto
                </h4>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {metadata.manifesto}
                </p>
              </div>
            </div>
          )}

          {/* Supporting Documents */}
          {metadata.documentHash && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <FiFile className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
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
          <div className="bg-gray-100 dark:bg-gray-600 rounded-2xl p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Technical Information
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-gray-700 px-3 py-2 rounded-lg flex-1">
                    {formatAddress(candidate.candidateAddress)}
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

      {/* Vote Button */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
        {canVote ? (
          <button
            onClick={() => onVote(candidate.candidateAddress)}
            disabled={isVoting}
            className={`w-full flex items-center justify-center px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isLeading
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
            }`}
          >
            {isVoting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Voting...
              </>
            ) : (
              <>
                <MdHowToVote className="mr-3 h-5 w-5" />
                Vote for {candidate.name}
              </>
            )}
          </button>
        ) : (
          <div className="text-center py-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <FiUser className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Voting not available
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Leading Banner */}
      {isLeading && (
        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl text-center shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <FiCheckCircle className="h-5 w-5 text-white" />
            <p className="text-lg font-bold text-white">
              🏆 Currently Leading!
            </p>
            <FiCheckCircle className="h-5 w-5 text-white" />
          </div>
          <p className="text-white/90 text-sm mt-1">
            This candidate has the highest vote count
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateCard;
