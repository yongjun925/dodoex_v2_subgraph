# Pharos Mainnet FactoryV2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the new Pharos mainnet AMM V2 FactoryV2 to both the subgraph and route tracker, grafting from the current `amm-v2-pharos` deployment at the FactoryV2 start block, then deploying and verifying the subgraph before changing the tracker.

**Architecture:** Keep the legacy Factory active and add FactoryV2 as a second event source starting at its deployment block. Graft the existing `amm-v2-pharos` deployment at block `15988988` so legacy entities are preserved while every FactoryV2 event remains in the new deployment's indexing range. Both `PairCreated` and `PairCreatedCurator` create dynamic Pair listeners; the route tracker binds the same two factories and sends both creation events through the existing pair persistence path.

**Tech Stack:** Graph Protocol manifest and AssemblyScript mappings, repository-local Graph CLI, Matchstick, Node.js tracker scripts, Kubernetes port-forwarding, Graph Node/IPFS, blockchain-tracker hybrid API.

---

### Task 1: Establish the isolated subgraph baseline

**Files:**
- Read: `subgraphs/amm-v2/amm-v2_pharos.yaml`
- Read: `subgraphs/amm-v2/amm-v2_pharos-atlantic-testnet.yaml`
- Read: `src/mappings/amm-v2/factoryV2.ts`
- Read: `src/mappings/amm-v2/curatorCore.ts`

- [x] **Step 1: Confirm the worktree starts from the tested Atlantic implementation**

Run:

```bash
git status --short --branch
git log -1 --oneline
```

Expected: branch `codex/pharos-mainnet-factoryv2`, clean except this plan, with `07a7e3f` as the starting commit.

- [x] **Step 2: Run a schema and manifest baseline check**

Run:

```bash
rg -n "FactoryV2|PairCreatedCurator|LpMtCuratorChange" \
  subgraphs/amm-v2/amm-v2_pharos-atlantic-testnet.yaml \
  src/mappings/amm-v2/factoryV2.ts \
  src/mappings/amm-v2/curatorCore.ts
```

Expected: Atlantic contains the FactoryV2 data source, both creation handlers, and the curator-change Pair handler.

### Task 2: Add FactoryV2 to the Pharos mainnet subgraph

**Files:**
- Modify: `subgraphs/amm-v2/amm-v2_pharos.yaml`
- Modify: `tests/amm-v2/curator.test.ts`
- Generated and tracked: `build/subgraph.yaml`

- [x] **Step 1: Add the FactoryV2 data source and graft point**

Enable grafting from the current deployment at the FactoryV2 deployment block:

```yaml
graft:
  base: QmVTycTQUVXraZJhBCc8CwyTUbgaxCeDQNChTa8AY9821e
  block: 15988988
```

Insert after the legacy Factory data source:

```yaml
  - kind: ethereum/contract
    name: FactoryV2
    network: pharos
    source:
      address: "0x9916b96c366B0eF28cADD855f820AD9f274e72f3"
      abi: FactoryV2
      startBlock: 15988988
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      file: ../../src/mappings/amm-v2/factoryV2.ts
      entities:
        - Pair
        - Token
      abis:
        - name: FactoryV2
          file: ../../abis/amm-v2/factory-v2.json
        - name: Pair
          file: ../../abis/amm-v2/pair.json
        - name: ERC20
          file: ../../abis/amm-v2/ERC20.json
        - name: ERC20SymbolBytes
          file: ../../abis/amm-v2/ERC20SymbolBytes.json
        - name: ERC20NameBytes
          file: ../../abis/amm-v2/ERC20NameBytes.json
      eventHandlers:
        - event: PairCreated(indexed address,indexed address,address,uint256,uint256)
          handler: handleNewPair
        - event: PairCreatedCurator(indexed address,indexed address,address,uint256,uint256,address)
          handler: handleNewCuratorPair
```

- [x] **Step 2: Enable curator Pair state updates for both factories**

Change the Pair template mapping file from:

```yaml
file: ../../src/mappings/amm-v2/core.ts
```

to:

```yaml
file: ../../src/mappings/amm-v2/curatorCore.ts
```

and add:

```yaml
        - event: LpMtCuratorChange(address)
          handler: handleLpMtCuratorChange
```

- [x] **Step 3: Run source-level validation**

Run:

```bash
git diff --check
rg -n "0x9916b96c|startBlock: 15988988|PairCreatedCurator|curatorCore|LpMtCuratorChange" \
  subgraphs/amm-v2/amm-v2_pharos.yaml
```

Expected: no whitespace errors and all five mainnet integration markers are present.

- [x] **Step 4: Remove the Atlantic-only address assumption from curator tests**

Delete the `ATLANTIC_FACTORY_ID` literal and assert the `AMMFactory` entity with the imported chain-specific `FACTORY_ADDRESS`. This keeps the same behavior assertions valid for both Atlantic and Pharos mainnet constants.

### Task 3: Build and test the mainnet subgraph

**Files:**
- Temporarily modify then restore: `src/mappings/constant.ts`
- Generated and ignored: `src/types/amm-v2/`, `build/`

- [x] **Step 1: Select Pharos constants and generate types**

Run:

```bash
cp src/mappings/constant.ts /tmp/pharos-mainnet-constant.ts
cp src/mappings/constant-pharos.ts src/mappings/constant.ts
/Users/pengyongjun/workspace/blockchain/dodoex/dodoex_v2_subgraph/node_modules/.bin/graph \
  codegen subgraphs/amm-v2/amm-v2_pharos.yaml --output-dir src/types/amm-v2/
```

Expected: codegen exits 0 and generates `FactoryV2` plus `Pair` bindings.

- [x] **Step 2: Run Matchstick tests**

Run:

```bash
/Users/pengyongjun/workspace/blockchain/dodoex/dodoex_v2_subgraph/node_modules/.bin/graph test
```

Expected: all AMM V2 curator tests pass.

- [x] **Step 3: Build the mainnet manifest**

Run:

```bash
/Users/pengyongjun/workspace/blockchain/dodoex/dodoex_v2_subgraph/node_modules/.bin/graph \
  build subgraphs/amm-v2/amm-v2_pharos.yaml
```

Expected: build exits 0 and `build/subgraph.yaml` contains both Factory addresses.

- [x] **Step 4: Restore the tracked generic constants**

Run:

```bash
cp /tmp/pharos-mainnet-constant.ts src/mappings/constant.ts
git status --short
```

Expected: only the mainnet manifest, generated tracked manifest, chain-neutral curator test, and this plan remain as intended changes.

### Task 4: Deploy and verify `amm-v2-pharos`

**Files:**
- Deploy: `subgraphs/amm-v2/amm-v2_pharos.yaml`

- [x] **Step 1: Verify production targets are healthy before deployment**

Run:

```bash
KUBECONFIG=/Users/pengyongjun/.kube/prod-cluster-config \
  kubectl -n indexer get deploy,svc,pod | rg "graph-node-pharos|ipfs"
```

Expected: Graph Node and IPFS targets are present; Graph Node is Ready without evidence requiring a restart.

- [x] **Step 2: Forward Graph Node and IPFS locally**

Run three persistent commands:

```bash
KUBECONFIG=/Users/pengyongjun/.kube/prod-cluster-config kubectl -n indexer port-forward service/graph-node-pharos 18000:8000
KUBECONFIG=/Users/pengyongjun/.kube/prod-cluster-config kubectl -n indexer port-forward service/graph-node-pharos 18020:8020
KUBECONFIG=/Users/pengyongjun/.kube/prod-cluster-config kubectl -n indexer port-forward service/ipfs 15001:5001
```

Expected: all three local ports report forwarding.

- [x] **Step 3: Deploy with the repository script**

Run:

```bash
node bin/index-deploy.js \
  --target "the graph" \
  --subgraph amm-v2 \
  --ipfs http://127.0.0.1:15001 \
  --node http://127.0.0.1:18020 \
  --chain pharos \
  --yaml subgraphs/amm-v2/amm-v2_pharos.yaml
```

Expected: deployment of `amm-v2-pharos` returns a new IPFS CID without an indexing creation error.

- [x] **Step 4: Verify indexing and GraphQL runtime state**

Query Graph Node status and GraphQL `_meta` until the new deployment is healthy and advancing. Verify `synced`, `health`, `fatalError`, deployment CID, block number, and `hasIndexingErrors`.

Expected: new CID is current, health is not failed, `fatalError` is null, and the indexed block advances. During rollout, the upstream RPC rejected 5000-block `eth_getLogs` ranges with HTTP 400 while 1000-block ranges succeeded. After explicit approval, `GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE` was changed from `5000` to `1000`; the restarted Pod became Ready and the new CID caught up and became current.

- [x] **Step 5: Commit only the subgraph scope after runtime verification**

Run:

```bash
git add build/subgraph.yaml subgraphs/amm-v2/amm-v2_pharos.yaml tests/amm-v2/curator.test.ts _docs/plans/2026-08-27-pharos-mainnet-factoryv2.md
git diff --cached --check
git diff --cached --stat
git commit -m "feat(amm-v2): 接入 Pharos 主网 FactoryV2"
```

Expected: one commit containing only the mainnet source/generated manifests, the chain-neutral curator test, and plan.

### Task 5: Add FactoryV2 to the Pharos mainnet route tracker

**Files:**
- Modify: `pro/uni/dodo_univ2_route_pharos_events.ts`
- Read: `pro/uni/univ2_route.graphql`

- [x] **Step 1: Create an isolated tracker worktree from `dev`**

Run:

```bash
git worktree add /private/tmp/blockchain-tracker-script-pharos-mainnet \
  -b codex/pharos-mainnet-factoryv2-tracker dev
```

Expected: clean branch based on commit `6fc3548`.

- [x] **Step 2: Add the curator creation event ABI**

Append a `PairCreatedCurator` event entry with indexed `token0`/`token1` and non-indexed `pair`, `feeRate`, `len`, and `curator` to `UniswapV2FactoryABI`.

- [x] **Step 3: Bind the mainnet FactoryV2**

Add this bind after the legacy Factory:

```javascript
    {
      address: "0x9916b96c366B0eF28cADD855f820AD9f274e72f3", //UniswapV2 FactoryV2
      chainId,
      fromBlockNumber: 15988988,
      mergeEvent: false,
    },
```

- [x] **Step 4: Route both creation events through the existing persistence path**

Keep `onEventPairCreated` and chain:

```javascript
    .onEventPairCreatedCurator(async (events, ctx) => {
      await createOrUpdate(ctx, events, "c");
    });
```

Keep task version `v1_0_2`. The deployed subgraph proved that FactoryV2 emitted no
historical pair-creation events between block `15988988` and the current chain head,
so updating the already-caught-up version preserves all 100 legacy pools without a
multi-hour replay from the legacy Factory start block.

- [x] **Step 5: Validate tracker source**

Run formatting, syntax checks available in the repository, and a sandbox loader with a mock `ContractTracker` that confirms both event handlers register and both Factory binds are present.

Expected: the script loads, exposes `PairCreated` and `PairCreatedCurator` handlers, and binds start blocks `5197650` and `15988988`.

### Task 6: Publish, verify, and commit the route tracker

**Files:**
- Publish: `pro/uni/dodo_univ2_route_pharos_events.ts`
- Publish schema: `pro/uni/univ2_route.graphql`

- [x] **Step 1: Locate the live hybrid node containing `dodo_univ2_route_pharos`**

Forward each `blockchain-tracker-hybrid-*` service on a unique local port and query `/get_tracker_list`. Select the node that currently reports the mainnet task; do not publish to `blockchain-tracker-web`.

- [x] **Step 2: Publish version `v1_0_2` to that node twice**

POST the tracker source, `univ2_route.graphql`, and the discovered `nodeId` to `/update_tracker_task` on the selected hybrid service. Repeat the same-version publish once because the tracker update path persists the new definition first but schedules the previously loaded task object on its first call.

Expected: both calls return HTTP 200 with `success: true`; active task version remains `v1_0_2`.

- [x] **Step 3: Verify progress and runtime health twice**

Query `/get_tracker_task_progress`, target Pod readiness/restarts, recent logs, task list, and one latest Pair row. Repeat progress after a short interval.

Expected: both Factory binds and Pair tracking remain near head, Pod is Ready with no new restart, active task is valid, and all 100 Pair rows remain readable. The invalid experimental `v1_0_3` metadata row may still appear first in `/get_tracker_list` because that endpoint orders by creation time without filtering `valid`; removing that production database row requires separate approval.

- [x] **Step 4: Commit only the tracker script after runtime verification**

Run:

```bash
git add pro/uni/dodo_univ2_route_pharos_events.ts
git diff --cached --check
git diff --cached --stat
git commit -m "feat: support Pharos mainnet FactoryV2 pools"
```

Expected: one commit containing only the mainnet UniV2 tracker script; unrelated `.claude/` and `contract-config/` remain untouched in the original worktree.
