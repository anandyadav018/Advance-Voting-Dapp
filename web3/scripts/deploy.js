const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Check if we're on Mainnet network
  const network = await hre.ethers.provider.getNetwork();
  //TOKEN ICO CONTRACT

  // Deploy VotingDapp Contract
  console.log("\nDeploying VotingDapp contract...");
  const VotingDapp = await hre.ethers.getContractFactory("VotingDapp");
  const votingDapp = await VotingDapp.deploy();

  await votingDapp.deployed();

  console.log("\nDeployment Successful!");
  console.log("------------------------");
  console.log("NEXT_PUBLIC_VotingDapp_ADDRESS:", votingDapp.address);
  console.log("NEXT_PUBLIC_OWNER_ADDRESS:", deployer.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
