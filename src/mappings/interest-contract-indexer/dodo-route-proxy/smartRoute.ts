import {OrderHistory } from "../../../types/interest-contract-indexer/schema"
import {OrderHistory as OrderHistoryV2} from "../../../types/interest-contract-indexer/DODOV2Proxy02/DODOV2Proxy02"

export function handleOrderHistory(event: OrderHistoryV2): void {
    let orderHistoryID = event.transaction.hash.toHexString().concat("-").concat(event.logIndex.toString());
    let orderHistory = OrderHistory.load(orderHistoryID);
    if (orderHistory == null) {
        orderHistory = new OrderHistory(orderHistoryID);
        orderHistory.hash = event.transaction.hash.toHexString();
        orderHistory.timestamp = event.block.timestamp;
        orderHistory.blockNumber = event.block.number;
        orderHistory.logIndex = event.logIndex;
        // 主要是索引input数据用来比对生成的data是否上链了
        orderHistory.transactionInput = event.transaction.input; 
        orderHistory.fromToken = event.params.fromToken;
        orderHistory.toToken = event.params.toToken;
        orderHistory.from = event.transaction.from;
        orderHistory.to = event.params.sender;
        orderHistory.sender = event.params.sender;
        orderHistory.fromAmount = event.params.fromAmount;
        orderHistory.returnAmount = event.params.returnAmount;
    }
    orderHistory.updatedAt = event.block.timestamp;
    orderHistory.save();
}
