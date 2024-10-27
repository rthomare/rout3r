// contracts/FactoryContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { Router } from "./Router.sol";
import { LibClone } from "@solady/utils/LibClone.sol";

// Factory version 1.0.0
// Future versions will explicitly add an upgrade funtion for future updates to the Router contract
// They'll also update the ROUTER_VERSION_STRING to reflect the new version
// Lastly, the updates will have to take care of data migration if necessary as well.
contract RouterFactory {
    Router public immutable IMPLEMENTATION;

    constructor() {
        IMPLEMENTATION = new Router();
    }

    /// @notice Create an router, and return its address. Returns the address even if the router is already deployed.
    /// @dev During UserOperation execution, this method is called only if the router is not deployed. This method
    /// returns an existing router address so that entryPoint.getSenderAddress() would work even after router
    /// creation.
    /// @param salt A salt, which can be changed to create multiple routers with the same owner.
    /// @return router The address of either the newly deployed router or an existing router with this owner and salt.
    function createRouter(uint256 salt) external returns (Router router) {
        (bool alreadyDeployed, address routerAddress) =
            LibClone.createDeterministicERC1967(address(IMPLEMENTATION), _getCombinedSalt(msg.sender, salt));

        router = Router(routerAddress);

        if (!alreadyDeployed) {
            router.initialize(msg.sender);
        }
    }

    /// @notice Calculate the counterfactual address of this router as it would be returned by `createAccount`.
    /// @param owner The owner of the router to be created.
    /// @param salt A salt, which can be changed to create multiple routers with the same owner.
    /// @return The address of the router that would be created with `createAccount`.
    function getAddress(address owner, uint256 salt) external view returns (address) {
        return LibClone.predictDeterministicAddressERC1967(
            address(IMPLEMENTATION), _getCombinedSalt(owner, salt), address(this)
        );
    }

    /// @notice Compute the hash of the owner and salt in scratch space memory.
    /// @dev The caller is responsible for cleaning the upper bits of the owner address parameter.
    /// @param owner The owner of the router to be created.
    /// @param salt A salt, which can be changed to create multiple routers with the same owner.
    /// @return combinedSalt The hash of the owner and salt.
    function _getCombinedSalt(address owner, uint256 salt) internal pure returns (bytes32 combinedSalt) {
        // Compute the hash of the owner and salt in scratch space memory.
        assembly ("memory-safe") {
            mstore(0x00, owner)
            mstore(0x20, salt)
            combinedSalt := keccak256(0x00, 0x40)
        }
    }
}