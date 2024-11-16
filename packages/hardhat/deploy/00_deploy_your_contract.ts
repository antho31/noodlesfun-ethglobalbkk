import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys contracts using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployment: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployerBalance = await hre.ethers.provider.getBalance(deployer);
  console.log(
    "Ready to deploy to ",
    hre.network.name,
    "with deployer : ",
    deployer,
    "Balance: ",
    deployerBalance.toString(),
  );

  await deploy("VisibilityCredits", {
    from: deployer,
    args: [deployer, deployer],
    log: true,
  });

  const visibilityCredits = await hre.ethers.getContract<Contract>("VisibilityCredits", deployer);
  await visibilityCredits.waitForDeployment();

  const visibilityCreditsAddress = await visibilityCredits.getAddress();
  //   "0x8209a3aE55404AD1C7a976Df37de3c53e56Bd4bE";

  console.log("VisibilityCredits deployed to:", visibilityCreditsAddress);

  await deploy("VisibilityServices", {
    from: deployer,
    args: [visibilityCreditsAddress, deployer],
    log: true,
  });

  const visibilityServices = await hre.ethers.getContract<Contract>("VisibilityServices", deployer);
  await visibilityServices.waitForDeployment();

  const visibilityServicesAddress = await visibilityServices.getAddress();
  console.log("VisibilityServices deployed to:", visibilityServicesAddress);

  const tx = await visibilityCredits.grantCreatorTransferRole(visibilityServicesAddress);
  await tx.wait();
  console.log("CreatorTransferRole granted to:", visibilityServicesAddress);

  await hre.run("verify:verify", {
    address: visibilityCreditsAddress,
    constructorArguments: [deployer, deployer],
  });

  await hre.run("verify:verify", {
    address: visibilityServicesAddress,
    constructorArguments: [visibilityCreditsAddress, deployer],
  });
};

export default deployment;
