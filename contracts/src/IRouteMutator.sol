// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

import {Route} from "./Route.sol";

/// @title The RouteAddData Struct - represents the data needed to add in the Router contract
/// @dev The RouteAddData format is specific as follows:
/// command: the command to be executed (string)
/// name: the name of the route (string)
/// url: the url of the route (string)
/// description: the description of the route (string)
/// subRoutes: the sub routes of the route (string[]) in the format of command::url (double colon)
/// isValue: a boolean flag to check if the route is valid
struct RouteAddData {
    string command;
    string name;
    string url;
    string description;
    string[] subRoutes;
}

/// @title The RouteUpdateData Struct - represents the data needed to update a route in the Router contract
/// @dev The RouteUpdateData format is specific as follows:
/// name: the name of the route (string)
/// url: the url of the route (string)
/// description: the description of the route (string)
/// subRoutes: the sub routes of the route (string[]) in the format of command::url (double colon)
/// isValue: a boolean flag to check if the route is valid
struct RouteUpdateData {
    string name;
    string url;
    string description;
    string[] subRoutes;
}

interface IRouteMutator {
    /// @notice Adds a route to the stored list of routes
    function addRoute(RouteAddData memory route) external returns (Route memory);

    /// @notice Updates a route in the stored list of routes
    function updateRoute(string memory command, RouteUpdateData memory route) external;

    /// @notice Removes a route from the stored list of routes
    function deleteRoute(string memory command) external;
}