import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore
} from 'matchstick-as/assembly/index'
import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts'
import { CreatorFeeClaimed } from '../generated/schema'
import { CreatorFeeClaimed as CreatorFeeClaimedEvent } from '../generated/VisibilityCredits/VisibilityCredits'
import {
  handleCreatorFeeClaimed,
  handleCreditsTrade,
  handleCreditsTransfer
} from '../src/visibility-credits'
import {
  createCreatorFeeClaimedEvent,
  createCreditsTradeEvent,
  createCreditsTransferEvent
} from './visibility-credits-utils'

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe('Describe entity assertions', () => {
  beforeAll(() => {
    let creator = Address.fromString(
      '0x0000000000000000000000000000000000000001'
    )
    let amount = BigInt.fromI32(2)
    let newCreatorFeeClaimedEvent = createCreatorFeeClaimedEvent(
      creator,
      amount
    )
    handleCreatorFeeClaimed(newCreatorFeeClaimedEvent)

    let from = Address.fromString('0x0000000000000000000000000000000000000002')
    let to = Address.fromString('0x0000000000000000000000000000000000000003')
    let visibilityId = 'x-test'
    let isBuy = true
    let tradeCost = BigInt.fromI32(100)
    let creatorFee = BigInt.fromI32(2)
    let referrerFee = BigInt.fromI32(1)
    let protocolFee = BigInt.fromI32(1)
    let referrer = Address.fromString(
      '0x0000000000000000000000000000000000000003'
    )
    let newTotalSupply = BigInt.fromI32(5)
    let newCurrentPrice = BigInt.fromI32(10)

    let newCreditsTradeEvent = createCreditsTradeEvent(
      changetype<ethereum.Tuple>([
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromString(visibilityId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromBoolean(isBuy),
        ethereum.Value.fromUnsignedBigInt(tradeCost),
        ethereum.Value.fromUnsignedBigInt(creatorFee),
        ethereum.Value.fromUnsignedBigInt(protocolFee),
        ethereum.Value.fromUnsignedBigInt(referrerFee),
        ethereum.Value.fromAddress(referrer),
        ethereum.Value.fromUnsignedBigInt(newTotalSupply),
        ethereum.Value.fromUnsignedBigInt(newCurrentPrice)
      ])
    )
    handleCreditsTrade(newCreditsTradeEvent)

    let newCreditsTransferEvent = createCreditsTransferEvent(
      visibilityId,
      from,
      to,
      amount
    )
    handleCreditsTransfer(newCreditsTransferEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test('CreatorFeeClaimed created and stored', () => {
    assert.entityCount('CreatorFeeClaimed', 1)
    logStore()

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      'CreatorFeeClaimed',
      'auto',
      'creator',
      '0x0000000000000000000000000000000000000001'
    )
    assert.fieldEquals('CreatorFeeClaimed', 'auto', 'amount', '2')

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
