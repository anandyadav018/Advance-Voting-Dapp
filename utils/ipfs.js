import axios from "axios";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

// Upload JSON metadata to IPFS via Pinata
export const uploadToIPFS = async (metadata) => {
  try {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

    const data = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name || "metadata"}-${Date.now()}`,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    };

    const response = await axios.post(url, data, { headers });

    if (response.data && response.data.IpfsHash) {
      return response.data.IpfsHash;
    } else {
      throw new Error("Failed to upload to IPFS");
    }
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
};

// Upload file to IPFS via Pinata
export const uploadFileToIPFS = async (file) => {
  try {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({
      name: `${file.name}-${Date.now()}`,
    });
    formData.append("pinataMetadata", metadata);

    const headers = {
      Authorization: `Bearer ${PINATA_JWT}`,
    };

    const response = await axios.post(url, formData, { headers });

    if (response.data && response.data.IpfsHash) {
      return response.data.IpfsHash;
    } else {
      throw new Error("Failed to upload file to IPFS");
    }
  } catch (error) {
    console.error("Error uploading file to IPFS:", error);
    throw error;
  }
};

// Fetch data from IPFS
export const fetchFromIPFS = async (hash) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${hash}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    // Fallback to other gateways
    try {
      const fallbackUrl = `https://ipfs.io/ipfs/${hash}`;
      const response = await axios.get(fallbackUrl);
      return response.data;
    } catch (fallbackError) {
      console.error(
        "Error fetching from fallback IPFS gateway:",
        fallbackError
      );
      throw fallbackError;
    }
  }
};

// Get IPFS URL for display
export const getIPFSUrl = (hash) => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};
