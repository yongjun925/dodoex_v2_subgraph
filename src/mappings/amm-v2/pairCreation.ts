/* eslint-disable prefer-const */
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";

import { AMMFactory, Bundle, Pair, Token } from "../../types/amm-v2/schema";
import { Pair as PairTemplate } from "../../types/amm-v2/templates";
import { ADDRESS_ZERO, FACTORY_ADDRESS, ZERO_BD, ZERO_BI } from "../constant";
import {
  convertTokenToDecimal,
  createLpToken,
  fetchTokenDecimals,
  fetchTokenName,
  fetchTokenSymbol,
  fetchTokenTotalSupply,
} from "./helpers";

export class PairCreationInput {
  token0: Address;
  token1: Address;
  pair: Address;
  feeRate: BigInt = ZERO_BI;
  lpMtRatio: BigInt = ZERO_BI;
  len: BigInt | null = null;
  curator: Address | null = null;

  constructor(token0: Address, token1: Address, pair: Address) {
    this.token0 = token0;
    this.token1 = token1;
    this.pair = pair;
  }
}

export function createPair(
  event: ethereum.Event,
  input: PairCreationInput,
): void {
  let factory = getOrCreateFactory(event.block.timestamp);
  factory.pairCount = factory.pairCount + 1;
  factory.updatedAt = event.block.timestamp;
  factory.save();

  getOrCreateToken(input.token0, event.block.timestamp);
  getOrCreateToken(input.token1, event.block.timestamp);

  let pair = initializePair(event, input);
  attachLpToken(pair, input.pair, event.block.timestamp);
  PairTemplate.create(input.pair);
  pair.updatedAt = event.block.timestamp;
  pair.save();
}

function getOrCreateFactory(timestamp: BigInt): AMMFactory {
  let factory = AMMFactory.load(FACTORY_ADDRESS);
  if (factory !== null) {
    return factory as AMMFactory;
  }

  factory = new AMMFactory(FACTORY_ADDRESS);
  factory.pairCount = 0;
  factory.totalVolumeETH = ZERO_BD;
  factory.totalLiquidityETH = ZERO_BD;
  factory.totalVolumeUSD = ZERO_BD;
  factory.untrackedVolumeUSD = ZERO_BD;
  factory.totalLiquidityUSD = ZERO_BD;
  factory.txCount = ZERO_BI;
  factory.updatedAt = timestamp;
  createBundle(timestamp);
  return factory as AMMFactory;
}

function createBundle(timestamp: BigInt): void {
  let bundle = new Bundle("1");
  bundle.ethPrice = ZERO_BD;
  bundle.updatedAt = timestamp;
  bundle.save();
}

function getOrCreateToken(address: Address, timestamp: BigInt): Token {
  let token = Token.load(address.toHexString());
  if (token === null) {
    token = initializeToken(address, timestamp);
  }
  token.updatedAt = timestamp;
  token.save();
  return token as Token;
}

function initializeToken(address: Address, timestamp: BigInt): Token {
  let token = new Token(address.toHexString());
  token.symbol = fetchTokenSymbol(address);
  token.name = fetchTokenName(address);
  token.totalSupply = fetchTokenTotalSupply(address);
  token.decimals = fetchTokenDecimals(address);
  token.timestamp = timestamp;
  initializeTokenVolume(token);
  initializeTokenLiquidity(token);
  return token;
}

function initializeTokenVolume(token: Token): void {
  token.tradeVolume = ZERO_BD;
  token.tradeVolumeBridge = ZERO_BD;
  token.tradeVolumeUSD = ZERO_BD;
  token.untrackedVolume = ZERO_BD;
  token.untrackedVolumeUSD = ZERO_BD;
  token.volumeUSD = ZERO_BD;
  token.volumeUSDBridge = ZERO_BD;
  token.txCount = ZERO_BI;
  token.traderCount = ZERO_BI;
}

function initializeTokenLiquidity(token: Token): void {
  token.derivedETH = ZERO_BD;
  token.totalLiquidity = ZERO_BD;
  token.totalLiquidityOnDODO = ZERO_BD;
  token.usdPrice = ZERO_BD;
  token.priceUpdateTimestamp = ZERO_BI;
}

function initializePair(event: ethereum.Event, input: PairCreationInput): Pair {
  let pair = new Pair(input.pair.toHexString());
  let baseToken = Token.load(input.token0.toHexString())!;
  let quoteToken = Token.load(input.token1.toHexString())!;
  initializePairIdentity(pair, event, input);
  pair.baseToken = baseToken.id;
  pair.quoteToken = quoteToken.id;
  pair.baseSymbol = baseToken.symbol;
  pair.quoteSymbol = quoteToken.symbol;
  initializePairLiquidity(pair);
  initializePairVolume(pair);
  initializePairFees(pair, input);
  initializePairPolicy(pair);
  return pair;
}

function initializePairIdentity(
  pair: Pair,
  event: ethereum.Event,
  input: PairCreationInput,
): void {
  pair.type = "AMMV2";
  pair.creator = event.transaction.from;
  pair.owner = event.transaction.from;
  pair.createdAtTimestamp = event.block.timestamp;
  pair.createdAtBlockNumber = event.block.number;
  pair.i = ZERO_BI;
  pair.k = ZERO_BI;
  if (input.len !== null) pair.len = input.len as BigInt;
  if (input.curator !== null) pair.curator = input.curator as Address;
}

function initializePairLiquidity(pair: Pair): void {
  pair.baseReserve = ZERO_BD;
  pair.quoteReserve = ZERO_BD;
  pair.trackedReserveETH = ZERO_BD;
  pair.reserveETH = ZERO_BD;
  pair.reserveUSD = ZERO_BD;
  pair.totalSupply = ZERO_BD;
  pair.baseTokenPrice = ZERO_BD;
  pair.quoteTokenPrice = ZERO_BD;
  pair.lastTradePrice = ZERO_BD;
  pair.liquidityProviderCount = ZERO_BI;
}

function initializePairVolume(pair: Pair): void {
  pair.volumeBaseToken = ZERO_BD;
  pair.volumeQuoteToken = ZERO_BD;
  pair.volumeUSD = ZERO_BD;
  pair.untrackedBaseVolume = ZERO_BD;
  pair.untrackedQuoteVolume = ZERO_BD;
  pair.untrackedVolumeUSD = ZERO_BD;
  pair.feeBase = ZERO_BD;
  pair.feeQuote = ZERO_BD;
  pair.feeUSD = ZERO_BD;
  pair.mtFeeBase = ZERO_BD;
  pair.mtFeeQuote = ZERO_BD;
  pair.mtFeeUSD = ZERO_BD;
  pair.txCount = ZERO_BI;
  pair.traderCount = ZERO_BI;
}

function initializePairFees(pair: Pair, input: PairCreationInput): void {
  pair.feeRate = input.feeRate;
  pair.lpMtRatio = input.lpMtRatio;
  pair.mtFeeRate = input.feeRate.div(input.lpMtRatio);
  pair.lpFeeRate = convertTokenToDecimal(
    input.feeRate.minus(pair.mtFeeRate),
    BigInt.fromI32(4),
  );
  pair.mtFeeRateModel = Address.fromString(ADDRESS_ZERO);
  pair.maintainer = Address.fromString(ADDRESS_ZERO);
}

function initializePairPolicy(pair: Pair): void {
  pair.isTradeAllowed = true;
  pair.isDepositBaseAllowed = true;
  pair.isDepositQuoteAllowed = true;
}

function attachLpToken(pair: Pair, address: Address, timestamp: BigInt): void {
  let lpToken = createLpToken(address, pair);
  lpToken.updatedAt = timestamp;
  lpToken.save();
  pair.baseLpToken = lpToken.id;
  pair.quoteLpToken = lpToken.id;
}
