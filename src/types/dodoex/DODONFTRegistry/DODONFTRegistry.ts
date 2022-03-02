// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class NewRegistry extends ethereum.Event {
  get params(): NewRegistry__Params {
    return new NewRegistry__Params(this);
  }
}

export class NewRegistry__Params {
  _event: NewRegistry;

  constructor(event: NewRegistry) {
    this._event = event;
  }

  get vault(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get fragment(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get dvm(): Address {
    return this._event.parameters[2].value.toAddress();
  }
}

export class OwnershipTransferPrepared extends ethereum.Event {
  get params(): OwnershipTransferPrepared__Params {
    return new OwnershipTransferPrepared__Params(this);
  }
}

export class OwnershipTransferPrepared__Params {
  _event: OwnershipTransferPrepared;

  constructor(event: OwnershipTransferPrepared) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class OwnershipTransferred extends ethereum.Event {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class RemoveRegistry extends ethereum.Event {
  get params(): RemoveRegistry__Params {
    return new RemoveRegistry__Params(this);
  }
}

export class RemoveRegistry__Params {
  _event: RemoveRegistry;

  constructor(event: RemoveRegistry) {
    this._event = event;
  }

  get fragment(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class DODONFTRegistry__getDODOPoolBidirectionResult {
  value0: Array<Address>;
  value1: Array<Address>;

  constructor(value0: Array<Address>, value1: Array<Address>) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddressArray(this.value0));
    map.set("value1", ethereum.Value.fromAddressArray(this.value1));
    return map;
  }
}

export class DODONFTRegistry extends ethereum.SmartContract {
  static bind(address: Address): DODONFTRegistry {
    return new DODONFTRegistry("DODONFTRegistry", address);
  }

  _NEW_OWNER_(): Address {
    let result = super.call("_NEW_OWNER_", "_NEW_OWNER_():(address)", []);

    return result[0].toAddress();
  }

  try__NEW_OWNER_(): ethereum.CallResult<Address> {
    let result = super.tryCall("_NEW_OWNER_", "_NEW_OWNER_():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  _OWNER_(): Address {
    let result = super.call("_OWNER_", "_OWNER_():(address)", []);

    return result[0].toAddress();
  }

  try__OWNER_(): ethereum.CallResult<Address> {
    let result = super.tryCall("_OWNER_", "_OWNER_():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  _REGISTRY_(param0: Address, param1: Address, param2: BigInt): Address {
    let result = super.call(
      "_REGISTRY_",
      "_REGISTRY_(address,address,uint256):(address)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(param1),
        ethereum.Value.fromUnsignedBigInt(param2)
      ]
    );

    return result[0].toAddress();
  }

  try__REGISTRY_(
    param0: Address,
    param1: Address,
    param2: BigInt
  ): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "_REGISTRY_",
      "_REGISTRY_(address,address,uint256):(address)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(param1),
        ethereum.Value.fromUnsignedBigInt(param2)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  _VAULT_FRAG_REGISTRY_(param0: Address): Address {
    let result = super.call(
      "_VAULT_FRAG_REGISTRY_",
      "_VAULT_FRAG_REGISTRY_(address):(address)",
      [ethereum.Value.fromAddress(param0)]
    );

    return result[0].toAddress();
  }

  try__VAULT_FRAG_REGISTRY_(param0: Address): ethereum.CallResult<Address> {
    let result = super.tryCall(
      "_VAULT_FRAG_REGISTRY_",
      "_VAULT_FRAG_REGISTRY_(address):(address)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  isAdminListed(param0: Address): boolean {
    let result = super.call("isAdminListed", "isAdminListed(address):(bool)", [
      ethereum.Value.fromAddress(param0)
    ]);

    return result[0].toBoolean();
  }

  try_isAdminListed(param0: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isAdminListed",
      "isAdminListed(address):(bool)",
      [ethereum.Value.fromAddress(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  getDODOPool(baseToken: Address, quoteToken: Address): Array<Address> {
    let result = super.call(
      "getDODOPool",
      "getDODOPool(address,address):(address[])",
      [
        ethereum.Value.fromAddress(baseToken),
        ethereum.Value.fromAddress(quoteToken)
      ]
    );

    return result[0].toAddressArray();
  }

  try_getDODOPool(
    baseToken: Address,
    quoteToken: Address
  ): ethereum.CallResult<Array<Address>> {
    let result = super.tryCall(
      "getDODOPool",
      "getDODOPool(address,address):(address[])",
      [
        ethereum.Value.fromAddress(baseToken),
        ethereum.Value.fromAddress(quoteToken)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddressArray());
  }

  getDODOPoolBidirection(
    token0: Address,
    token1: Address
  ): DODONFTRegistry__getDODOPoolBidirectionResult {
    let result = super.call(
      "getDODOPoolBidirection",
      "getDODOPoolBidirection(address,address):(address[],address[])",
      [ethereum.Value.fromAddress(token0), ethereum.Value.fromAddress(token1)]
    );

    return new DODONFTRegistry__getDODOPoolBidirectionResult(
      result[0].toAddressArray(),
      result[1].toAddressArray()
    );
  }

  try_getDODOPoolBidirection(
    token0: Address,
    token1: Address
  ): ethereum.CallResult<DODONFTRegistry__getDODOPoolBidirectionResult> {
    let result = super.tryCall(
      "getDODOPoolBidirection",
      "getDODOPoolBidirection(address,address):(address[],address[])",
      [ethereum.Value.fromAddress(token0), ethereum.Value.fromAddress(token1)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new DODONFTRegistry__getDODOPoolBidirectionResult(
        value[0].toAddressArray(),
        value[1].toAddressArray()
      )
    );
  }
}

export class ClaimOwnershipCall extends ethereum.Call {
  get inputs(): ClaimOwnershipCall__Inputs {
    return new ClaimOwnershipCall__Inputs(this);
  }

  get outputs(): ClaimOwnershipCall__Outputs {
    return new ClaimOwnershipCall__Outputs(this);
  }
}

export class ClaimOwnershipCall__Inputs {
  _call: ClaimOwnershipCall;

  constructor(call: ClaimOwnershipCall) {
    this._call = call;
  }
}

export class ClaimOwnershipCall__Outputs {
  _call: ClaimOwnershipCall;

  constructor(call: ClaimOwnershipCall) {
    this._call = call;
  }
}

export class InitOwnerCall extends ethereum.Call {
  get inputs(): InitOwnerCall__Inputs {
    return new InitOwnerCall__Inputs(this);
  }

  get outputs(): InitOwnerCall__Outputs {
    return new InitOwnerCall__Outputs(this);
  }
}

export class InitOwnerCall__Inputs {
  _call: InitOwnerCall;

  constructor(call: InitOwnerCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class InitOwnerCall__Outputs {
  _call: InitOwnerCall;

  constructor(call: InitOwnerCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends ethereum.Call {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }
}

export class AddRegistryCall extends ethereum.Call {
  get inputs(): AddRegistryCall__Inputs {
    return new AddRegistryCall__Inputs(this);
  }

  get outputs(): AddRegistryCall__Outputs {
    return new AddRegistryCall__Outputs(this);
  }
}

export class AddRegistryCall__Inputs {
  _call: AddRegistryCall;

  constructor(call: AddRegistryCall) {
    this._call = call;
  }

  get vault(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get fragment(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get quoteToken(): Address {
    return this._call.inputValues[2].value.toAddress();
  }

  get dvm(): Address {
    return this._call.inputValues[3].value.toAddress();
  }
}

export class AddRegistryCall__Outputs {
  _call: AddRegistryCall;

  constructor(call: AddRegistryCall) {
    this._call = call;
  }
}

export class RemoveRegistryCall extends ethereum.Call {
  get inputs(): RemoveRegistryCall__Inputs {
    return new RemoveRegistryCall__Inputs(this);
  }

  get outputs(): RemoveRegistryCall__Outputs {
    return new RemoveRegistryCall__Outputs(this);
  }
}

export class RemoveRegistryCall__Inputs {
  _call: RemoveRegistryCall;

  constructor(call: RemoveRegistryCall) {
    this._call = call;
  }

  get fragment(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RemoveRegistryCall__Outputs {
  _call: RemoveRegistryCall;

  constructor(call: RemoveRegistryCall) {
    this._call = call;
  }
}

export class AddAdminListCall extends ethereum.Call {
  get inputs(): AddAdminListCall__Inputs {
    return new AddAdminListCall__Inputs(this);
  }

  get outputs(): AddAdminListCall__Outputs {
    return new AddAdminListCall__Outputs(this);
  }
}

export class AddAdminListCall__Inputs {
  _call: AddAdminListCall;

  constructor(call: AddAdminListCall) {
    this._call = call;
  }

  get contractAddr(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class AddAdminListCall__Outputs {
  _call: AddAdminListCall;

  constructor(call: AddAdminListCall) {
    this._call = call;
  }
}

export class RemoveAdminListCall extends ethereum.Call {
  get inputs(): RemoveAdminListCall__Inputs {
    return new RemoveAdminListCall__Inputs(this);
  }

  get outputs(): RemoveAdminListCall__Outputs {
    return new RemoveAdminListCall__Outputs(this);
  }
}

export class RemoveAdminListCall__Inputs {
  _call: RemoveAdminListCall;

  constructor(call: RemoveAdminListCall) {
    this._call = call;
  }

  get contractAddr(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class RemoveAdminListCall__Outputs {
  _call: RemoveAdminListCall;

  constructor(call: RemoveAdminListCall) {
    this._call = call;
  }
}
