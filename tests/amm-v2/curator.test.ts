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
} from "../../src/mappings/amm-v2/factoryV2";
import { handleLpMtCuratorChange } from "../../src/mappings/amm-v2/curatorCore";
import {
  NEXT_CURATOR,
  ONCHAIN_CURATOR,
  PAIR,
  assertPairTemplateCreated,
  createCuratorChange,
  createLegacyPairCreated,
  createPairCreated,
  createPairCreatedCurator,
  mockLpMtRatio,
  mockLpMtCurator,
  mockPoolMetadata,
  mockRevertedLpMtRatio,
  mockRevertedLpMtCurator,
} from "./curator-utils";

describe("AMMv2 FactoryV2", () => {
  afterEach(() => {
    clearStore();
  });

  test("keeps the legacy factory ratio and nullable curator", () => {
    mockPoolMetadata();

    handleLegacyPair(createLegacyPairCreated());

    assert.fieldEquals("AMMFactory", FACTORY_ADDRESS, "pairCount", "1");
    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "6");
    assert.fieldEquals("Pair", PAIR.toHexString(), "mtFeeRate", "50");
    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.curator === null);
  });

  test("indexes a regular FactoryV2 pool with its on-chain ratio", () => {
    mockPoolMetadata();
    mockLpMtRatio(3);

    handleNewPair(createPairCreated());

    assert.entityCount("Pair", 1);
    assert.fieldEquals("AMMFactory", FACTORY_ADDRESS, "pairCount", "1");
    assert.fieldEquals("Pair", PAIR.toHexString(), "type", "AMMV2");
    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "3");
    assert.fieldEquals("Pair", PAIR.toHexString(), "mtFeeRate", "100");
    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.curator === null);
  });

  test("stores the pair contract curator for a curator pool", () => {
    mockPoolMetadata();
    mockLpMtRatio(4);
    mockLpMtCurator();

    handleNewCuratorPair(createPairCreatedCurator());

    assert.entityCount("Pair", 1);
    assertPairTemplateCreated();
    assert.fieldEquals(
      "Pair",
      PAIR.toHexString(),
      "curator",
      ONCHAIN_CURATOR.toHexString(),
    );
    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "4");
  });

  test("leaves curator empty when the pair call reverts", () => {
    mockPoolMetadata();
    mockLpMtRatio(4);
    mockRevertedLpMtCurator();

    handleNewCuratorPair(createPairCreatedCurator());

    assert.booleanEquals(true, Pair.load(PAIR.toHexString())!.curator === null);
  });

  test("updates the current curator after pair creation", () => {
    mockPoolMetadata();
    mockLpMtRatio(4);
    mockLpMtCurator();
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

  test("falls back to ratio two for a curator pool", () => {
    mockPoolMetadata();
    mockRevertedLpMtRatio();
    mockLpMtCurator();

    handleNewCuratorPair(createPairCreatedCurator());

    assert.fieldEquals("Pair", PAIR.toHexString(), "lpMtRatio", "2");
    assert.fieldEquals("Pair", PAIR.toHexString(), "mtFeeRate", "150");
  });
});
