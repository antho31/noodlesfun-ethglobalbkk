import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther, ZeroAddress } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { VisibilityCredits, VisibilityCredits__factory } from "../typechain-types";

describe("VisibilityCredits", function () {
  const visibilityId1 = "x-VitalikButerin";

  let creditsContract: VisibilityCredits;
  let creator1: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;
  let creatorLinker: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;
  let referrer: HardhatEthersSigner;

  beforeEach(async function () {
    [creator1, user1, user2, creatorLinker, treasury, referrer] = await ethers.getSigners();

    const creditsContractFactory: VisibilityCredits__factory = await ethers.getContractFactory("VisibilityCredits");
    creditsContract = await creditsContractFactory.deploy(treasury.address, creatorLinker.address);
    await creditsContract.waitForDeployment();

    await creditsContract.connect(creatorLinker).setCreatorVisibility(visibilityId1, creator1.address);
  });

  describe("Initial Setup", function () {
    it("Should set the correct protocol treasury", async function () {
      expect(await creditsContract.protocolTreasury()).to.be.equal(treasury.address);
    });

    it("Should assign creatorLinker the CREATORS_CHECKER_ROLE", async function () {
      const role = await creditsContract.CREATORS_CHECKER_ROLE();
      expect(await creditsContract.hasRole(role, creatorLinker.address)).to.be.equal(true);
    });
  });

  describe("Buying Credits", function () {
    it("Should allow users to buy credits and update their balance", async function () {
      const amount = 1;
      const [buyCost] = await creditsContract.buyCostWithFees(visibilityId1, amount, referrer);

      await creditsContract.connect(user1).buyCredits(visibilityId1, amount, referrer, { value: buyCost });

      const balance = await creditsContract.getVisibilityCreditBalance(visibilityId1, user1.address);
      expect(balance).to.be.equal(amount);
    });

    it("Should revert if insufficient Ether is sent", async function () {
      const amount = 1;
      const [buyCost] = await creditsContract.buyCostWithFees(visibilityId1, amount, referrer);

      await expect(
        creditsContract.connect(user1).buyCredits(visibilityId1, amount, ZeroAddress, { value: buyCost - BigInt(1) }),
      ).to.be.reverted;
    });

    it("Should handle multiple purchases and update balances and protocol fees correctly", async function () {
      const amounts = [2, 4, 1];
      for (const amount of amounts) {
        const [buyCost, tradeCost, creatorFee, protocolFee, referrerFee] = await creditsContract.buyCostWithFees(
          visibilityId1,
          amount,
          referrer.address,
        );
        await expect(
          creditsContract.connect(user1).buyCredits(visibilityId1, amount, referrer.address, { value: buyCost }),
        ).to.changeEtherBalances(
          [user1, creditsContract, treasury, referrer],
          [-buyCost, tradeCost + creatorFee, protocolFee, referrerFee],
        );
      }
    });
  });

  describe("Selling Credits", function () {
    it("Should allow users to sell credits and receive Ether", async function () {
      const amount = 1;
      const [buyCost] = await creditsContract.buyCostWithFees(visibilityId1, amount, referrer);

      await creditsContract.connect(user1).buyCredits(visibilityId1, amount, referrer, { value: buyCost });
      await creditsContract.connect(user1).sellCredits(visibilityId1, amount, referrer);

      const balance = await creditsContract.getVisibilityCreditBalance(visibilityId1, user1.address);
      expect(balance).to.be.equal(0);
    });

    it("Should revert if user tries to sell more credits than they own", async function () {
      await expect(creditsContract.connect(user1).sellCredits(visibilityId1, parseEther("1"), ZeroAddress)).to.be
        .reverted;
    });

    it("Should handle multiple sells and verify balances and fees are updated correctly", async function () {
      const buyAmount = 6;
      const [buyCost] = await creditsContract.buyCostWithFees(visibilityId1, buyAmount, referrer);

      await creditsContract.connect(user2).buyCredits(visibilityId1, buyAmount, referrer, { value: buyCost });

      const sellAmounts = [2, 1, 3];
      for (const amount of sellAmounts) {
        const [reimbursement, , , protocolFee, referrerFee] = await creditsContract.sellCostWithFees(
          visibilityId1,
          amount,
          referrer.address,
        );
        await expect(
          creditsContract.connect(user2).sellCredits(visibilityId1, amount, referrer.address),
        ).to.changeEtherBalances(
          [user2, creditsContract, treasury, referrer],
          [reimbursement, -reimbursement - protocolFee - referrerFee, protocolFee, referrerFee],
        );
      }
    });
  });

  describe("Fee Claiming and Treasury Update", function () {
    it("Should allow the creator to claim accumulated fees", async function () {
      const amount = 3;
      const [buyCost] = await creditsContract.buyCostWithFees(visibilityId1, amount, referrer);

      await creditsContract.connect(user1).buyCredits(visibilityId1, amount, referrer, { value: buyCost });

      const initialCreatorBalance = await ethers.provider.getBalance(creator1.address);
      await creditsContract.connect(creator1).claimCreatorFee(visibilityId1);
      const finalCreatorBalance = await ethers.provider.getBalance(creator1.address);

      expect(finalCreatorBalance).to.be.gt(initialCreatorBalance);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero and minimal buy/sell amounts appropriately", async function () {
      const zeroAmount = 0;
      await expect(
        creditsContract
          .connect(user1)
          .buyCredits(visibilityId1, zeroAmount, referrer.address, { value: parseEther("0.1") }),
      ).to.be.reverted;

      const minimalAmount = 1;
      const [buyCost, tradeCost, creatorFee1] = await creditsContract.buyCostWithFees(
        visibilityId1,
        minimalAmount,
        referrer,
      );
      await expect(
        creditsContract.connect(user1).buyCredits(visibilityId1, minimalAmount, referrer.address, { value: buyCost }),
      ).to.changeEtherBalances([user1, creditsContract], [-buyCost, tradeCost + creatorFee1]);

      const [reimbursement, , creatorFee2, protocolFee, referrerFee] = await creditsContract.sellCostWithFees(
        visibilityId1,
        minimalAmount,
        referrer.address,
      );
      await expect(
        creditsContract.connect(user1).sellCredits(visibilityId1, minimalAmount, referrer.address),
      ).to.changeEtherBalances(
        [user1, creditsContract, treasury, referrer],
        [reimbursement, -reimbursement - protocolFee - referrerFee, protocolFee, referrerFee],
      );
      expect(await creditsContract.getVisibilityCreditBalance(visibilityId1, user2.address)).to.be.equal(0);
      await expect(creditsContract.connect(creator1).claimCreatorFee(visibilityId1)).to.changeEtherBalances(
        [creator1, creditsContract],
        [creatorFee1 + creatorFee2, -(creatorFee1 + creatorFee2)],
      );
    });
  });

  describe("Role Management", function () {
    it("Should allow admin to grant and revoke roles", async function () {
      await creditsContract.connect(creator1).grantCreatorTransferRole(user1.address);
      const role = await creditsContract.CREDITS_TRANSFER_ROLE();
      expect(await creditsContract.hasRole(role, user1.address)).to.be.equal(true);

      await creditsContract.connect(creator1).revokeRole(role, user1.address);
      expect(await creditsContract.hasRole(role, user1.address)).to.be.equal(false);
    });
  });
});
