// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/extensions/AccessControlDefaultAdminRules.sol";
import "./interfaces/IVisibilityCredits.sol";

/**
 * @title VisibilityServices
 * @notice Allows users to spend creator credits (from IVisibilityCredits), for ad purposes.
 */
contract VisibilityServices is AccessControlDefaultAdminRules {
	// Enum representing different states of execution
	enum ExecutionState {
		UNINITIALIZED,
		REQUESTED,
		ACCEPTED,
		DISPUTED,
		REFUNDED,
		VALIDATED
	}

	// Struct for tracking service execution details
	struct Execution {
		ExecutionState state; // Current state of the execution
		address requester; // Address that requested the execution
		uint256 lastUpdateTimestamp; // Timestamp of the last update
	}

	// Struct representing a service
	struct Service {
		bool enabled; // Indicates if the service is active
		string serviceType; // Service type identifier (e.g., "x-post" for post publication)
		string visibilityId; // Visibility identifier (e.g., "x-VitalikButerin" for specific accounts)
		uint256 creditsCostAmount; // Cost in credits for the service
		uint256 executionsNonce; // Counter for execution IDs
		mapping(uint256 => Execution) executions; // Mapping of executions by nonce
	}

	// Events emitted for various service actions
	event ServiceCreated(
		uint256 indexed nonce,
		string serviceType,
		string visibilityId,
		uint256 creditsCostAmount
	);

	event ServiceUpdated(uint256 indexed nonce, bool enabled);

	event ServiceExecutionRequested(
		uint256 indexed serviceNonce,
		uint256 indexed executionNonce,
		address indexed requester,
		string requestData
	);

	event ServiceExecutionCanceled(
		uint256 indexed serviceNonce,
		uint256 indexed executionNonce,
		address indexed from,
		string cancelData
	);

	event ServiceExecutionAccepted(
		uint256 indexed serviceNonce,
		uint256 indexed executionNonce,
		string responseData
	);

	event ServiceExecutionValidated(
		uint256 indexed serviceNonce,
		uint256 indexed executionNonce
	);

	event ServiceExecutionDisputed(
		uint256 indexed serviceNonce,
		uint256 indexed executionNonce,
		string disputeData
	);

	event ServiceExecutionResolved(
		uint256 indexed serviceNonce,
		uint256 indexed executionNonce,
		bool refund,
		string resolveData
	);

	// Custom errors for more specific revert reasons
	error DisabledService(); // Error for using a disabled service
	error InvalidAddress(); // Error for invalid address inputs
	error InvalidCreator(); // Error for invalid creator authentication
	error InvalidExecutionState(); // Error for invalid execution state transitions
	error UnauthorizedExecutionAction(); // Error for unauthorized execution actions

	uint256 public constant AUTO_VALIDATION_DELAY = 5 days; // Auto-validation delay period

	bytes32 public constant DISPUTE_RESOLVER_ROLE =
		keccak256("DISPUTE_RESOLVER_ROLE"); // Role identifier for dispute resolution

	uint256 public servicesNonce; // Counter for service IDs
	mapping(uint256 => Service) public services; // Mapping of services by nonce

	IVisibilityCredits public immutable visibilityCredits; // Instance of visibility credits interface

	/**
	 * @dev Constructor to initialize the contract.
	 * @param _visibilityCredits Address of the IVisibilityCredits contract.
	 * @param disputeResolver Address for the dispute resolver role.
	 */
	constructor(
		address _visibilityCredits,
		address disputeResolver
	) AccessControlDefaultAdminRules(3 days, msg.sender) {
		_grantRole(DISPUTE_RESOLVER_ROLE, disputeResolver);
		visibilityCredits = IVisibilityCredits(_visibilityCredits);
	}

	/**
	 * @notice Creates a new service.
	 * @param serviceType The type of the service.
	 * @param visibilityId The visibility ID associated with the service.
	 * @param creditsCostAmount The cost in credits for the service.
	 */
	function createService(
		string memory serviceType,
		string memory visibilityId,
		uint256 creditsCostAmount
	) external {
		(address creator, , ) = visibilityCredits.getVisibility(visibilityId);
		if (creator != msg.sender) revert InvalidCreator();

		uint256 nonce = servicesNonce;
		services[nonce].enabled = true;
		services[nonce].serviceType = serviceType;
		services[nonce].visibilityId = visibilityId;
		services[nonce].creditsCostAmount = creditsCostAmount;
		services[nonce].executionsNonce = 0;

		servicesNonce += 1;
		emit ServiceCreated(
			nonce,
			serviceType,
			visibilityId,
			creditsCostAmount
		);
	}

	/**
	 * @notice Updates the status of an existing service.
	 * @param serviceNonce The ID of the service to update.
	 * @param enabled The new status of the service (true for enabled, false for disabled).
	 */
	function updateService(uint256 serviceNonce, bool enabled) external {
		Service storage service = services[serviceNonce];
		string memory visibilityId = service.visibilityId;

		(address creator, , ) = visibilityCredits.getVisibility(visibilityId);
		if (creator != msg.sender) revert InvalidCreator();

		service.enabled = enabled;
		emit ServiceUpdated(serviceNonce, enabled);
	}

	/**
	 * @notice Requests execution of a service.
	 * @param serviceNonce The ID of the service.
	 * @param requestData The data related to the request.
	 */
	function requestServiceExecution(
		uint256 serviceNonce,
		string calldata requestData
	) external {
		Service storage service = services[serviceNonce];
		if (!service.enabled) revert DisabledService();

		uint256 executionNonce = service.executionsNonce;
		service.executions[executionNonce].state = ExecutionState.REQUESTED;
		service.executions[executionNonce].requester = msg.sender;
		service.executions[executionNonce].lastUpdateTimestamp = block
			.timestamp;

		service.executionsNonce += 1;
		visibilityCredits.transferCredits(
			service.visibilityId,
			msg.sender,
			address(this),
			service.creditsCostAmount
		);

		emit ServiceExecutionRequested(
			serviceNonce,
			executionNonce,
			msg.sender,
			requestData
		);
	}

	/**
	 * @notice Accepts a service execution request.
	 * @param serviceNonce The ID of the service.
	 * @param executionNonce The ID of the execution.
	 * @param responseData The data related to the response.
	 */
	function acceptServiceExecution(
		uint256 serviceNonce,
		uint256 executionNonce,
		string calldata responseData
	) external {
		Service storage service = services[serviceNonce];
		Execution storage execution = service.executions[executionNonce];

		if (execution.state != ExecutionState.REQUESTED)
			revert InvalidExecutionState();

		string memory visibilityId = service.visibilityId;
		(address creator, , ) = visibilityCredits.getVisibility(visibilityId);
		if (creator != msg.sender) revert UnauthorizedExecutionAction();

		execution.state = ExecutionState.ACCEPTED;
		execution.lastUpdateTimestamp = block.timestamp;

		emit ServiceExecutionAccepted(
			serviceNonce,
			executionNonce,
			responseData
		);
	}

	/**
	 * @notice Cancels a service execution.
	 * @param serviceNonce The ID of the service.
	 * @param executionNonce The ID of the execution.
	 * @param cancelData The data related to the cancellation.
	 */
	function cancelServiceExecution(
		uint256 serviceNonce,
		uint256 executionNonce,
		string calldata cancelData
	) external {
		Service storage service = services[serviceNonce];
		Execution storage execution = service.executions[executionNonce];

		if (execution.state != ExecutionState.REQUESTED)
			revert InvalidExecutionState();

		address requester = execution.requester;

		string memory visibilityId = service.visibilityId;
		(address creator, , ) = visibilityCredits.getVisibility(visibilityId);
		if (!(requester == msg.sender || creator == msg.sender))
			revert UnauthorizedExecutionAction();

		execution.state = ExecutionState.REFUNDED;
		execution.lastUpdateTimestamp = block.timestamp;

		visibilityCredits.transferCredits(
			visibilityId,
			address(this),
			requester,
			service.creditsCostAmount
		);

		emit ServiceExecutionCanceled(
			serviceNonce,
			executionNonce,
			msg.sender,
			cancelData
		);
	}

	/**
	 * @notice Validates a service execution.
	 * @param serviceNonce The ID of the service.
	 * @param executionNonce The ID of the execution.
	 */
	function validateServiceExecution(
		uint256 serviceNonce,
		uint256 executionNonce
	) external {
		Service storage service = services[serviceNonce];
		Execution storage execution = service.executions[executionNonce];

		if (execution.state != ExecutionState.ACCEPTED)
			revert InvalidExecutionState();

		if (
			!(execution.requester == msg.sender ||
				(AUTO_VALIDATION_DELAY + execution.lastUpdateTimestamp <
					block.timestamp))
		) revert UnauthorizedExecutionAction();

		(address creator, , ) = visibilityCredits.getVisibility(
			service.visibilityId
		);

		execution.state = ExecutionState.VALIDATED;
		execution.lastUpdateTimestamp = block.timestamp;

		visibilityCredits.transferCredits(
			service.visibilityId,
			address(this),
			creator,
			service.creditsCostAmount
		);

		emit ServiceExecutionValidated(serviceNonce, executionNonce);
	}

	/**
	 * @notice Disputes a service execution.
	 * @param serviceNonce The ID of the service.
	 * @param executionNonce The ID of the execution.
	 * @param disputeData The data related to the dispute.
	 */
	function disputeServiceExecution(
		uint256 serviceNonce,
		uint256 executionNonce,
		string calldata disputeData
	) external {
		Service storage service = services[serviceNonce];
		Execution storage execution = service.executions[executionNonce];

		if (execution.state != ExecutionState.ACCEPTED)
			revert InvalidExecutionState();
		if (execution.requester != msg.sender)
			revert UnauthorizedExecutionAction();

		execution.state = ExecutionState.DISPUTED;
		execution.lastUpdateTimestamp = block.timestamp;

		emit ServiceExecutionDisputed(
			serviceNonce,
			executionNonce,
			disputeData
		);
	}

	/**
	 * @notice Resolves a disputed service execution.
	 * @param serviceNonce The ID of the service.
	 * @param executionNonce The ID of the execution.
	 * @param refund Whether the resolution includes a refund.
	 * @param resolveData The data related to the resolution.
	 */
	function resolveServiceExecution(
		uint256 serviceNonce,
		uint256 executionNonce,
		bool refund,
		string calldata resolveData
	) external onlyRole(DISPUTE_RESOLVER_ROLE) {
		Service storage service = services[serviceNonce];
		Execution storage execution = service.executions[executionNonce];

		if (execution.state != ExecutionState.DISPUTED)
			revert InvalidExecutionState();

		if (refund) {
			execution.state = ExecutionState.REFUNDED;
			visibilityCredits.transferCredits(
				service.visibilityId,
				address(this),
				execution.requester,
				service.creditsCostAmount
			);
		} else {
			execution.state = ExecutionState.VALIDATED;
			(address creator, , ) = visibilityCredits.getVisibility(
				service.visibilityId
			);
			visibilityCredits.transferCredits(
				service.visibilityId,
				address(this),
				creator,
				service.creditsCostAmount
			);
		}

		execution.lastUpdateTimestamp = block.timestamp;

		emit ServiceExecutionResolved(
			serviceNonce,
			executionNonce,
			refund,
			resolveData
		);
	}

	/**
	 * @notice Retrieves the details of a specific service execution.
	 * @param serviceNonce The ID of the service.
	 * @param executionNonce The ID of the execution.
	 * @return state The current state of the execution.
	 * @return requester The address that requested the execution.
	 * @return lastUpdateTimestamp The timestamp of the last update.
	 */
	function getServiceExecution(
		uint256 serviceNonce,
		uint256 executionNonce
	)
		external
		view
		returns (
			ExecutionState state,
			address requester,
			uint256 lastUpdateTimestamp
		)
	{
		Execution storage execution = services[serviceNonce].executions[
			executionNonce
		];
		return (
			execution.state,
			execution.requester,
			execution.lastUpdateTimestamp
		);
	}
}
