import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  PairCreated,
  PairCreatedCurator,
} from "../../types/amm-v2/FactoryCurator/FactoryCurator";
import { Pair as PairContract } from "../../types/amm-v2/FactoryCurator/Pair";
import { createPair, PairCreationInput } from "./pairCreation";

const DEFAULT_LP_MT_RATIO = BigInt.fromI32(2);

export function handleNewPair(event: PairCreated): void {
  let input = createInput(
    event.params.token0,
    event.params.token1,
    event.params.pair,
  );
  input.feeRate = event.params.feeRate;
  createPair(event, input);
}

export function handleNewCuratorPair(event: PairCreatedCurator): void {
  let input = createInput(
    event.params.token0,
    event.params.token1,
    event.params.pair,
  );
  input.feeRate = event.params.feeRate;
  input.len = event.params.len;
  input.curator = event.params.curator;
  createPair(event, input);
}

function createInput(
  token0: Address,
  token1: Address,
  pair: Address,
): PairCreationInput {
  let input = new PairCreationInput(token0, token1, pair);
  input.lpMtRatio = fetchLpMtRatio(pair);
  return input;
}

function fetchLpMtRatio(pair: Address): BigInt {
  let result = PairContract.bind(pair).try_lpMtRatio();
  if (!result.reverted) {
    return result.value;
  }

  log.warning("lpMtRatio call reverted for pair {}, fallback to {}", [
    pair.toHexString(),
    DEFAULT_LP_MT_RATIO.toString(),
  ]);
  return DEFAULT_LP_MT_RATIO;
}
