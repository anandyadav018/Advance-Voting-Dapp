import React, { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { ethers } from "ethers";
import {
  FiUser,
  FiUpload,
  FiCheck,
  FiAlertCircle,
  FiFileText,
  FiCamera,
  FiFile,
  FiInfo,
  FiClock,
  FiX,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiSave,
} from "react-icons/fi";
import DashboardLayout from "../components/Layout/DashboardLayout";
import {
  getContract,
  getContractWithSigner,
  contractFunctions,
  parseApprovalStatus,
} from "../utils/contract";
import { uploadToIPFS, uploadFileToIPFS } from "../utils/ipfs";
import toast from "react-hot-toast";

const RegisterVoter = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [voterData, setVoterData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    age: "",
    nationality: "",
    occupation: "",
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

      const voter = await contractFunctions.getVoter(contract, address);

      // Check if voter exists (address is not zero address)
      if (voter.voterAddress !== "0x0000000000000000000000000000000000000000") {
        setVoterData(voter);
        // Pre-fill form with existing data if available
        setFormData({
          name: voter.name || "",
          description: "",
          age: "",
          nationality: "",
          occupation: "",
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
        age: formData.age,
        nationality: formData.nationality,
        occupation: formData.occupation,
        photoHash: photoHash,
        documentHash: documentHash,
        registeredAt: new Date().toISOString(),
        walletAddress: address,
      };

      // Upload metadata to IPFS
      const ipfsHash = await uploadToIPFS(metadata);
      toast.loading("Registering on blockchain...", { id: uploadProgress });

      // Register voter on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      const tx = await contractFunctions.registerVoter(
        contract,
        formData.name,
        ipfsHash
      );

      toast.loading("Waiting for confirmation...", { id: uploadProgress });
      await tx.wait();

      toast.success("Voter registration submitted successfully!", {
        id: uploadProgress,
      });

      // Refresh data
      await checkExistingRegistration();

      // Reset form
      setFormData({
        name: "",
        description: "",
        age: "",
        nationality: "",
        occupation: "",
      });
      setFiles({ photo: null, document: null });
      setFilePreviews({ photo: null, document: null });
    } catch (error) {
      console.error("Error registering voter:", error);
      toast.error(error.message || "Failed to register voter");
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

      const updateProgress = toast.loading("Updating voter information...");

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
        age: formData.age,
        nationality: formData.nationality,
        occupation: formData.occupation,
        ...(photoHash && { photoHash }),
        ...(documentHash && { documentHash }),
        updatedAt: new Date().toISOString(),
        walletAddress: address,
      };

      // Upload metadata to IPFS
      const ipfsHash = await uploadToIPFS(metadata);

      // Update voter on blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContractWithSigner(signer);

      const tx = await contractFunctions.updateVoter(
        contract,
        formData.name,
        ipfsHash
      );

      toast.loading("Waiting for confirmation...", { id: updateProgress });
      await tx.wait();

      toast.success("Voter information updated successfully!", {
        id: updateProgress,
      });
      setIsEditing(false);

      // Refresh data
      await checkExistingRegistration();
    } catch (error) {
      console.error("Error updating voter:", error);
      toast.error(error.message || "Failed to update voter information");
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
      <DashboardLayout title="Register as Voter">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">
            Checking registration status...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Register as Voter">
      <div className="flex flex-col max-w-6xl mx-auto space-y-8">
        {/* Registration Status */}
        {voterData && (
          <div className="flex-shrink-0">
            {(() => {
              const config = getStatusConfig(voterData.status);
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
                          {parseApprovalStatus(voterData.status)}
                        </h3>
                        {parseApprovalStatus(voterData.status) ===
                          "Rejected" && (
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          >
                            <FiEdit3 className="mr-2 h-4 w-4" />
                            {isEditing ? "Cancel Edit" : "Edit Info"}
                          </button>
                        )}
                      </div>
                      <p className={`mt-2 ${config.textColor} opacity-80`}>
                        {voterData.message}
                      </p>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                          className={`p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <p className="text-sm font-medium">Name</p>
                          <p
                            className={`text-lg font-semibold ${config.textColor}`}
                          >
                            {voterData.name}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <p className="text-sm font-medium">Register ID</p>
                          <p
                            className={`text-lg font-semibold ${config.textColor}`}
                          >
                            #{voterData.registerId.toString()}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-lg ${config.bgColor} bg-opacity-50`}
                        >
                          <p className="text-sm font-medium">Voting Status</p>
                          <p
                            className={`text-lg font-semibold ${config.textColor}`}
                          >
                            {voterData.hasVoted ? "Voted" : "Not Voted"}
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
        {(!voterData || isEditing) && (
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <FiUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {voterData ? "Update Voter Information" : "Register as Voter"}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {voterData
                    ? "Modify your registration details"
                    : "Join the democratic process"}
                </p>
              </div>
            </div>

            <form
              onSubmit={voterData ? handleUpdate : handleSubmit}
              className="space-y-6"
            >
              {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiUser className="mr-2 h-5 w-5 text-blue-500" />
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your age"
                      min="18"
                      max="120"
                    />
                  </div>

                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your nationality"
                    />
                  </div>

                  {/* Occupation */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                      placeholder="Enter your occupation"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      About You
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200 resize-none"
                      placeholder="Tell us about yourself (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FiUpload className="mr-2 h-5 w-5 text-blue-500" />
                  Required Documents
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Profile Photo *
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                        dragActive.photo
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                      onDragEnter={(e) => handleDrag(e, "photo")}
                      onDragLeave={(e) => handleDrag(e, "photo")}
                      onDragOver={(e) => handleDrag(e, "photo")}
                      onDrop={(e) => handleDrop(e, "photo")}
                    >
                      <input
                        type="file"
                        id="photo"
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
                            Drop your photo here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Identity Document (PDF) *
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
                        dragActive.document
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                      }`}
                      onDragEnter={(e) => handleDrag(e, "document")}
                      onDragLeave={(e) => handleDrag(e, "document")}
                      onDragOver={(e) => handleDrag(e, "document")}
                      onDrop={(e) => handleDrop(e, "document")}
                    >
                      <input
                        type="file"
                        id="document"
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
                            Drop your PDF here, or click to browse
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF up to 10MB
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
                    (!voterData && (!files.photo || !files.document))
                  }
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {voterData ? "Updating..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      {voterData ? (
                        <FiSave className="mr-2 h-5 w-5" />
                      ) : (
                        <FiUpload className="mr-2 h-5 w-5" />
                      )}
                      {voterData ? "Update Information" : "Register as Voter"}
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

        {/* Information Card */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-start space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex-shrink-0">
              <FiInfo className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                Important Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your registration will be reviewed by the admin before
                      approval
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      All information and files are stored securely on IPFS
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Photo and identity document (PDF) are required for
                      verification
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      You can update your information at any time
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Only approved voters can participate in elections
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your wallet address will be linked to your voter
                      registration
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Ensure all uploaded documents are clear and readable
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <FiCheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Registration is free and secure using blockchain
                      technology
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
                      Security & Privacy
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your data is encrypted and stored on IPFS, ensuring
                      maximum security and transparency. Only you and authorized
                      admins can access your information.
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

export default RegisterVoter;
