import {
  DefaultAdminDelayChangeCanceled as DefaultAdminDelayChangeCanceledEvent,
  DefaultAdminDelayChangeScheduled as DefaultAdminDelayChangeScheduledEvent,
  DefaultAdminTransferCanceled as DefaultAdminTransferCanceledEvent,
  DefaultAdminTransferScheduled as DefaultAdminTransferScheduledEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  ServiceCreated as ServiceCreatedEvent,
  ServiceExecutionAccepted as ServiceExecutionAcceptedEvent,
  ServiceExecutionCanceled as ServiceExecutionCanceledEvent,
  ServiceExecutionDisputed as ServiceExecutionDisputedEvent,
  ServiceExecutionRequested as ServiceExecutionRequestedEvent,
  ServiceExecutionResolved as ServiceExecutionResolvedEvent,
  ServiceExecutionValidated as ServiceExecutionValidatedEvent,
  ServiceUpdated as ServiceUpdatedEvent
} from '../generated/VisibilityServices/VisibilityServices'
import {
  DefaultAdminDelayChangeCanceled,
  DefaultAdminDelayChangeScheduled,
  DefaultAdminTransferCanceled,
  DefaultAdminTransferScheduled,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  ServiceExecutionAccepted,
  ServiceExecutionCanceled,
  ServiceExecutionDisputed,
  ServiceExecutionRequested,
  ServiceExecutionResolved,
  ServiceExecutionValidated,
  ServiceUpdated
} from '../generated/schema'

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

export function handleServiceCreated(event: ServiceCreatedEvent): void {}

export function handleServiceExecutionAccepted(
  event: ServiceExecutionAcceptedEvent
): void {
  let entity = new ServiceExecutionAccepted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.responseData = event.params.responseData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionCanceled(
  event: ServiceExecutionCanceledEvent
): void {
  let entity = new ServiceExecutionCanceled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.from = event.params.from
  entity.cancelData = event.params.cancelData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionDisputed(
  event: ServiceExecutionDisputedEvent
): void {
  let entity = new ServiceExecutionDisputed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.disputeData = event.params.disputeData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionRequested(
  event: ServiceExecutionRequestedEvent
): void {
  let entity = new ServiceExecutionRequested(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.requester = event.params.requester
  entity.requestData = event.params.requestData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionResolved(
  event: ServiceExecutionResolvedEvent
): void {
  let entity = new ServiceExecutionResolved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce
  entity.refund = event.params.refund
  entity.resolveData = event.params.resolveData

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceExecutionValidated(
  event: ServiceExecutionValidatedEvent
): void {
  let entity = new ServiceExecutionValidated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.serviceNonce = event.params.serviceNonce
  entity.executionNonce = event.params.executionNonce

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceUpdated(event: ServiceUpdatedEvent): void {
  let entity = new ServiceUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nonce = event.params.nonce
  entity.enabled = event.params.enabled

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
