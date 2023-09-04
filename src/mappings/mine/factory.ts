import { NewMineV2 } from "../../types/mine/DODOMineV2Factory/DODOMineV2Factory";
import { MinePool } from "../../types/mine/schema";

export function handleNewMineV2(event: NewMineV2): void {
    let minePool = MinePool.load(event.params.mine.toHexString());

    if (minePool == null) {
        minePool = new MinePool(event.params.mine.toHexString());
    }
    minePool.pool = event.params.mine;
    minePool.isLpToken = event.params.isLpToken;
    minePool.updatedAt = event.block.timestamp;
    minePool.save();
}
