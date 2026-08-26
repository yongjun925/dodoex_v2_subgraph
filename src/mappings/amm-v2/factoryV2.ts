import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import {
  PairCreated,
  PairCreatedCurator,
} from "../../types/amm-v2/FactoryV2/FactoryV2";
import { Pair as PairContract } from "../../types/amm-v2/FactoryV2/Pair";
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
  input.curator = fetchLpMtCurator(event.params.pair);
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

function fetchLpMtCurator(pair: Address): Address | null {
  let result = PairContract.bind(pair).try_lpMtCurator();
  if (!result.reverted) {
    return result.value;
  }

  log.warning("lpMtCurator call reverted for pair {}, leave curator empty", [
    pair.toHexString(),
  ]);
  return null;
}
