// SPDX-License-Identifier: GPL-3.0 
pragma solidity ^0.8.23;

// TODO: Consider adding events for creation, update, and deletion of routes
// TODO: Make contract upgradable

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

bool constant PREV = false;
bool constant NEXT = true;

/// @title The Router Contract - backed by simple circular linked list implementation
/// @dev The Router contract is a simple contract that allows the owner to 
/// create, update and delete routes.
contract Router {
    address owner;
    string head;
    mapping (string => mapping (bool => string)) cll;
    mapping (string => Route) routes;

    constructor() {
        owner = msg.sender;
        // Reserved route
        string[] memory subroutes = new string[](4);
        subroutes[0] = "setup::%0000/rout3r/#setup";
        subroutes[1] = "about::%0000/rout3r/#about";
        subroutes[2] = "new::%0000/rout3r/#routes/new";
        subroutes[3] = "search::%0000/rout3r/#route/%@@@";
        Route memory newRoute = Route(
            "r3", 
            "rout3r Menu", 
            "%0000/rout3r/", 
            "The rout3r menu",
            subroutes,
            true, 
            RouteType.RESERVED
        );
        head = "r3";
        routes[head] = newRoute;
        cll[head][NEXT] = head;
        cll[head][PREV] = head;
    }

    /// @notice Modifier to check if the caller is the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /// @notice Checks if two strings are equal
    function areEqual(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }

    /// @notice Checks if the route is valid
    function isValidRoute(string memory command) internal view returns (bool) {
        return routes[command].isValue;
    }

    /// @notice Checks if the route is reserved
    function isReservedRoute(string memory command) internal view returns (bool) {
        return routes[command].routeType == RouteType.RESERVED;
    }

    /// @notice Adds a node to the linked list at end of the list
    function addRoute(RouteAddData memory route) onlyOwner public returns (Route memory) {
        /// @dev Check if the route already exists and throw an error if it does
        require(!isValidRoute(route.command), "Route with command already exists");
        Route memory newRoute = Route(
            route.command, 
            route.name, 
            route.url, 
            route.description, 
            route.subRoutes, 
            true, 
            RouteType.MANUAL
        );
        if (areEqual(head, "")) {
            head = route.command;
            cll[head][NEXT] = head;
            cll[head][PREV] = head;
            routes[head] = newRoute;
        } else {
            string memory pointer = route.command;
            cll[pointer][PREV] = cll[head][PREV];
            cll[cll[head][PREV]][NEXT] = pointer;
            cll[pointer][NEXT] = head;
            cll[head][PREV] = pointer;
            routes[pointer] = newRoute;
        }
        return newRoute;
    }

    function updateRoute(string memory command, RouteUpdateData memory route) onlyOwner public {
        require(isValidRoute(command), "Route with command does not exist");
        routes[command].name = route.name;
        routes[command].url = route.url;
        routes[command].description = route.description;
        routes[command].subRoutes = route.subRoutes;
    }

    /// @notice Removes a node from the linked list
    function deleteRoute(string memory command) onlyOwner public {
        require(isValidRoute(command), "Route with command does not exist");
        require(!isReservedRoute(command), "Cannot delete a reserved route");
        string memory prev = cll[command][PREV];
        string memory next = cll[command][NEXT];
        cll[prev][NEXT] = next;
        cll[next][PREV] = prev;

        if (areEqual(head, command)) {
            head = next;
        }

        delete cll[command][PREV];
        delete cll[command][NEXT];
        delete routes[command];
    }

    /// @notice Returns the value of the node at the given index
    function getRoute(string memory command) public view returns (Route memory) {
        require(isValidRoute(command));
        return routes[command];
    }

    /// @notice Returns the values of the linked list of paginated size n
    /// @param cursor The cursor to start from, if empty string then starts from head
    function getRoutes(string memory cursor, uint256 n) public view returns (Route[] memory, uint256, string memory) {
        Route[] memory results = new Route[](n);
        uint256 length = 0;
        string memory pointer = areEqual(cursor, "") ? head : cursor;
        do {
            results[length] = routes[pointer];
            pointer = cll[pointer][NEXT];
            length++;
        } while (!areEqual(pointer, head) && length < n);
        string memory nextCursor = areEqual(pointer, head) ? "" : pointer;
        return (results, length, nextCursor);
    }
}