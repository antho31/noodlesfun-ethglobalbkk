// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IVisibilityCredits.sol";

/**
 * @title VisibilityCredits
 * @notice Allows users to buy and sell visibility credits along a bonding curve.
 * @dev Users can spend these credits for ad purposes.
 */
contract VisibilityCredits is
	IVisibilityCredits,
	AccessControlDefaultAdminRules,
	ReentrancyGuard
{
	struct Visibility {
		address creator; // The address receiving creator fees.
		uint256 totalSupply; // Total visibility credits in circulation.
		uint256 claimableFeeBalance; // Accumulated creator fees awaiting withdrawal.
		mapping(address => uint256) creditBalances; // User credit balances.
	}

	/**
	 * @notice Users can purchase and sell visibility credits according to a bonding curve.
	 *
	 * @dev The bonding curve is defined by the formula:
	 *        PRICE = BASE_PRICE + A * totalSupply^2 + B * totalSupply
	 *      - BASE_PRICE: The initial price when totalSupply is zero.
	 *      - A, B: Constants that determine the curvature of the price function.
	 */
	uint256 public constant A = 0.000000015 ether;
	uint256 public constant B = 0.000025 ether;
	uint256 public constant BASE_PRICE = 0.0001 ether;

	uint256 public constant MAX_TOTAL_SUPPLY = type(uint64).max;

	bytes32 public constant CREDITS_TRANSFER_ROLE =
		keccak256("CREDITS_TRANSFER_ROLE");
	bytes32 public constant CREATORS_CHECKER_ROLE =
		keccak256("CREATORS_CHECKER_ROLE");

	/// @notice Fee percentages in ppm (parts per million).
	uint256 public constant FEE_DENOMINATOR = 1_000_000; // Using parts per million (ppm)
	uint256 public constant CREATOR_FEE = 20_000; // 2% fee to the creator for each trade
	uint256 public constant PROTOCOL_FEE = 20_000; // should be higher than referrer fee
	uint256 public constant REFERRER_FEE = 10_000; // if any referrer, 1% fee to the referrer (deduced from protocol fee)

	address payable public protocolTreasury;

	mapping(bytes32 => Visibility) public visibilityCredits;

	constructor(
		address treasury,
		address creatorLinker
	) AccessControlDefaultAdminRules(3 days, msg.sender) {
		if (PROTOCOL_FEE <= REFERRER_FEE) revert InvalidFeeParams();

		if (treasury == address(0)) revert InvalidAddress();
		protocolTreasury = payable(treasury);

		if (creatorLinker == address(0)) revert InvalidAddress();
		_grantRole(CREATORS_CHECKER_ROLE, creatorLinker);
	}

	/**
	 * @notice Buys a specified amount of visibility credits.
	 * @dev Users must send sufficient Ether to cover the cost and fees.
	 * @param visibilityId The ID representing the visibility credits.
	 * @param amount The amount of credits to buy.
	 * @param referrer The address of the referrer (optional).
	 */
	function buyCredits(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	) external payable nonReentrant {
		Visibility storage visibility = visibilityCredits[
			getVisibilityKey(visibilityId)
		];

		uint256 totalSupply = visibility.totalSupply;

		(
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		) = _tradeCostWithFees(totalSupply, amount, true, referrer);

		uint256 totalCost = tradeCost + creatorFee + protocolFee + referrerFee;

		if (msg.value < totalCost) {
			revert NotEnoughEthSent();
		}

		if (totalSupply + amount > MAX_TOTAL_SUPPLY) {
			revert InvalidAmount();
		}

		totalSupply += amount;

		visibility.totalSupply = totalSupply;
		visibility.claimableFeeBalance += creatorFee;
		visibility.creditBalances[msg.sender] += amount;

		if (referrerFee > 0) {
			Address.sendValue(payable(referrer), referrerFee);
		}

		Address.sendValue(protocolTreasury, protocolFee);

		// Refund excess Ether sent
		if (msg.value > totalCost) {
			Address.sendValue(payable(msg.sender), msg.value - totalCost);
		}

		CreditsTradeEvent memory tradeEvent = CreditsTradeEvent({
			from: msg.sender,
			visibilityId: visibilityId,
			amount: amount,
			isBuy: true,
			tradeCost: tradeCost,
			creatorFee: creatorFee,
			protocolFee: protocolFee,
			referrerFee: referrerFee,
			referrer: referrer,
			newTotalSupply: totalSupply,
			newCurrentPrice: _getCurrentPrice(totalSupply)
		});

		emit CreditsTrade(tradeEvent);
	}

	/**
	 * @notice Sells a specified amount of visibility credits.
	 * @dev Users receive Ether minus applicable fees.
	 * @param visibilityId The ID representing the visibility credits.
	 * @param amount The amount of credits to sell.
	 * @param referrer The address of the referrer (optional).
	 */
	function sellCredits(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	) external nonReentrant {
		Visibility storage visibility = visibilityCredits[
			getVisibilityKey(visibilityId)
		];

		if (visibility.creditBalances[msg.sender] < amount) {
			revert NotEnoughCreditsOwned();
		}

		uint256 totalSupply = visibility.totalSupply;

		(
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		) = _tradeCostWithFees(totalSupply, amount, false, referrer);

		uint256 reimbursement = tradeCost -
			creatorFee -
			protocolFee -
			referrerFee;

		totalSupply -= amount;

		visibility.totalSupply = totalSupply;
		visibility.claimableFeeBalance += creatorFee;

		visibility.creditBalances[msg.sender] -= amount;

		Address.sendValue(payable(msg.sender), reimbursement);

		if (referrerFee > 0) {
			Address.sendValue(payable(referrer), referrerFee);
		}

		Address.sendValue(protocolTreasury, protocolFee);

		CreditsTradeEvent memory tradeEvent = CreditsTradeEvent({
			from: msg.sender,
			visibilityId: visibilityId,
			amount: amount,
			isBuy: false,
			tradeCost: tradeCost,
			creatorFee: creatorFee,
			protocolFee: protocolFee,
			referrerFee: referrerFee,
			referrer: referrer,
			newTotalSupply: totalSupply,
			newCurrentPrice: _getCurrentPrice(totalSupply)
		});

		emit CreditsTrade(tradeEvent);
	}

	/**
	 * @notice Allows creators to claim their accumulated fees.
	 * @param visibilityId The ID representing the visibility credits.
	 */
	function claimCreatorFee(
		string calldata visibilityId
	) external nonReentrant {
		Visibility storage visibility = visibilityCredits[
			getVisibilityKey(visibilityId)
		];

		uint256 claimableFeeBalance = visibility.claimableFeeBalance;

		if (claimableFeeBalance == 0) {
			revert InvalidAmount();
		}

		address creator = visibility.creator;

		if (creator == address(0)) {
			revert InvalidCreator();
		}

		visibility.claimableFeeBalance = 0;

		Address.sendValue(payable(creator), claimableFeeBalance);

		emit CreatorFeeClaimed(creator, claimableFeeBalance);
	}

	function grantCreatorTransferRole(
		address grantee
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		_grantRole(CREDITS_TRANSFER_ROLE, grantee);
	}

	/**
	 * @notice Sets the creator for a specific visibility ID.
	 * @dev Only callable by an account with the `CREATORS_CHECKER_ROLE`.
	 * @param visibilityId The ID representing the visibility credits.
	 * @param creator The address of the creator, can be address(0).
	 */
	function setCreatorVisibility(
		string calldata visibilityId,
		address creator
	) external onlyRole(CREATORS_CHECKER_ROLE) {
		Visibility storage visibility = visibilityCredits[
			getVisibilityKey(visibilityId)
		];
		visibility.creator = creator;

		emit CreatorVisibilitySet(visibilityId, creator);
	}

	/**
	 * @notice Transfers visibility credits between users.
	 * @dev Only callable by an account with the `CREDITS_TRANSFER_ROLE`.
	 * @param visibilityId The ID representing the visibility credits.
	 * @param from The address to transfer credits from.
	 * @param to The address to transfer credits to.
	 * @param amount The amount of credits to transfer.
	 */
	function transferCredits(
		string calldata visibilityId,
		address from,
		address to,
		uint256 amount
	) external onlyRole(CREDITS_TRANSFER_ROLE) {
		Visibility storage visibility = visibilityCredits[
			getVisibilityKey(visibilityId)
		];

		if (visibility.creditBalances[from] < amount) {
			revert NotEnoughCreditsOwned();
		}

		visibility.creditBalances[from] -= amount;
		visibility.creditBalances[to] += amount;

		emit CreditsTransfer(visibilityId, from, to, amount);
	}

	/**
	 * @notice Updates the protocol treasury address.
	 * @dev Only callable by an account with the `DEFAULT_ADMIN_ROLE`.
	 * @param treasury The address of the new protocol treasury (cannot be address(0)).
	 */
	function updateTreasury(
		address treasury
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		if (treasury == address(0)) {
			revert InvalidAddress();
		}
		protocolTreasury = payable(treasury);
	}

	function getVisibility(
		string calldata visibilityId
	)
		external
		view
		returns (
			address creator,
			uint256 totalSupply,
			uint256 claimableFeeBalance
		)
	{
		Visibility storage visibility = visibilityCredits[
			getVisibilityKey(visibilityId)
		];
		return (
			visibility.creator,
			visibility.totalSupply,
			visibility.claimableFeeBalance
		);
	}

	function getVisibilityCreditBalance(
		string calldata visibilityId,
		address account
	) external view returns (uint256) {
		return
			visibilityCredits[getVisibilityKey(visibilityId)].creditBalances[
				account
			];
	}

	function getVisibilityCurrentPrice(
		string calldata visibilityId
	) external view returns (uint256) {
		return
			_getCurrentPrice(
				visibilityCredits[getVisibilityKey(visibilityId)].totalSupply
			);
	}

	function buyCostWithFees(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	)
		external
		view
		returns (
			uint256 totalCost,
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		)
	{
		uint256 totalSupply = visibilityCredits[getVisibilityKey(visibilityId)]
			.totalSupply;
		(tradeCost, creatorFee, protocolFee, referrerFee) = _tradeCostWithFees(
			totalSupply,
			amount,
			true,
			referrer
		);
		totalCost = tradeCost + creatorFee + protocolFee + referrerFee;
	}

	function sellCostWithFees(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	)
		external
		view
		returns (
			uint256 reimbursement,
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		)
	{
		uint256 totalSupply = visibilityCredits[getVisibilityKey(visibilityId)]
			.totalSupply;
		(tradeCost, creatorFee, protocolFee, referrerFee) = _tradeCostWithFees(
			totalSupply,
			amount,
			false,
			referrer
		);
		reimbursement = tradeCost - creatorFee - protocolFee - referrerFee;
	}

	function getVisibilityKey(
		string calldata visibilityId
	) public pure returns (bytes32) {
		return keccak256(abi.encode(visibilityId));
	}

	function _tradeCostWithFees(
		uint256 totalSupply,
		uint256 amount,
		bool isBuy,
		address referrer
	)
		private
		pure
		returns (
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		)
	{
		if (!isBuy) {
			if (totalSupply < amount) {
				revert InvalidAmount();
			}
		}

		uint256 fromSupply = isBuy ? totalSupply : totalSupply - amount;

		tradeCost = _tradeCost(fromSupply, amount);

		creatorFee = (tradeCost * CREATOR_FEE) / FEE_DENOMINATOR;

		if (referrer != address(0)) {
			referrerFee = (tradeCost * REFERRER_FEE) / FEE_DENOMINATOR;
			protocolFee =
				(tradeCost * (PROTOCOL_FEE - REFERRER_FEE)) /
				FEE_DENOMINATOR;
		} else {
			protocolFee = (tradeCost * PROTOCOL_FEE) / FEE_DENOMINATOR;
		}
	}

	/**
	 * @dev Calculates the current price per visibility credit based on the total supply.
	 * @param totalSupply The current total supply of visibility credits.
	 * @return The current price per credit in wei.
	 */
	function _getCurrentPrice(
		uint256 totalSupply
	) private pure returns (uint256) {
		// Compute the current price using the bonding curve formula
		return BASE_PRICE + (A * (totalSupply ** 2)) + (B * totalSupply);
	}

	function _tradeCost(
		uint256 fromSupply,
		uint256 amount
	) private pure returns (uint256) {
		if (amount == 0) {
			revert InvalidAmount();
		}

		//  The ending index of the credit unit being considered.
		uint256 toSupply = fromSupply + amount - 1;

		uint256 sumSquares;
		uint256 sumFirstN;

		if (fromSupply == 0) {
			// S2(n) calculates the cumulative sum of squares from k = 1 to n:
			//   S2(n) = ∑_{k=1}^{n} k² = n(n + 1)(2n + 1) / 6
			sumSquares = (toSupply * (toSupply + 1) * (2 * toSupply + 1)) / 6;

			// S1(n) calculates the cumulative sum from k = 1 to n:
			//   S1(n) = ∑_{k=1}^{n} k = n(n + 1) / 2
			sumFirstN = (toSupply * (toSupply + 1)) / 2;
		} else {
			//    S2(n) = ∑_{k=1}^{n} k² = S2(n) = ∑_{k=1}^{j-1} k² + ∑_{k=j}^{n} k²
			// Thus the sum of squares from fromSupply to toSupply is:
			uint256 sumSquaresTo = (toSupply *
				(toSupply + 1) *
				(2 * toSupply + 1)) / 6;
			uint256 sumSquaresFrom = ((fromSupply - 1) *
				fromSupply *
				(2 * fromSupply - 1)) / 6;
			sumSquares = sumSquaresTo - sumSquaresFrom;

			// Similarly,
			//   S1(n) = ∑_{k=1}^{n} k = ∑_{k=1}^{j-1} k + ∑_{k=j}^{n} k
			// Thus the sum from fromSupply to toSupply is:
			uint256 sumFirstNTo = (toSupply * (toSupply + 1)) / 2;
			uint256 sumFirstNFrom = ((fromSupply - 1) * fromSupply) / 2;
			sumFirstN = sumFirstNTo - sumFirstNFrom;
		}

		// Total cost is the sum of base prices and the bonding curve contributions
		return (BASE_PRICE * amount) + (A * sumSquares) + (B * sumFirstN);
	}
}
