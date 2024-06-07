// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

enum RouteType{ MANUAL, RESERVED }

/// @title The Route Struct - represents a route in the Router contract
/// @dev The route format is specific as follows:
/// command: the command to be executed (string)
/// name: the name of the route (string)
/// url: the url of the route (string)
/// description: the description of the route (string)
/// subRoutes: the sub routes of the route (string[]) in the format of command::url (double colon)
/// isValue: a boolean flag to check if the route is valid
/// routeType: the type of the route, can be either 'manual' or 'reserved'
struct Route {
    string command;
    string name;
    string url;
    string description;
    string[] subRoutes;
    bool isValue;
    RouteType routeType;
}