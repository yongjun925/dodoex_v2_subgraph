import {
  afterEach,
  assert,
  clearStore,
  describe,
  test,
} from "matchstick-as/assembly/index";
import { Address } from "@graphprotocol/graph-ts";

import { handleNewPair } from "../../src/mappings/amm-v2/factoryV2";
import { handleSwap } from "../../src/mappings/amm-v2/core";
import {
  PAIR,
  TOKEN0,
  TOKEN1,
  mockLpMtRatio,
  mockPoolMetadata,
  createPairCreated,
} from "./curator-utils";
import { createSwap } from "./swap-utils";

function createPairForSwap(): void {
  mockPoolMetadata();
  mockLpMtRatio(2);
  handleNewPair(createPairCreated());
}

function assertSwapDirection(
  fromToken: Address,
  toToken: Address,
  amountIn: string,
  amountOut: string,
): void {
  let swapId = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-0";
  let orderHistoryId = "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1";
  assert.fieldEquals("Swap", swapId, "fromToken", fromToken.toHexString());
  assert.fieldEquals("Swap", swapId, "toToken", toToken.toHexString());
  assert.fieldEquals("Swap", swapId, "amountIn", amountIn);
  assert.fieldEquals("Swap", swapId, "amountOut", amountOut);
  assert.fieldEquals(
    "OrderHistory",
    orderHistoryId,
    "fromToken",
    fromToken.toHexString(),
  );
  assert.fieldEquals(
    "OrderHistory",
    orderHistoryId,
    "toToken",
    toToken.toHexString(),
  );
  assert.fieldEquals("OrderHistory", orderHistoryId, "amountIn", amountIn);
  assert.fieldEquals("OrderHistory", orderHistoryId, "amountOut", amountOut);
}

describe("AMMv2 swap direction", () => {
  afterEach(() => {
    clearStore();
  });

  test("maps token0 input to token1 output", () => {
    createPairForSwap();

    handleSwap(createSwap(PAIR, 5, 0, 0, 7));

    assert.entityCount("Swap", 1);
    assert.entityCount("OrderHistory", 1);
    assertSwapDirection(TOKEN0, TOKEN1, "5", "7");
  });

  test("maps token1 input to token0 output", () => {
    createPairForSwap();

    handleSwap(createSwap(PAIR, 0, 3, 9, 0));

    assert.entityCount("Swap", 1);
    assert.entityCount("OrderHistory", 1);
    assertSwapDirection(TOKEN1, TOKEN0, "3", "9");
  });
});
