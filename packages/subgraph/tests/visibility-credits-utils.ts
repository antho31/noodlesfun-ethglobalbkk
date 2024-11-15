import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CreatorFeeClaimed,
  CreatorVisibilitySet,
  CreditsTrade,
  CreditsTransfer,
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/VisibilityCredits/VisibilityCredits"

export function createCreatorFeeClaimedEvent(
  creator: Address,
  amount: BigInt
): CreatorFeeClaimed {
  let creatorFeeClaimedEvent = changetype<CreatorFeeClaimed>(newMockEvent())

  creatorFeeClaimedEvent.parameters = new Array()

  creatorFeeClaimedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  creatorFeeClaimedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return creatorFeeClaimedEvent
}

export function createCreatorVisibilitySetEvent(
  visibilityId: string,
  creator: Address
): CreatorVisibilitySet {
  let creatorVisibilitySetEvent = changetype<CreatorVisibilitySet>(
    newMockEvent()
  )

  creatorVisibilitySetEvent.parameters = new Array()

  creatorVisibilitySetEvent.parameters.push(
    new ethereum.EventParam(
      "visibilityId",
      ethereum.Value.fromString(visibilityId)
    )
  )
  creatorVisibilitySetEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )

  return creatorVisibilitySetEvent
}

export function createCreditsTradeEvent(
  tradeEvent: ethereum.Tuple
): CreditsTrade {
  let creditsTradeEvent = changetype<CreditsTrade>(newMockEvent())

  creditsTradeEvent.parameters = new Array()

  creditsTradeEvent.parameters.push(
    new ethereum.EventParam("tradeEvent", ethereum.Value.fromTuple(tradeEvent))
  )

  return creditsTradeEvent
}

export function createCreditsTransferEvent(
  visibilityId: string,
  from: Address,
  to: Address,
  amount: BigInt
): CreditsTransfer {
  let creditsTransferEvent = changetype<CreditsTransfer>(newMockEvent())

  creditsTransferEvent.parameters = new Array()

  creditsTransferEvent.parameters.push(
    new ethereum.EventParam(
      "visibilityId",
      ethereum.Value.fromString(visibilityId)
    )
  )
  creditsTransferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  creditsTransferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  creditsTransferEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return creditsTransferEvent
}

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
