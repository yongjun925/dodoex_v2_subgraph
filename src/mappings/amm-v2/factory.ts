import { BigInt } from "@graphprotocol/graph-ts";

import { PairCreated } from "../../types/amm-v2/Factory/Factory";
import { createPair, PairCreationInput } from "./pairCreation";

const LEGACY_LP_MT_RATIO = BigInt.fromI32(6);

export function handleNewPair(event: PairCreated): void {
  let input = new PairCreationInput(
    event.params.token0,
    event.params.token1,
    event.params.pair,
  );
  input.feeRate = event.params.feeRate;
  input.lpMtRatio = LEGACY_LP_MT_RATIO;
  createPair(event, input);
}
