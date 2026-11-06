import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiFileText,
  FiTarget,
  FiCamera,
  FiFile,
  FiInfo,
  FiClock,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiSave,
  FiAward,
  FiBook,
  FiFlag,
  FiMic,
} from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";

import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
  parseApprovalStatus,
} from "../utils/contract";
import { uploadToIPFS, uploadFileToIPFS } from "../utils/ipfs";
import toast from "react-hot-toast";

const RegisterCandidate = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [candidateData, setCandidateData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    manifesto: "",
    experience: "",
    education: "",
    party: "",
    slogan: "",
  });
  const [files, setFiles] = useState({
    photo: null,
    document: null,
  });
  const [filePreviews, setFilePreviews] = useState({
    photo: null,
    document: null,
  });
  const [dragActive, setDragActive] = useState({
    photo: false,
    document: false,
  });

  useEffect(() => {
    if (isConnected && address) {
      checkExistingRegistration();
    }
  }, [isConnected, address]);

  const checkExistingRegistration = async () => {
    try {
      setChecking(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = getContract(provider);

      const candidate = await contractFunctions.getCandidate(contract, address);

      // Check if candidate exists (address is not zero address)
      if (
        candidate.candidateAddress !==
        "0x0000000000000000000000000000000000000000"
      ) {
        setCandidateData(candidate);
        // Pre-fill form with existing data if available
        setFormData({
          name: candidate.name || "",
          description: "",
          manifesto: "",
          experience: "",
          education: "",
          party: "",
          slogan: "",
        });
      }
    } catch (error) {
      console.error("Error checking registration:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDrag = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive((prev) => ({ ...prev, [fileType]: true }));
    } else if (e.type === "dragleave") {
      setDragActive((prev) => ({ ...prev, [fileType]: false }));
    }
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive((prev) => ({ ...prev, [fileType]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0], fileType);
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;
    handleFileSelection(file, fileType);
  };

  const handleFileSelection = (file, fileType) => {
    // Validate file types
    if (fileType === "photo") {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file (JPG, PNG, etc.)");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo file size must be less than 5MB");
        return;
      }
    } else if (fileType === "document") {
      if (file.type !== "application/pdf") {
        toast.error("Please select a valid PDF document");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Document file size must be less than 10MB");
        return;
      }
    }

    setFiles((prev) => ({
      ...prev,
      [fileType]: file,
    }));

    // Create preview for images
    if (fileType === "photo" && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviews((prev) => ({
          ...prev,
          photo: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    } else if (fileType === "document") {
      setFilePreviews((prev) => ({
        ...prev,
        document: file.name,
      }));
    }

    toast.success(
      `${fileType === "photo" ? "Photo" : "Document"} uploaded successfully!`
    );
  };

  const removeFile = (fileType) => {
    setFiles((prev) => ({
      ...prev,
      [fileType]: null,
    }));
    setFilePreviews((prev) => ({
      ...prev,
      [fileType]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!files.photo) {
      toast.error("Photo is required");
      return;
    }

    if (!files.document) {
      toast.error("Document is required");
      return;
    }

    try {
      setLoading(true);

      // Upload files to IPFS with progress indicators
      const uploadProgress = toast.loading("Uploading files to IPFS...");

      const photoHash = await uploadFileToIPFS(files.photo);
      toast.loading("Uploading document to IPFS...", { id: uploadProgress });

      const documentHash = await uploadFileToIPFS(files.document);
      toast.loading("Creating metadata...", { id: uploadProgress });

      // Create metadata object
      const metadata = {
        name: formData.name,
        description: formData.description,
        manifesto: formData.manifesto,
        experience: formData.experience,
        education: formData.education,
        party: formData.party,
        slogan: formData.slogan,
        photoHash: photoHash,
        documentHash: documentHash,
        registeredAt: new Date().toISOString(),
        walletAddress: address,
      };

      // Upload metadata to IPFS
      const ipfsHash = await uploadToIPFS(metadata);
      toast.loading("Registering on blockchain...", { id: uploadProgress });

      // Register candidate on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      const tx = await contractFunctions.registerCandidate(
        contract,
        formData.name,
        ipfsHash
      );

      toast.loading("Waiting for confirmation...", { id: uploadProgress });
      await tx.wait();

      toast.success("Candidate registration submitted successfully!", {
        id: uploadProgress,
      });

      // Refresh data
      await checkExistingRegistration();

      // Reset form
      setFormData({
        name: "",
        description: "",
        manifesto: "",
        experience: "",
        education: "",
        party: "",
        slogan: "",
      });
      setFiles({ photo: null, document: null });
      setFilePreviews({ photo: null, document: null });
    } catch (error) {
      console.error("Error registering candidate:", error);
      toast.error(error.message || "Failed to register candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!walletClient) {
      toast.error("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);

      let photoHash = "";
      let documentHash = "";

      const updateProgress = toast.loading("Updating candidate information...");

      // Upload new files if selected
      if (files.photo) {
        photoHash = await uploadFileToIPFS(files.photo);
      }

      if (files.document) {
        documentHash = await uploadFileToIPFS(files.document);
      }

      // Create updated metadata
      const metadata = {
        name: formData.name,
        description: formData.description,
        manifesto: formData.manifesto,
        experience: formData.experience,
        education: formData.education,
        party: formData.party,
        slogan: formData.slogan,
        ...(photoHash && { photoHash }),
        ...(documentHash && { documentHash }),
        updatedAt: new Date().toISOString(),
        walletAddress: address,
      };

      // Upload metadata to IPFS
      const ipfsHash = await uploadToIPFS(metadata);

      // Update candidate on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      const tx = await contractFunctions.updateCandidate(
        contract,
        formData.name,
        ipfsHash
      );

      toast.loading("Waiting for confirmation...", { id: updateProgress });
      await tx.wait();

      toast.success("Candidate information updated successfully!", {
        id: updateProgress,
      });
      setIsEditing(false);

      // Refresh data
      await checkExistingRegistration();
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast.error(error.message || "Failed to update candidate information");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const parsedStatus = parseApprovalStatus(status);
    switch (parsedStatus) {
      case "Approved":
        return {
          icon: FiCheckCircle,
          color: "green",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800",
          textColor: "text-green-800 dark:text-green-200",
          iconColor: "text-green-600 dark:text-green-400",
        };
      case "Rejected":
        return {
          icon: FiXCircle,
          color: "red",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800",
          textColor: "text-red-800 dark:text-red-200",
          iconColor: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          icon: FiClock,
          color: "amber",
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          borderColor: "border-amber-200 dark:border-amber-800",
          textColor: "text-amber-800 dark:text-amber-200",
          iconColor: "text-amber-600 dark:text-amber-400",
        };
    }
  };

  if (checking) {
    return (
      <DashboardLayout title="Register as Candidate">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 rounded-full animate-spin border-t-purple-600 dark:border-t-purple-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Checking registration status...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Register as Candidate">
      <div className="flex flex-col max-w-6xl mx-auto space-y-8">
        {/* Registration Status */}
        {candidateData && (
          <div className="flex-shrink-0">
            {(() => {
              const config = getStatusConfig(candidateData.status);
              const StatusIcon = config.icon;
              return (
                <div
                  className={`rounded-2xl p-6 border ${config.bgColor} ${config.borderColor}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`p-3 rounded-xl ${config.bgColor}`}>
                        <StatusIcon className={`h-6 w-6 ${config.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-xl font-bold ${config.textColor}`}>
                          Registration Status:{" "}
                          {parseApprovalStatus(candidateData.status)}
                        </h3>
                        {parseApprovalStatus(candidateData.status) ===
                          "Approved" && (
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                          >
                            <FiEdit3 className="mr-2 h-4 w-4" />
                            {isEditing ? "Cancel Edit" : "Edit Info"}
                          </button>
                        )}
                      </div>
                      <p className={`mt-2 ${config.textColor} opacity-80`}>
                        {candidateData.message}
                      </p>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                          className={`p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <p className="text-sm font-medium">Name</p>
                          <p
                            className={`text-lg font-semibold ${config.textColor}`}
                          >
                            {candidateData.name}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <p className="text-sm font-medium">Register ID</p>
                          <p
                            className={`text-lg font-semibold ${config.textColor}`}
                          >
                            #{candidateData.registerId.toString()}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <p className="text-sm font-medium">Vote Count</p>
                          <p
                            className={`text-lg font-semibold ${config.textColor}`}
                          >
                            {candidateData.voteCount.toString()} votes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Registration Form */}
        {(!candidateData || isEditing) && (
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <TfiCrown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {candidateData
                    ? "Update Candidate Information"
                    : "Register as Candidate"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {candidateData
                    ? "Modify your campaign details"
                    : "Join the election as a candidate"}
                </p>
              </div>
            </div>

            <form
              onSubmit={candidateData ? handleUpdate : handleSubmit}
              className="space-y-8"
            >
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <TfiCrown className="mr-2 h-5 w-5 text-purple-500" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Party */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiFlag className="inline mr-1 h-4 w-4" />
                      Political Party / Affiliation
                    </label>
                    <input
                      type="text"
                      name="party"
                      value={formData.party}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your party or run as independent"
                    />
                  </div>

                  {/* Slogan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMic className="inline mr-1 h-4 w-4" />
                      Campaign Slogan
                    </label>
                    <input
                      type="text"
                      name="slogan"
                      value={formData.slogan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your campaign slogan"
                    />
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      About You
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                      placeholder="Tell voters about yourself"
                    />
                  </div>
                </div>
              </div>

              {/* Background Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiBook className="mr-2 h-5 w-5 text-purple-500" />
                  Background & Qualifications
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Education Background
                    </label>
                    <textarea
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                      placeholder="Describe your educational background"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiAward className="inline mr-1 h-4 w-4" />
                      Experience & Qualifications
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                      placeholder="Describe your relevant experience and qualifications"
                    />
                  </div>

                  {/* Manifesto */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiTarget className="inline mr-1 h-4 w-4" />
                      Campaign Manifesto
                    </label>
                    <textarea
                      name="manifesto"
                      value={formData.manifesto}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                      placeholder="Describe your goals, policies, and what you plan to achieve if elected"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiUpload className="mr-2 h-5 w-5 text-purple-500" />
                  Required Documents
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Campaign Photo *
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                        dragActive.photo
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                      }`}
                      onDragEnter={(e) => handleDrag(e, "photo")}
                      onDragLeave={(e) => handleDrag(e, "photo")}
                      onDragOver={(e) => handleDrag(e, "photo")}
                      onDrop={(e) => handleDrop(e, "photo")}
                    >
                      <input
                        type="file"
                        id="candidate-photo"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "photo")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {filePreviews.photo ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={filePreviews.photo}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-xl border border-gray-300 dark:border-gray-600 mb-3"
                          />
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                              {files.photo?.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile("photo")}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                            >
                              <FiX className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
                            <FiCamera className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Drop your campaign photo here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Professional photo • JPG, PNG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Supporting Documents (PDF) *
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                        dragActive.document
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                      }`}
                      onDragEnter={(e) => handleDrag(e, "document")}
                      onDragLeave={(e) => handleDrag(e, "document")}
                      onDragOver={(e) => handleDrag(e, "document")}
                      onDrop={(e) => handleDrop(e, "document")}
                    >
                      <input
                        type="file"
                        id="candidate-document"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, "document")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />

                      {filePreviews.document ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-xl mb-4">
                            <FiFile className="h-8 w-8 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <FiCheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600 dark:text-green-400 font-medium truncate max-w-[150px]">
                              {filePreviews.document}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFile("document")}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors duration-200"
                            >
                              <FiX className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center">
                          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl mb-4">
                            <FiFile className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Drop your documents here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Certificates, resume, etc. • PDF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name.trim() ||
                    (!candidateData && (!files.photo || !files.document))
                  }
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-indigo-600 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {candidateData ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      {candidateData ? (
                        <FiSave className="mr-2 h-5 w-5" />
                      ) : (
                        <FiUpload className="mr-2 h-5 w-5" />
                      )}
                      {candidateData
                        ? "Update Information"
                        : "Register as Candidate"}
                    </>
                  )}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Guidelines Card */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex-shrink-0">
              <FiTarget className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-4">
                Candidate Guidelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Your candidacy will be reviewed by the admin before
                      approval
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Provide detailed information about your background and
                      goals
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      All information and files are stored securely on IPFS
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Professional photo and supporting documents (PDF) are
                      required
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      You can update your information at any time before voting
                      begins
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Only approved candidates can receive votes
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Be honest and transparent in your manifesto and
                      qualifications
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Ensure all uploaded documents are clear and professional
                    </p>
                  </div>
                </div>
              </div>

              {/* Campaign Tips */}
              <div className="mt-6 p-4 bg-purple-100 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-start space-x-3">
                  <TfiCrown className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                      Campaign Tips
                    </h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      Write a compelling manifesto that clearly outlines your
                      vision and policies. Include specific goals and how you
                      plan to achieve them. Your background and experience
                      should demonstrate your capability to serve effectively.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RegisterCandidate;
