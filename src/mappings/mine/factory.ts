import { Address, BigInt } from "@graphprotocol/graph-ts";
import { NewMineV2 } from "../../types/mine/DODOMineV2Factory/DODOMineV2Factory";
import { MinePool, RewardDetail } from "../../types/mine/schema";
import { ERC20MineV3 as ERC20MineV3Template } from "../../types/mine/templates";
import { ERC20Mine, ERC20Mine__rewardTokenInfosResult } from "../../types/mine/templates/ERC20Mine/ERC20Mine";

function rewardTokenInfos(address: Address, index) {
    const contract = ERC20Mine.bind(address);
    const rewardTokenInfosResult = contract.rewardTokenInfos(index);
    return rewardTokenInfosResult as ERC20Mine__rewardTokenInfosResult;
}

export function getRewardNum(address: Address): BigInt {
    const contract = ERC20Mine.bind(address);
    const num = contract.getRewardNum();
    return num;
}


export function handleNewMineV2(event: NewMineV2): void {
    let minePool = MinePool.load(event.params.mine.toHexString());
    if (minePool == null) {
        minePool = new MinePool(event.params.mine.toHexString());
        minePool.updatedAt = event.block.timestamp;          
    }
    minePool.pool = event.params.mine;
    minePool.stakeToken = event.params.stakeToken;
    minePool.updatedAt = event.block.timestamp;
    minePool.save();
    ERC20MineV3Template.create(event.params.mine);

    const rewardTokensNum = getRewardNum(event.address);
    for (let i = 0; i < rewardTokensNum.toI32(); i++) {
        const rewardData = rewardTokenInfos(event.address, BigInt.fromI32(i));
        const detailID = event.address
          .toHexString()
          .concat("-")
          .concat(rewardData.value0.toHexString());
        let rewardDetail = RewardDetail.load(detailID);
    
        if (rewardDetail == null) {
          rewardDetail = new RewardDetail(detailID);
        }
        rewardDetail.minePool = minePool.id;
        rewardDetail.token = rewardData.value0;
        rewardDetail.startBlock = rewardData.value1;
        rewardDetail.endBlock = rewardData.value2;
        rewardDetail.rewardPerBlock = rewardData.value4;
        rewardDetail.updatedAt = event.block.timestamp;
        rewardDetail.save();
    }
}
