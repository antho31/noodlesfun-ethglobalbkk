import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address, Bytes } from "@graphprotocol/graph-ts"
import {
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  ServiceCreated,
  ServiceExecutionAccepted,
  ServiceExecutionCanceled,
  ServiceExecutionDisputed,
  ServiceExecutionRequested,
  ServiceExecutionResolved,
  ServiceExecutionValidated,
  ServiceUpdated
} from "../generated/VisibilityServices/VisibilityServices"

export function createDefaultAdminDelayChangeCanceledEvent(): DefaultAdminDelayChangeCanceled {
  let defaultAdminDelayChangeCanceledEvent =
    changetype<DefaultAdminDelayChangeCanceled>(newMockEvent())

  defaultAdminDelayChangeCanceledEvent.parameters = new Array()

  return defaultAdminDelayChangeCanceledEvent
}

export function createDefaultAdminDelayChangeScheduledEvent(
  newDelay: BigInt,
  effectSchedule: BigInt
): DefaultAdminDelayChangeScheduled {
  let defaultAdminDelayChangeScheduledEvent =
    changetype<DefaultAdminDelayChangeScheduled>(newMockEvent())

  defaultAdminDelayChangeScheduledEvent.parameters = new Array()

  defaultAdminDelayChangeScheduledEvent.parameters.push(
    new ethereum.EventParam(
      "newDelay",
      ethereum.Value.fromUnsignedBigInt(newDelay)
    )
  )
  defaultAdminDelayChangeScheduledEvent.parameters.push(
    new ethereum.EventParam(
      "effectSchedule",
      ethereum.Value.fromUnsignedBigInt(effectSchedule)
    )
  )

  return defaultAdminDelayChangeScheduledEvent
}

export function createDefaultAdminTransferCanceledEvent(): DefaultAdminTransferCanceled {
  let defaultAdminTransferCanceledEvent =
    changetype<DefaultAdminTransferCanceled>(newMockEvent())

  defaultAdminTransferCanceledEvent.parameters = new Array()

  return defaultAdminTransferCanceledEvent
}

export function createDefaultAdminTransferScheduledEvent(
  newAdmin: Address,
  acceptSchedule: BigInt
): DefaultAdminTransferScheduled {
  let defaultAdminTransferScheduledEvent =
    changetype<DefaultAdminTransferScheduled>(newMockEvent())

  defaultAdminTransferScheduledEvent.parameters = new Array()

  defaultAdminTransferScheduledEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )
  defaultAdminTransferScheduledEvent.parameters.push(
    new ethereum.EventParam(
      "acceptSchedule",
      ethereum.Value.fromUnsignedBigInt(acceptSchedule)
    )
  )

  return defaultAdminTransferScheduledEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}

export function createServiceCreatedEvent(
  nonce: BigInt,
  serviceType: string,
  visibilityId: string,
  creditsCostAmount: BigInt
): ServiceCreated {
  let serviceCreatedEvent = changetype<ServiceCreated>(newMockEvent())

  serviceCreatedEvent.parameters = new Array()

  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce))
  )
  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceType",
      ethereum.Value.fromString(serviceType)
    )
  )
  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "visibilityId",
      ethereum.Value.fromString(visibilityId)
    )
  )
  serviceCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "creditsCostAmount",
      ethereum.Value.fromUnsignedBigInt(creditsCostAmount)
    )
  )

  return serviceCreatedEvent
}

export function createServiceExecutionAcceptedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  responseData: string
): ServiceExecutionAccepted {
  let serviceExecutionAcceptedEvent = changetype<ServiceExecutionAccepted>(
    newMockEvent()
  )

  serviceExecutionAcceptedEvent.parameters = new Array()

  serviceExecutionAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceNonce",
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "executionNonce",
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionAcceptedEvent.parameters.push(
    new ethereum.EventParam(
      "responseData",
      ethereum.Value.fromString(responseData)
    )
  )

  return serviceExecutionAcceptedEvent
}

export function createServiceExecutionCanceledEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  from: Address,
  cancelData: string
): ServiceExecutionCanceled {
  let serviceExecutionCanceledEvent = changetype<ServiceExecutionCanceled>(
    newMockEvent()
  )

  serviceExecutionCanceledEvent.parameters = new Array()

  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "serviceNonce",
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam(
      "executionNonce",
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  serviceExecutionCanceledEvent.parameters.push(
    new ethereum.EventParam("cancelData", ethereum.Value.fromString(cancelData))
  )

  return serviceExecutionCanceledEvent
}

export function createServiceExecutionDisputedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  disputeData: string
): ServiceExecutionDisputed {
  let serviceExecutionDisputedEvent = changetype<ServiceExecutionDisputed>(
    newMockEvent()
  )

  serviceExecutionDisputedEvent.parameters = new Array()

  serviceExecutionDisputedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceNonce",
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionDisputedEvent.parameters.push(
    new ethereum.EventParam(
      "executionNonce",
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionDisputedEvent.parameters.push(
    new ethereum.EventParam(
      "disputeData",
      ethereum.Value.fromString(disputeData)
    )
  )

  return serviceExecutionDisputedEvent
}

export function createServiceExecutionRequestedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  requester: Address,
  requestData: string
): ServiceExecutionRequested {
  let serviceExecutionRequestedEvent = changetype<ServiceExecutionRequested>(
    newMockEvent()
  )

  serviceExecutionRequestedEvent.parameters = new Array()

  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceNonce",
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "executionNonce",
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam("requester", ethereum.Value.fromAddress(requester))
  )
  serviceExecutionRequestedEvent.parameters.push(
    new ethereum.EventParam(
      "requestData",
      ethereum.Value.fromString(requestData)
    )
  )

  return serviceExecutionRequestedEvent
}

export function createServiceExecutionResolvedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt,
  refund: boolean,
  resolveData: string
): ServiceExecutionResolved {
  let serviceExecutionResolvedEvent = changetype<ServiceExecutionResolved>(
    newMockEvent()
  )

  serviceExecutionResolvedEvent.parameters = new Array()

  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceNonce",
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "executionNonce",
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )
  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam("refund", ethereum.Value.fromBoolean(refund))
  )
  serviceExecutionResolvedEvent.parameters.push(
    new ethereum.EventParam(
      "resolveData",
      ethereum.Value.fromString(resolveData)
    )
  )

  return serviceExecutionResolvedEvent
}

export function createServiceExecutionValidatedEvent(
  serviceNonce: BigInt,
  executionNonce: BigInt
): ServiceExecutionValidated {
  let serviceExecutionValidatedEvent = changetype<ServiceExecutionValidated>(
    newMockEvent()
  )

  serviceExecutionValidatedEvent.parameters = new Array()

  serviceExecutionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      "serviceNonce",
      ethereum.Value.fromUnsignedBigInt(serviceNonce)
    )
  )
  serviceExecutionValidatedEvent.parameters.push(
    new ethereum.EventParam(
      "executionNonce",
      ethereum.Value.fromUnsignedBigInt(executionNonce)
    )
  )

  return serviceExecutionValidatedEvent
}

export function createServiceUpdatedEvent(
  nonce: BigInt,
  enabled: boolean
): ServiceUpdated {
  let serviceUpdatedEvent = changetype<ServiceUpdated>(newMockEvent())

  serviceUpdatedEvent.parameters = new Array()

  serviceUpdatedEvent.parameters.push(
    new ethereum.EventParam("nonce", ethereum.Value.fromUnsignedBigInt(nonce))
  )
  serviceUpdatedEvent.parameters.push(
    new ethereum.EventParam("enabled", ethereum.Value.fromBoolean(enabled))
  )

  return serviceUpdatedEvent
}
