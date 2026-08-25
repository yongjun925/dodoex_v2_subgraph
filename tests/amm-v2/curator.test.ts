import {
  clearStore,
  assert,
  describe,
  test,
  afterEach,
} from "matchstick-as/assembly/index";

import { Pair } from "../../src/types/amm-v2/schema";
import { FACTORY_ADDRESS } from "../../src/mappings/constant";
import { handleNewPair as handleLegacyPair } from "../../src/mappings/amm-v2/factory";
import {
  handleNewCuratorPair,
  handleNewPair,
} from "../../src/mappings/amm-v2/factoryCurator";
import { handleLpMtCuratorChange } from "../../src/mappings/amm-v2/curatorCore";
import {
  CURATOR,
  NEXT_CURATOR,
  PAIR,
  assertPairTemplateCreated,
  createCuratorChange,
  createLegacyPairCreated,
  createPairCreated,
  createPairCreatedCurator,
  mockLpMtRatio,
  mockPoolMetadata,
  mockRevertedLpMtRatio,
} from "./curator-utils";

const ATLANTIC_FACTORY_ID = "0x1d416077dC5a9721D4F7A57f2CbCCb0e65d8373E";

describe("AMMv2 curator factory", () => {
  afterEach(() => {
    clearStore();
  });

  test("keeps the legacy factory ratio and nullable curator fields", () => {
    mockPoolMetadata();

    handleLegacyPair(createLegacyPairCreated());

    assert.stringEquals(ATLANTIC_FACTORY_ID, FACTORY_ADDRESS);
    assert.fieldEquals("AMMFactory", ATLANTIC_FACTORY_ID, "pairCount", "1");
    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "6");
    assert.fieldEquals("Pair", PAIR.toHexString(), "mtFeeRate", "50");
    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.len === null);
    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.curator === null);
  });

  test("indexes a regular curator-factory pool with its on-chain ratio", () => {
    mockPoolMetadata();
    mockLpMtRatio(3);

    handleNewPair(createPairCreated());

    assert.entityCount("Pair", 1);
    assert.fieldEquals("AMMFactory", ATLANTIC_FACTORY_ID, "pairCount", "1");
    assert.fieldEquals("Pair", PAIR.toHexString(), "type", "AMMV2");
    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "3");
    assert.fieldEquals("Pair", PAIR.toHexString(), "mtFeeRate", "100");
    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.len === null);
    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.curator === null);
  });

  test("stores curator metadata for a curator pool", () => {
    mockPoolMetadata();
    mockLpMtRatio(4);

    handleNewCuratorPair(createPairCreatedCurator());

    assert.entityCount("Pair", 1);
    assertPairTemplateCreated();
    assert.fieldEquals("Pair", PAIR.toHexString(), "len", "11");
    assert.fieldEquals(
      "Pair",
      PAIR.toHexString(),
      "curator",
      CURATOR.toHexString(),
    );
    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "4");
  });

  test("updates the current curator after pair creation", () => {
    mockPoolMetadata();
    mockLpMtRatio(4);
    handleNewCuratorPair(createPairCreatedCurator());

    handleLpMtCuratorChange(createCuratorChange());

    assert.fieldEquals(
      "Pair",
      PAIR.toHexString(),
      "curator",
      NEXT_CURATOR.toHexString(),
    );
  });

  test("falls back to ratio two when the pair call reverts", () => {
    mockPoolMetadata();
    mockRevertedLpMtRatio();

    handleNewPair(createPairCreated());

    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "2");
    assert.fieldEquals("Pair", PAIR.toHexString(), "mtFeeRate", "150");
  });
});
