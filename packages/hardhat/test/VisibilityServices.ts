import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, ZeroAddress } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import {
  VisibilityCredits,
  VisibilityCredits__factory,
  VisibilityServices,
  VisibilityServices__factory,
} from "../typechain-types";

describe("VisibilityServices", function () {
  let visibilityServicesFactory: VisibilityServices__factory;
  let visibilityServices: VisibilityServices;
  let visibilityCreditsFactory: VisibilityCredits__factory;
  let visibilityCredits: VisibilityCredits;
  let deployer: HardhatEthersSigner;
  let disputeResolver: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let creator: HardhatEthersSigner;

  beforeEach(async function () {
    // Deploy visibilityCreditsFactory contract
    [deployer, disputeResolver, user1, user2, creator] = await ethers.getSigners();
    visibilityCreditsFactory = await ethers.getContractFactory("VisibilityCredits");
    visibilityCredits = await visibilityCreditsFactory.deploy(deployer.address, deployer.address);
    await visibilityCredits.waitForDeployment();

    // Deploy visibilityServicesFactory contract
    visibilityServicesFactory = await ethers.getContractFactory("VisibilityServices");
    visibilityServices = await visibilityServicesFactory.deploy(
      await visibilityCredits.getAddress(),
      disputeResolver.address,
    );
    await visibilityServices.waitForDeployment();

    // Grant creator role to `creator`
    await visibilityCredits.connect(deployer).setCreatorVisibility("x-VitalikButerin", creator.address);
    await visibilityServices.connect(creator).createService("x-post", "x-VitalikButerin", 10);

    // Authorize visibilityServices to manage credits
    await visibilityCredits.grantCreatorTransferRole(await visibilityServices.getAddress());
  });

  describe("Deployment and Initial Setup", function () {
    it("Should deploy contracts correctly and set initial values", async function () {
      expect(await visibilityServices.visibilityCredits()).to.equal(await visibilityCredits.getAddress());
    });

    it("Should grant dispute resolver role correctly", async function () {
      const DISPUTE_RESOLVER_ROLE = await visibilityServices.DISPUTE_RESOLVER_ROLE();
      const hasRole = await visibilityServices.hasRole(DISPUTE_RESOLVER_ROLE, disputeResolver.address);
      expect(hasRole).to.equal(true);
    });
  });

  describe("Service Creation and Management", function () {
    it("Should create a service successfully", async function () {
      const service = await visibilityServices.services(0);

      expect(service.enabled).to.equal(true);
      expect(service.serviceType).to.equal("x-post");
      expect(service.visibilityId).to.equal("x-VitalikButerin");
      expect(service.creditsCostAmount).to.equal(10);
    });

    it("Should update a service successfully", async function () {
      await visibilityServices.connect(creator).updateService(0, false);
      const service = await visibilityServices.services(0);

      expect(service.enabled).to.equal(false);
    });

    it("Should revert if non-creator tries to create a service", async function () {
      await expect(visibilityServices.connect(user1).createService("x-post", "x-VitalikButerin", 10)).to.be.reverted;
    });

    it("Should revert if non-creator tries to update a service", async function () {
      await expect(visibilityServices.connect(user1).updateService(0, false)).to.be.reverted;
    });

    it("Should revert with invalid service nonce", async function () {
      await expect(visibilityServices.connect(creator).updateService(1, false)).to.be.reverted;
    });
  });

  describe("Service Execution Flow", function () {
    beforeEach(async function () {
      await visibilityCredits
        .connect(user1)
        .buyCredits("x-VitalikButerin", 50, ZeroAddress, { value: parseEther("1") });
    });

    it("Should request service execution successfully", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      const [state, requester] = await visibilityServices.getServiceExecution(0, 0);

      expect(state).to.equal(1); // REQUESTED
      expect(requester).to.equal(user1.address);

      const user1BalanceAfter = await visibilityCredits.getVisibilityCreditBalance("x-VitalikButerin", user1.address);
      expect(user1BalanceAfter).to.be.equal(40); // Ensure user1 received the refund
    });

    it("Should not allow requesting execution on a disabled service", async function () {
      await visibilityServices.connect(creator).updateService(0, false);
      await expect(visibilityServices.connect(user1).requestServiceExecution(0, "Request Data")).to.be.reverted;
    });

    it("Should revert if the user does not have enough credits for execution", async function () {
      await visibilityCredits.connect(user2).buyCredits("x-VitalikButerin", 1, ZeroAddress, { value: parseEther("1") });
      await expect(visibilityServices.connect(user2).requestServiceExecution(0, "Request Data")).to.be.reverted;
    });

    it("Should accept a service execution correctly", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      const [state] = await visibilityServices.getServiceExecution(0, 0);

      expect(state).to.equal(2); // ACCEPTED
    });

    it("Should revert if a non-creator tries to accept execution", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await expect(visibilityServices.connect(user2).acceptServiceExecution(0, 0, "Response Data")).to.be.reverted;
    });

    it("Should validate a service execution correctly by the requester", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      await visibilityServices.connect(user1).validateServiceExecution(0, 0);
      const [state] = await visibilityServices.getServiceExecution(0, 0);

      expect(state).to.equal(5); // VALIDATED
    });

    it("Should automatically validate a service after the delay", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");

      // Simulate passing of AUTO_VALIDATION_DELAY
      await ethers.provider.send("evm_increaseTime", [5 * 24 * 60 * 60 + 1]); // 5 days + 1 second
      await ethers.provider.send("evm_mine");

      await visibilityServices.connect(user2).validateServiceExecution(0, 0);
      const [state] = await visibilityServices.getServiceExecution(0, 0);

      expect(state).to.equal(5); // VALIDATED

      const creatorBalanceAfter = await visibilityCredits.getVisibilityCreditBalance(
        "x-VitalikButerin",
        creator.address,
      );
      expect(creatorBalanceAfter).to.be.equal(10); // Ensure user1 received the refund
    });

    it("Should dispute a service execution correctly", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      await visibilityServices.connect(user1).disputeServiceExecution(0, 0, "Dispute Data");

      const [state] = await visibilityServices.getServiceExecution(0, 0);

      expect(state).to.equal(3); // DISPUTED
    });

    it("Should revert if a non-requester tries to dispute an execution", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      await expect(visibilityServices.connect(user2).disputeServiceExecution(0, 0, "Dispute Data")).to.be.reverted;
    });

    it("Should resolve a dispute and refund correctly", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      await visibilityServices.connect(user1).disputeServiceExecution(0, 0, "Dispute Data");
      await visibilityServices.connect(disputeResolver).resolveServiceExecution(0, 0, true, "Resolved with Refund");

      const [state] = await visibilityServices.getServiceExecution(0, 0);
      expect(state).to.equal(4); // REFUNDED

      // Verify the refund process
      const user1BalanceAfter = await visibilityCredits.getVisibilityCreditBalance("x-VitalikButerin", user1.address);
      expect(user1BalanceAfter).to.be.equal(50); // Ensure user1 received the refund
    });

    it("Should resolve a dispute with validation", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");

      const user1BalanceBefore = await visibilityCredits.getVisibilityCreditBalance("x-VitalikButerin", user1.address);

      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      await visibilityServices.connect(user1).disputeServiceExecution(0, 0, "Dispute Data");
      await visibilityServices.connect(disputeResolver).resolveServiceExecution(0, 0, false, "Resolved without Refund");

      const [state] = await visibilityServices.getServiceExecution(0, 0);
      expect(state).to.equal(5); // VALIDATED

      const creatorBalanceAfter = await visibilityCredits.getVisibilityCreditBalance(
        "x-VitalikButerin",
        creator.address,
      );
      expect(creatorBalanceAfter).to.equal(10);

      // Verify that credits were not returned to the user
      const user1BalanceAfter = await visibilityCredits.getVisibilityCreditBalance("x-VitalikButerin", user1.address);
      expect(user1BalanceAfter).to.equal(user1BalanceBefore);
    });

    it("Should revert if non-resolver tries to resolve a dispute", async function () {
      await visibilityServices.connect(user1).requestServiceExecution(0, "Request Data");
      await visibilityServices.connect(creator).acceptServiceExecution(0, 0, "Response Data");
      await visibilityServices.connect(user1).disputeServiceExecution(0, 0, "Dispute Data");
      await expect(visibilityServices.connect(user2).resolveServiceExecution(0, 0, true, "Unauthorized resolution")).to
        .be.reverted;
    });
  });
});
