import { BigInt } from "@graphprotocol/graph-ts";
import { UserClaim, UserStake, UserWithdraw } from "../../types/mine/schema";
import { Claim, Deposit, Withdraw } from "../../types/mine/templates/ERC20Mine/ERC20Mine";

export function handleClaim(event: Claim): void {
  let id = event.params.user
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let userClaim = UserClaim.load(id);
  if (userClaim == null) {
    userClaim = new UserClaim(id);
    userClaim.user = event.params.user;
    userClaim.pool = event.address;
    userClaim.amount = BigInt.fromI32(0);
  }
  userClaim.amount = userClaim.amount.plus(event.params.reward);
  userClaim.updatedAt = event.block.timestamp;
  userClaim.save();
}

export function handleDeposit(event: Deposit): void {
  let id = event.params.user
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let userClaim = UserStake.load(id);
  if (userClaim == null) {
    userClaim = new UserStake(id);
    userClaim.user = event.params.user;
    userClaim.pool = event.address;
    userClaim.balance = BigInt.fromI32(0);
  }
  userClaim.balance = userClaim.balance.plus(event.params.amount);
  userClaim.updatedAt = event.block.timestamp;
  userClaim.save();
}


export function handleWithdraw(event: Withdraw): void {
  let id = event.params.user
    .toHexString()
    .concat("-")
    .concat(event.address.toHexString());
  let userWithdraw = UserWithdraw.load(id);
  if (userWithdraw == null) {
    userWithdraw = new UserWithdraw(id);
    userWithdraw.user = event.params.user;
    userWithdraw.pool = event.address;
    userWithdraw.amount = BigInt.fromI32(0);
  }
  userWithdraw.amount = userWithdraw.amount.plus(event.params.amount);
  userWithdraw.updatedAt = event.block.timestamp;
  userWithdraw.save();
}
