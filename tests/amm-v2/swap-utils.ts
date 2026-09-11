import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/index";

import { Swap } from "../../src/types/amm-v2/templates/Pair/Pair";

export const SWAP_SENDER = Address.fromString(
  "0x0000000000000000000000000000000000000044",
);
export const SWAP_RECIPIENT = Address.fromString(
  "0x0000000000000000000000000000000000000055",
);
const TOKEN_UNIT = BigInt.fromString("1000000000000000000");

export function createSwap(
  pair: Address,
  amount0In: i32,
  amount1In: i32,
  amount0Out: i32,
  amount1Out: i32,
): Swap {
  let event = changetype<Swap>(newMockEvent());
  event.address = pair;
  event.block.number = BigInt.fromI32(28707173);
  event.block.timestamp = BigInt.fromI32(1720000000);
  event.logIndex = BigInt.fromI32(1);
  event.parameters = [
    new ethereum.EventParam(
      "sender",
      ethereum.Value.fromAddress(SWAP_SENDER),
    ),
    new ethereum.EventParam(
      "amount0In",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromI32(amount0In).times(TOKEN_UNIT),
      ),
    ),
    new ethereum.EventParam(
      "amount1In",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromI32(amount1In).times(TOKEN_UNIT),
      ),
    ),
    new ethereum.EventParam(
      "amount0Out",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromI32(amount0Out).times(TOKEN_UNIT),
      ),
    ),
    new ethereum.EventParam(
      "amount1Out",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromI32(amount1Out).times(TOKEN_UNIT),
      ),
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(SWAP_RECIPIENT),
    ),
  ];
  return event;
}
