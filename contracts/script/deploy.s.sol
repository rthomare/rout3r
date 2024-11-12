// deploy_factory.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RouterFactory} from "../src/RouterFactory.sol";

contract FactoryDeployer {
    event FactoryDeployed(address factoryAddress, bytes32 salt);

    function deployFactory(bytes32 salt) public returns (address) {
        bytes memory bytecode = type(RouterFactory).creationCode;

        address factoryAddress;
        assembly {
            factoryAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(extcodesize(factoryAddress)) {
                revert(0, 0)
            }
        }

        emit FactoryDeployed(factoryAddress, salt);
        return factoryAddress;
    }

    function computeFactoryAddress(bytes32 salt) public view returns (address) {
        bytes memory bytecode = type(RouterFactory).creationCode;

        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }
}

contract FactoryDeployment is Script {
    function log(string memory message) internal view {
        console.log(message);
    }

    function log(string memory message, string memory message2) internal view {
        string memory _message = string(abi.encodePacked(message, " ", message2)); 
        log(_message);
    }

    function log(string memory message, string memory message2, string memory message3) internal view{
        string memory _message = string(abi.encodePacked(message, " ", message2, " ", message3));
        log(_message);
    }

    function concat(string memory a, string memory b) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function concat(string memory a, string memory b, string memory c) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b, c));
    }

    function deploy() internal returns (string memory factoryAddress) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        bytes32 salt = vm.envOr("SALT", bytes32(0x0)); // Default to zero if not provided
        vm.startBroadcast(deployerPrivateKey);

        // Initialize the deployer contract
        FactoryDeployer deployer = new FactoryDeployer();

        // Deploy the factory with the specified salt
        factoryAddress = vm.toString(deployer.deployFactory(salt));
        log("Factory deployed at address and salt:", factoryAddress, vm.toString(salt));
        vm.stopBroadcast();
    }

    function verifyContract(string memory contractAddress) internal {
        string memory etherscanApiKey = vm.envString("ETHERSCAN_API_KEY");
        uint256 chainId = block.chainid; // Dynamically get the chain ID

        // Running the verify command in a system call
        string[] memory cmds = new string[](9);
        cmds[0] = "forge";
        cmds[1] = "verify-contract";
        cmds[2] = "--contract";
        cmds[3] = "src/RouterFactory.sol:RouterFactory"; 
        cmds[4] = contractAddress;
        cmds[5] = "--chain-id";
        cmds[6] = vm.toString(chainId);
        cmds[7] = "--etherscan-api-key";
        cmds[8] = etherscanApiKey;
        vm.ffi(cmds);

        string memory contractBlockExplorerUrl = concat(vm.envString("BLOCK_EXPLORER_URL"), "address/", contractAddress);
        log("Verification request sent to Etherscan for:", contractBlockExplorerUrl);
    }

    function run() external {
        string memory factoryAddress = deploy();
        verifyContract(factoryAddress);
    }
}