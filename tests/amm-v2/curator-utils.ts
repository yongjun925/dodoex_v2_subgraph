import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  createMockedFunction,
  newMockEvent,
} from "matchstick-as/assembly/index";

import { PairCreated as LegacyPairCreated } from "../../src/types/amm-v2/Factory/Factory";
import {
  PairCreated,
  PairCreatedCurator,
} from "../../src/types/amm-v2/FactoryCurator/FactoryCurator";
import { LpMtCuratorChange } from "../../src/types/amm-v2/templates/Pair/Pair";

declare namespace _assert {
  function dataSourceCount(template: string, expectedCount: i32): bool;
  function dataSourceExists(template: string, address: string): bool;
}

export const LEGACY_FACTORY = Address.fromString(
  "0x1d416077dc5a9721d4f7a57f2cbccb0e65d8373e",
);
export const CURATOR_FACTORY = Address.fromString(
  "0xd6e677064032f755986e779c9e6e7151d2d892bd",
);
export const TOKEN0 = Address.fromString(
  "0x0000000000000000000000000000000000000011",
);
export const TOKEN1 = Address.fromString(
  "0x0000000000000000000000000000000000000022",
);
export const PAIR = Address.fromString(
  "0x0000000000000000000000000000000000000033",
);
export const CURATOR = Address.fromString(
  "0x00000000000000000000000000000000000000aa",
);
export const NEXT_CURATOR = Address.fromString(
  "0x00000000000000000000000000000000000000bb",
);

function configureEvent(event: ethereum.Event, address: Address): void {
  event.address = address;
  event.block.number = BigInt.fromI32(28707173);
  event.block.timestamp = BigInt.fromI32(1720000000);
}

export function createLegacyPairCreated(): LegacyPairCreated {
  let event = changetype<LegacyPairCreated>(newMockEvent());
  configureEvent(event, LEGACY_FACTORY);
  event.parameters = pairParameters(BigInt.fromI32(300));
  return event;
}

export function createPairCreated(): PairCreated {
  let event = changetype<PairCreated>(newMockEvent());
  configureEvent(event, CURATOR_FACTORY);
  event.parameters = pairParameters(BigInt.fromI32(300));
  return event;
}

export function createPairCreatedCurator(): PairCreatedCurator {
  let event = changetype<PairCreatedCurator>(newMockEvent());
  configureEvent(event, CURATOR_FACTORY);
  event.parameters = pairParameters(BigInt.fromI32(300)).concat([
    new ethereum.EventParam("curator", ethereum.Value.fromAddress(CURATOR)),
  ]);
  return event;
}

export function createCuratorChange(): LpMtCuratorChange {
  let event = changetype<LpMtCuratorChange>(newMockEvent());
  configureEvent(event, PAIR);
  event.parameters = [
    new ethereum.EventParam(
      "curator",
      ethereum.Value.fromAddress(NEXT_CURATOR),
    ),
  ];
  return event;
}

function pairParameters(feeRate: BigInt): ethereum.EventParam[] {
  return [
    new ethereum.EventParam("token0", ethereum.Value.fromAddress(TOKEN0)),
    new ethereum.EventParam("token1", ethereum.Value.fromAddress(TOKEN1)),
    new ethereum.EventParam("pair", ethereum.Value.fromAddress(PAIR)),
    new ethereum.EventParam(
      "feeRate",
      ethereum.Value.fromUnsignedBigInt(feeRate),
    ),
    new ethereum.EventParam(
      "len",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(11)),
    ),
  ];
}

export function mockPoolMetadata(): void {
  mockTokenMetadata(TOKEN0, "TK0", "Token 0");
  mockTokenMetadata(TOKEN1, "TK1", "Token 1");
  mockTokenMetadata(PAIR, "DLP", "DODO LP");
}

function mockTokenMetadata(
  address: Address,
  symbol: string,
  name: string,
): void {
  createMockedFunction(address, "symbol", "symbol():(string)").returns([
    ethereum.Value.fromString(symbol),
  ]);
  createMockedFunction(address, "name", "name():(string)").returns([
    ethereum.Value.fromString(name),
  ]);
  createMockedFunction(address, "decimals", "decimals():(uint32)").returns([
    ethereum.Value.fromI32(18),
  ]);
  createMockedFunction(
    address,
    "totalSupply",
    "totalSupply():(uint256)",
  ).returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1000000))]);
}

export function mockLpMtRatio(ratio: i32): void {
  createMockedFunction(PAIR, "lpMtRatio", "lpMtRatio():(uint256)").returns([
    ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(ratio)),
  ]);
}

export function mockRevertedLpMtRatio(): void {
  createMockedFunction(PAIR, "lpMtRatio", "lpMtRatio():(uint256)").reverts();
}

export function assertPairTemplateCreated(): void {
  if (
    !_assert.dataSourceCount("Pair", 1) ||
    !_assert.dataSourceExists("Pair", PAIR.toHexString())
  ) {
    throw new Error("Pair template was not created");
  }
}
