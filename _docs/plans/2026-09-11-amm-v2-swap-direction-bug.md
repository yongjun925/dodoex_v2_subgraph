# AMM V2 Swap 方向未判定导致反向交易被索引为 0

**状态：** 已部署，历史数据嫁接重放完成（2026-09-11）

**一句话：** `handleSwap` 硬编码 `amountIn = amount0In`、`amountOut = amount1Out`，没有判断交易方向。UniV2 的 Swap 事件中 `quote → base` 方向恰好是这两个字段为 0，因此约一半的 AMM V2 交易被索引成 `amountIn=0 / amountOut=0`，且 `fromToken/toToken` 与真实方向相反。

---

## 根因

`src/mappings/amm-v2/core.ts` 的 `handleSwap`，四个字段全部硬编码，没有任何方向分支：

```ts
// core.ts:768-777
swap.fromToken = pair.baseToken;   // 恒为 base
swap.toToken   = pair.quoteToken;  // 恒为 quote
swap.amountIn  = amount0In;        // 恒取 token0 的 in
swap.amountOut = amount1Out;       // 恒取 token1 的 out
```

同一个 bug 在 `OrderHistory` 上还有一份：

```ts
// core.ts:872-878
orderHistory.fromToken = token0.id;
orderHistory.toToken   = token1.id;
orderHistory.amountIn  = amount0In;
orderHistory.amountOut = amount1Out;
```

UniV2 风格的 `Swap` 事件有四个量，一笔交易只有其中两个非零：

| 方向 | amount0In | amount1In | amount0Out | amount1Out |
| --- | --- | --- | --- | --- |
| base → quote | **>0** | 0 | 0 | **>0** |
| quote → base | 0 | **>0** | **>0** | 0 |

代码恒取 `amount0In` / `amount1Out`，所以 `quote → base` 方向两个值都取到 0。

## 已完成

- `handleSwap` 按 `amount0In` 是否为正判定交易方向，修正 `Swap` 和 `OrderHistory` 的派生字段。
- 新增 token0 输入、token1 输入两条 Matchstick 回归测试，覆盖方向和金额字段。
- Pharos Atlantic manifest 编译验证通过，测试结果为 9/9。

历史区块重放已通过新 deployment 执行；下游聚合重算仍需单独评估。

当前 Pharos 主网 deployment 使用现有健康 deployment
`QmPbz2uYz3qYRaESrfRoYTWJkYfoMqThezodYfrcVEmooK` 在区块 `15988988` 进行 graft，
新 deployment CID 为 `QmZeoTwcmcKjUs6SzAMf3J9Rma9Lzcy3Vp4PHBrmzWzrab`。
新 deployment 已追平链头并接管线上 alias。

## 证据

Pharos 主网实际交易 `0x9e2f05cfbf02edffac2028f8c0ea720aad132fa25414dac8a34d4788a10da49e`
（池 `0x84b95f91c2eed0fed7d540beef5e620b5de4c749`，pT101/WPROS，2026-09-09 03:48:13 UTC）：

```
amount0In:  0                        ← 被当成 amountIn
amount1In:  0.000001                 ← 真实输入 WPROS
amount0Out: 403.09261977057974379    ← 真实输出 pT101
amount1Out: 0                        ← 被当成 amountOut

amountIn:   0        ❌
amountOut:  0        ❌
fromToken:  pT101    ❌（真实是 WPROS）
toToken:    WPROS    ❌（真实是 pT101）
```

真实方向是 WPROS → pT101。**注意这不是数值精度问题** —— 输出 403.09 并不小，纯粹是取错了字段。

## 影响面

`amm-v2-pharos` 部署采样 1000 笔 swap：

```
正向 base→quote (amount0In>0):        541
反向 quote→base (amount1In>0):        462
被索引成 amountIn=0 且 amountOut=0:    459
反向交易中被索引成 0 的:               459 / 462  (~99%)
```

即 **约 46% 的 AMM V2 交易金额为 0，且所有交易的 fromToken/toToken 都不反映真实方向**（正向交易碰巧与硬编码值一致，反向则完全相反）。

受影响的 manifest：**18 个**

- 直接引用 `core.ts` 的 16 个：`arbitrum`、`arb-sep`、`bsc`、`base-mainnet`、`nero`、`neox`、`eth`、`plume`、`monad-testnet`、`taiko`、`pharos-testnet`、`polygon`、`rise-testnet`、`sepolia`、`zetachain`、`zetachain-testnet`
- 经 `curatorCore.ts` 转发的 2 个：`pharos`、`pharos-atlantic-testnet`
  （`curatorCore.handleSwap` 只是 `handleCoreSwap` 的薄封装，不含额外逻辑）

### 下游影响

- **`business-data-service` curator 手续费接口** `/api/v1/curator-swap/summary`：手续费按 `amount_out * feeRate / 10000` 计算，反向交易全部算成 0。这是本次发现该 bug 的入口。
- **`dodoex_swap` 表**：`amount_in`、`amount_out`、`from_token`、`to_token` 四列对反向交易均不可信。Pharos 主网近 3 天 v2 有 27 笔、11 笔零值（40.7%）。
- **暂不受影响**：Pharos 的 `priceList`（LiquidityList 接口）实际读到的几乎全是 AMM V3 数据 —— 近 3 天 v3 有 34583 笔、零值 0 笔。但该逻辑在 `amount_in/amount_out` 为 0 时会跳过该笔，所以一旦某条链 v2 占比升高，会出现日线收盘价取到的不是真正最后一笔成交。

## 修复方案

按 `amount0In` 是否为正判定方向，两处都要改：

```ts
// core.ts handleSwap
let isBaseIn = amount0In.gt(ZERO_BD);
if (isBaseIn) {
  swap.fromToken = pair.baseToken;
  swap.toToken   = pair.quoteToken;
  swap.amountIn  = amount0In;
  swap.amountOut = amount1Out;
} else {
  swap.fromToken = pair.quoteToken;
  swap.toToken   = pair.baseToken;
  swap.amountIn  = amount1In;
  swap.amountOut = amount0Out;
}
```

`OrderHistory`（core.ts:872-878）同理。

`amount0In`/`amount1In`/`amount0Out`/`amount1Out` 四个原始字段已在 schema 中且值正确，修复只影响派生的 `amountIn`/`amountOut`/`fromToken`/`toToken`。

### 待确认项

1. **测试缺失。** `_docs`（business-data-service 侧）的 `pharos-curator-swap-summary-implementation-plan.md` Task 4 声称保留了 "token0 输入和 token1 输入对 `fromToken/toToken/amountIn/amountOut` 的断言"，checkbox 全部已勾。但它列出的 `tests/amm-v2/swap.test.ts` 和 `tests/amm-v2/swap-utils.ts` 在**所有分支都不存在**，`core.ts` 也从未有过方向判断。该 Task 实际未落地，**不能当作已有基线**。修复时需要新建这两个测试。
2. **历史数据回填。** 修复 mapping 只影响新索引的区块，存量错误数据需要重放。18 个 manifest 全量重放代价高，需要评估：是否只重放 pharos / pharos-atlantic，其余链走 grafting 或接受历史数据不准。
3. **两笔特例。** 采样中有 3 笔 `amount1In > 0` 但未被索引成 0，需要确认是否存在 `amount0In` 与 `amount1In` 同时为正的情况（多跳/闪电兑换），若有则 `isBaseIn` 的判定需要更严谨。
4. **下游重算。** `dodoex_swap` 修正后，`business-data-service` 侧依赖该表的聚合（curator 手续费、volume）需要一并复核。

## 相关

- 发现路径：验证 `/api/v1/curator-swap/summary` 时用户地址 `0x0C5596F1A73984824bC85F986eE06aEdbbbe78aA` 返回 `swapCount=1` 但金额全 0
- Pharos 主网 FactoryV2：`0x9916b96c366B0eF28cADD855f820AD9f274e72f3`
- Pharos 主网 Router V2：`0x728e1Fd63Fa38b350B206bFC2d60a351EBb9A995`
