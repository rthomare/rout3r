// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {RouteAddData} from "../src/IRouteMutator.sol";

library TestUtils {
    function newRoute(uint id) pure internal returns (RouteAddData memory) {
        string[] memory subRoutes = new string[](0);
        string memory identifier = Strings.toString(id);
        return RouteAddData(identifier, identifier, identifier, identifier, subRoutes);
    }
}