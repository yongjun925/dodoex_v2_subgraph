import { log } from "@graphprotocol/graph-ts";

import { Pair } from "../../types/amm-v2/schema";
import {
  Burn,
  FeeRateChange,
  LpMtCuratorChange,
  LpMtRatioChange,
  Mint,
  Swap,
  Sync,
  Transfer,
} from "../../types/amm-v2/templates/Pair/Pair";
import {
  handleBurn as handleCoreBurn,
  handleFeeRateChange as handleCoreFeeRateChange,
  handleLpMtRatioChange as handleCoreLpMtRatioChange,
  handleMint as handleCoreMint,
  handleSwap as handleCoreSwap,
  handleSync as handleCoreSync,
  handleTransfer as handleCoreTransfer,
} from "./core";

export function handleMint(event: Mint): void {
  handleCoreMint(event);
}

export function handleBurn(event: Burn): void {
  handleCoreBurn(event);
}

export function handleSwap(event: Swap): void {
  handleCoreSwap(event);
}

export function handleTransfer(event: Transfer): void {
  handleCoreTransfer(event);
}

export function handleSync(event: Sync): void {
  handleCoreSync(event);
}

export function handleFeeRateChange(event: FeeRateChange): void {
  handleCoreFeeRateChange(event);
}

export function handleLpMtRatioChange(event: LpMtRatioChange): void {
  handleCoreLpMtRatioChange(event);
}

export function handleLpMtCuratorChange(event: LpMtCuratorChange): void {
  let pair = Pair.load(event.address.toHexString());
  if (pair === null) {
    log.warning("curator changed for unknown pair {}", [
      event.address.toHexString(),
    ]);
    return;
  }
  pair.curator = event.params.curator;
  pair.updatedAt = event.block.timestamp;
  pair.save();
}
