// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

import {Route} from "./Route.sol";

interface IRouteReader {
    /// @notice Returns the value of the node at the given index
    function getRoute(string memory command) external view returns (Route memory);

    /// @notice Returns the values of the linked list of paginated size n
    /// @param cursor The cursor to start from, if empty string then starts from head
    function getRoutes(string memory cursor, uint256 length) external view returns (Route[] memory, uint256, string memory);
}