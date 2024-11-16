import { BigInt } from '@graphprotocol/graph-ts'
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
  CreditsTrade,
  CreditsTransfer,
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  Visibility,
  VisibilityBalance
} from '../generated/schema'
import { log } from 'matchstick-as'

export function handleCreatorFeeClaimed(event: CreatorFeeClaimedEvent): void {
  let entity = new CreatorFeeClaimed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
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
  let visibility = Visibility.load(event.params.visibilityId.toString())
  if (visibility == null) {
    visibility = Visibility.loadInBlock(event.params.visibilityId.toString())
  }
  if (visibility == null) {
    visibility = new Visibility(event.params.visibilityId.toString())
    visibility.currentPrice = BigInt.fromI32(0)
    visibility.totalSupply = BigInt.fromI32(0)
  }
  visibility.creator = event.params.creator
  visibility.save()

  /////

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

export function handleCreditsTrade(event: CreditsTradeEvent): void {
  let visibility = Visibility.load(
    event.params.tradeEvent.visibilityId.toString()
  )
  if (visibility == null) {
    visibility = Visibility.loadInBlock(
      event.params.tradeEvent.visibilityId.toString()
    )
  }
  if (visibility == null) {
    visibility = new Visibility(event.params.tradeEvent.visibilityId.toString())
  }
  visibility.currentPrice = event.params.tradeEvent.newCurrentPrice
  visibility.totalSupply = event.params.tradeEvent.newTotalSupply
  visibility.save()

  let visibilityBalance = VisibilityBalance.load(
    event.params.tradeEvent.visibilityId
      .toString()
      .concat('-')
      .concat(event.params.tradeEvent.from.toHexString())
  )
  if (visibilityBalance == null) {
    visibilityBalance = VisibilityBalance.loadInBlock(
      event.params.tradeEvent.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.tradeEvent.from.toHexString())
    )
  }
  if (visibilityBalance == null) {
    visibilityBalance = new VisibilityBalance(
      event.params.tradeEvent.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.tradeEvent.from.toHexString())
    )
    visibilityBalance.visibility = visibility.id
    visibilityBalance.user = event.params.tradeEvent.from
    visibilityBalance.balance = BigInt.fromI32(0)
  }

  visibilityBalance.balance = event.params.tradeEvent.isBuy
    ? visibilityBalance.balance.plus(event.params.tradeEvent.amount)
    : visibilityBalance.balance.minus(event.params.tradeEvent.amount)

  visibilityBalance.save()

  let entity = new CreditsTrade(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.tradeEvent_from = event.params.tradeEvent.from
  entity.visibility = visibility.id
  entity.tradeEvent_amount = event.params.tradeEvent.amount
  entity.tradeEvent_isBuy = event.params.tradeEvent.isBuy
  entity.tradeEvent_tradeCost = event.params.tradeEvent.tradeCost
  entity.tradeEvent_creatorFee = event.params.tradeEvent.creatorFee
  entity.tradeEvent_protocolFee = event.params.tradeEvent.protocolFee
  entity.tradeEvent_referrerFee = event.params.tradeEvent.referrerFee
  entity.tradeEvent_referrer = event.params.tradeEvent.referrer
  entity.tradeEvent_newTotalSupply = event.params.tradeEvent.newTotalSupply
  entity.tradeEvent_newCurrentPrice = event.params.tradeEvent.newCurrentPrice

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCreditsTransfer(event: CreditsTransferEvent): void {
  let visibility = Visibility.load(event.params.visibilityId.toString())
  if (visibility == null) {
    visibility = Visibility.loadInBlock(event.params.visibilityId.toString())
  }
  if (visibility == null) {
    visibility = new Visibility(event.params.visibilityId.toString())
    visibility.currentPrice = BigInt.fromI32(0)
    visibility.totalSupply = BigInt.fromI32(0)
  }
  visibility.save()

  let visibilityBalanceFrom = VisibilityBalance.load(
    event.params.visibilityId
      .toString()
      .concat('-')
      .concat(event.params.from.toHexString())
  )
  if (visibilityBalanceFrom == null) {
    visibilityBalanceFrom = VisibilityBalance.loadInBlock(
      event.params.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.from.toHexString())
    )
  }
  if (visibilityBalanceFrom == null) {
    visibilityBalanceFrom = new VisibilityBalance(
      event.params.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.from.toHexString())
    )
    visibilityBalanceFrom.visibility = visibility.id
    visibilityBalanceFrom.user = event.params.from
    visibilityBalanceFrom.balance = BigInt.fromI32(0)
  }

  let visibilityBalanceTo = VisibilityBalance.load(
    event.params.visibilityId
      .toString()
      .concat('-')
      .concat(event.params.to.toHexString())
  )
  if (visibilityBalanceTo == null) {
    visibilityBalanceTo = VisibilityBalance.loadInBlock(
      event.params.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.to.toHexString())
    )
  }
  if (visibilityBalanceTo == null) {
    visibilityBalanceTo = new VisibilityBalance(
      event.params.visibilityId
        .toString()
        .concat('-')
        .concat(event.params.to.toHexString())
    )
    visibilityBalanceTo.visibility = visibility.id
    visibilityBalanceTo.user = event.params.to
    visibilityBalanceTo.balance = BigInt.fromI32(0)
  }

  visibilityBalanceFrom.balance = visibilityBalanceFrom.balance.minus(
    event.params.amount
  )
  visibilityBalanceTo.balance = visibilityBalanceTo.balance.plus(
    event.params.amount
  )

  visibilityBalanceFrom.save()
  visibilityBalanceTo.save()

  let entity = new CreditsTransfer(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.visibility = visibility.id
  entity.from = event.params.from
  entity.to = event.params.to
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

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
