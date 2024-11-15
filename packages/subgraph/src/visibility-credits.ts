import {
  CreatorFeeClaimed as CreatorFeeClaimedEvent,
  CreatorVisibilitySet as CreatorVisibilitySetEvent,
  CreditsTrade as CreditsTradeEvent,
  CreditsTransfer as CreditsTransferEvent,
  DefaultAdminDelayChangeCanceled as DefaultAdminDelayChangeCanceledEvent,
  DefaultAdminDelayChangeScheduled as DefaultAdminDelayChangeScheduledEvent,
  DefaultAdminTransferCanceled as DefaultAdminTransferCanceledEvent,
  DefaultAdminTransferScheduled as DefaultAdminTransferScheduledEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from '../generated/VisibilityCredits/VisibilityCredits'
import {
  CreatorFeeClaimed,
  CreatorVisibilitySet,
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from '../generated/schema'

export function handleCreatorFeeClaimed(event: CreatorFeeClaimedEvent): void {
  let entity = new CreatorFeeClaimed('auto')
  entity.creator = event.params.creator
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreatorVisibilitySet(
  event: CreatorVisibilitySetEvent
): void {
  let entity = new CreatorVisibilitySet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.visibilityId = event.params.visibilityId
  entity.creator = event.params.creator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreditsTrade(event: CreditsTradeEvent): void {}

export function handleCreditsTransfer(event: CreditsTransferEvent): void {}

export function handleDefaultAdminDelayChangeCanceled(
  event: DefaultAdminDelayChangeCanceledEvent
): void {
  let entity = new DefaultAdminDelayChangeCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultAdminDelayChangeScheduled(
  event: DefaultAdminDelayChangeScheduledEvent
): void {
  let entity = new DefaultAdminDelayChangeScheduled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newDelay = event.params.newDelay
  entity.effectSchedule = event.params.effectSchedule

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultAdminTransferCanceled(
  event: DefaultAdminTransferCanceledEvent
): void {
  let entity = new DefaultAdminTransferCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDefaultAdminTransferScheduled(
  event: DefaultAdminTransferScheduledEvent
): void {
  let entity = new DefaultAdminTransferScheduled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.newAdmin = event.params.newAdmin
  entity.acceptSchedule = event.params.acceptSchedule

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
