import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiClock,
  FiCalendar,
  FiSave,
  FiRefreshCw,
  FiSettings,
  FiPlayCircle,
  FiStopCircle,
  FiCheckCircle,
  FiAlertTriangle,
  FiInfo,
  FiZap,
  FiUsers,
  FiShield,
} from "react-icons/fi";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
  formatTimestamp,
  getVotingStatus,
} from "../../utils/contract";
import toast from "react-hot-toast";

const VotingSettings = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState({
    startTime: "0",
    endTime: "0",
  });
  const [formData, setFormData] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  useEffect(() => {
    fetchCurrentSettings();
    // Set default times if no current settings
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (!formData.startDate) {
      setFormData((prev) => ({
        ...prev,
        startDate: tomorrow.toISOString().split("T")[0],
        startTime: "09:00",
        endDate: nextWeek.toISOString().split("T")[0],
        endTime: "18:00",
      }));
    }
  }, []);

  const fetchCurrentSettings = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      const [startTime, endTime] = await Promise.all([
        contractFunctions.getStartTime(contract),
        contractFunctions.getEndTime(contract),
      ]);

      setCurrentSettings({
        startTime: startTime.toString(),
        endTime: endTime.toString(),
      });

      // Convert timestamps to form format
      if (startTime.toString() !== "0") {
        const startDate = new Date(parseInt(startTime.toString()) * 1000);
        const startDateStr = startDate.toISOString().split("T")[0];
        const startTimeStr = startDate.toTimeString().slice(0, 5);
        setFormData((prev) => ({
          ...prev,
          startDate: startDateStr,
          startTime: startTimeStr,
        }));
      }

      if (endTime.toString() !== "0") {
        const endDate = new Date(parseInt(endTime.toString()) * 1000);
        const endDateStr = endDate.toISOString().split("T")[0];
        const endTimeStr = endDate.toTimeString().slice(0, 5);
        setFormData((prev) => ({
          ...prev,
          endDate: endDateStr,
          endTime: endTimeStr,
        }));
      }
    } catch (error) {
      console.error("Error fetching voting settings:", error);
      toast.error("Failed to load voting settings");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    if (
      !formData.startDate ||
      !formData.startTime ||
      !formData.endDate ||
      !formData.endTime
    ) {
      toast.error("Please fill in all date and time fields");
      return;
    }

    try {
      setSaving(true);

      // Convert form data to timestamps
      const startTimestamp = Math.floor(
        new Date(`${formData.startDate}T${formData.startTime}`).getTime() / 1000
      );
      const endTimestamp = Math.floor(
        new Date(`${formData.endDate}T${formData.endTime}`).getTime() / 1000
      );

      // Validation
      const now = Math.floor(Date.now() / 1000);
      if (startTimestamp <= now) {
        toast.error("Start time must be in the future");
        return;
      }

      if (endTimestamp <= startTimestamp) {
        toast.error("End time must be after start time");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      toast.loading("Setting voting period...");
      const tx = await contractFunctions.setVotingPeriod(
        contract,
        startTimestamp,
        endTimestamp
      );

      toast.loading("Waiting for confirmation...");
      await tx.wait();

      toast.success("Voting period set successfully!");
      await fetchCurrentSettings();
    } catch (error) {
      console.error("Error setting voting period:", error);
      toast.error(error.message || "Failed to set voting period");
    } finally {
      setSaving(false);
    }
  };

  const votingStatus = getVotingStatus(
    currentSettings.startTime,
    currentSettings.endTime
  );

  const getStatusConfig = (status) => {
    switch (status) {
      case "Active":
        return {
          icon: FiPlayCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-950/30",
          borderColor: "border-green-200 dark:border-green-800",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200",
          gradient: "from-green-500 to-emerald-500",
        };
      case "Ended":
        return {
          icon: FiStopCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200",
          gradient: "from-red-500 to-rose-500",
        };
      case "Upcoming":
        return {
          icon: FiClock,
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
          gradient: "from-amber-500 to-orange-500",
        };
      default:
        return {
          icon: FiSettings,
          color: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-gray-800",
          borderColor: "border-gray-200 dark:border-gray-700",
          badge:
            "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200",
          gradient: "from-gray-500 to-slate-500",
        };
    }
  };

  const statusConfig = getStatusConfig(votingStatus);
  const StatusIcon = statusConfig.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600 dark:text-gray-400">
            Loading voting settings...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl">
              <FiSettings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Voting Period Settings
              </h2>
              <p className="text-purple-700 dark:text-purple-300 mt-1">
                Configure and manage election timing
              </p>
            </div>
          </div>
          <button
            onClick={fetchCurrentSettings}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-xl text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 font-medium"
          >
            <FiRefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Current Status Dashboard */}
      <div
        className={`rounded-2xl p-6 border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${statusConfig.color}`}>
                Current Voting Status
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time election status monitoring
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`px-6 py-3 rounded-2xl text-lg font-bold ${statusConfig.badge}`}
            >
              {votingStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Start Time Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <FiPlayCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Voting Start
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTimestamp(currentSettings.startTime)}
              </p>
              {currentSettings.startTime !== "0" && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(
                    parseInt(currentSettings.startTime) * 1000
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* End Time Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <FiStopCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Voting End
              </h4>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatTimestamp(currentSettings.endTime)}
              </p>
              {currentSettings.endTime !== "0" && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(
                    parseInt(currentSettings.endTime) * 1000
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Status-specific information */}
        {votingStatus === "Active" && (
          <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-2">
              <FiZap className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-200">
                Voting is currently active! Voters can cast their ballots now.
              </span>
            </div>
          </div>
        )}

        {votingStatus === "Upcoming" && (
          <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <div className="flex items-center space-x-2">
              <FiClock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-800 dark:text-amber-200">
                Voting has not started yet. Ensure all setup is complete before
                the start time.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Settings Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
              <FiCalendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Configure New Voting Period
            </h3>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Start Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiPlayCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Voting Start Date & Time
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    step="60"
                    required
                  />
                </div>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FiStopCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Voting End Date & Time
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                    step="60"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl hover:from-purple-600 hover:to-indigo-600 focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Setting Period...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="h-5 w-5" />
                    <span>Set Voting Period</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Important Guidelines */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
            <FiAlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            Important Guidelines
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FiInfo className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Timing Requirements
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Start time must be in the future</li>
                  <li>• End time must be after start time</li>
                  <li>• All times are in your local timezone</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiShield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Security & Integrity
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Once voting starts, period cannot be modified</li>
                  <li>• Ensure blockchain connection is stable</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <FiUsers className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Pre-Election Checklist
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Approve all candidates before starting</li>
                  <li>• Verify all voter registrations</li>
                  <li>• Test voting functionality</li>
                </ul>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCheckCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Voting Access
                </h4>
                <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                  <li>• Voters can only vote during active period</li>
                  <li>• Late registrations won't be accepted</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotingSettings;
