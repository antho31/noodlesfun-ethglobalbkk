// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVisibilityCredits {
	struct CreditsTradeEvent {
		address from;
		string visibilityId;
		uint256 amount;
		bool isBuy;
		uint256 tradeCost;
		uint256 creatorFee;
		uint256 protocolFee;
		uint256 referrerFee;
		address referrer;
		uint256 newTotalSupply;
		uint256 newCurrentPrice;
	}

	event CreatorFeeClaimed(address indexed creator, uint256 amount);

	event CreatorVisibilitySet(string visibilityId, address creator);

	event CreditsTrade(CreditsTradeEvent tradeEvent);

	event CreditsTransfer(
		string visibilityId,
		address indexed from,
		address indexed to,
		uint256 amount
	);

	error InvalidAddress();
	error InvalidCreator();
	error InvalidAmount();
	error InvalidFeeParams();
	error NotEnoughEthSent();
	error NotEnoughCreditsOwned();

	function buyCredits(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	) external payable;

	function sellCredits(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	) external;

	function claimCreatorFee(string calldata visibilityId) external;

	function setCreatorVisibility(
		string calldata visibilityId,
		address creator
	) external;

	function transferCredits(
		string calldata visibilityId,
		address from,
		address to,
		uint256 amount
	) external;

	function updateTreasury(address treasury) external;

	function getVisibility(
		string calldata visibilityId
	)
		external
		view
		returns (
			address creator,
			uint256 totalSupply,
			uint256 claimableFeeBalance
		);

	function getVisibilityCreditBalance(
		string calldata visibilityId,
		address account
	) external view returns (uint256);

	function getVisibilityCurrentPrice(
		string calldata visibilityId
	) external view returns (uint256);

	function getVisibilityKey(
		string calldata visibilityId
	) external pure returns (bytes32);

	function buyCostWithFees(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	)
		external
		returns (
			uint256 totalCost,
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		);

	function sellCostWithFees(
		string calldata visibilityId,
		uint256 amount,
		address referrer
	)
		external
		returns (
			uint256 reimbourcement,
			uint256 tradeCost,
			uint256 creatorFee,
			uint256 protocolFee,
			uint256 referrerFee
		);
}
