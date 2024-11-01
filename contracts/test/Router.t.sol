// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {Test, console} from "forge-std/Test.sol";
import {Route} from "../src/Route.sol";
import {Router} from "../src/Router.sol";
import {RouterFactory} from "../src/RouterFactory.sol";
import {RouteAddData, RouteUpdateData} from "../src/IRouteMutator.sol";
import {TestUtils} from "./Utils.sol";

/// @title RouterTest - a contract to test the Router contract
/// @dev The RouterTest contract is used to test the Router contract
/// Note: There are reserved routes created as part of construction and contract deployment
contract RouterTest is Test {
    Router public router;
    address user;
    
    function setUp() public {
        RouterFactory factory = new RouterFactory();
        user = address(0x123);
        vm.startPrank(user);
        router = Router(factory.createRouter(0));
    }

    function test_CreateAndGetRoute() public {
        vm.startPrank(user);
        RouteAddData memory createdRoute = TestUtils.newRoute(0);
        router.addRoute(createdRoute);
        Route memory gotRoute = router.getRoute("0");
        assertEq(gotRoute.command, "0");
        assertEq(gotRoute.name, "0");
        assertEq(gotRoute.url, "0");
        assertTrue(gotRoute.isValue);
    }

    function test_CreateAndGetRoutes() public {
        string[] memory subRoutes = new string[](0);
        RouteAddData[] memory routeAddDatas = new RouteAddData[](2);
        routeAddDatas[0] = RouteAddData("command1", "name1", "url1", "description1", subRoutes);
        routeAddDatas[1] = RouteAddData("command2", "name2", "url2", "description2", subRoutes);
        router.addRoutes(routeAddDatas);
        (Route[] memory routes, uint256 length, string memory cursor) = router.getRoutes("", 10);
        // account for reserved routes
        assertEq(length, 3);
        assertEq(routes[0].command, "r3");
        assertEq(routes[1].name, "name1");
        assertEq(routes[2].description, "description2");
        assertEq(cursor, "");

        Route memory route = router.getRoute(routes[1].command);
        assertEq(route.name, "name1");
        assertEq(route.url, "url1");
        assertTrue(route.isValue);
    }

    function test_RoutePagination() public {
        for (uint256 i = 0; i < 15; i++) {
            router.addRoute(TestUtils.newRoute(i));
        }
        // account for reserved routes
        (Route[] memory routes, uint256 length, string memory cursor) = router.getRoutes("", 10);
        assertEq(length, 10);
        assertEq(cursor, "9");
        assertEq(routes[0].command, "r3");
        assertEq(routes[9].command, "8");
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 6);
        assertEq(cursor, "");
        assertEq(routes[0].command, "9");
        assertEq(routes[5].command, "14");
    }

    function test_DeleteRoute() public {
        // account for reserved routes 16 total
        for (uint i = 0; i < 15; i++) {
            router.addRoute(TestUtils.newRoute(i));
        }
        (Route[] memory routes, uint256 length, string memory cursor) = router.getRoutes("", 10);
        assertEq(length, 10);
        // account for reserved routes
        assertEq(cursor, "9");
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 6);
        assertEq(cursor, "");
        // deleting route at id 10
        router.deleteRoute("10");
        (routes, length, cursor) = router.getRoutes("", 10);
        assertEq(length, 10);
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 5);
    }

    function test_DeleteRoutes() public {
        // account for reserved routes 16 total
        for (uint i = 0; i < 15; i++) {
            router.addRoute(TestUtils.newRoute(i));
        }
        (Route[] memory routes, uint256 length, string memory cursor) = router.getRoutes("", 10);
        assertEq(length, 10);
        // account for reserved routes
        assertEq(cursor, "9");
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 6);
        assertEq(cursor, "");
        // deleting route at id 10
        string[] memory deleteCommands = new string[](3);
        deleteCommands[0] = "10";
        deleteCommands[1] = "11";
        deleteCommands[2] = "12";
        router.deleteRoutes(deleteCommands);
        (routes, length, cursor) = router.getRoutes("", 10);
        assertEq(length, 10);
        (routes, length, cursor) = router.getRoutes(cursor, 10);
        assertEq(length, 3);
    }

    function test_UpdateRoute() public {
        router.addRoute(TestUtils.newRoute(0));
        string memory command = "0";
        Route memory createdRoute = router.getRoute(command);
        assertEq(createdRoute.name, "0");
        assertEq(createdRoute.url, "0");
        assertTrue(createdRoute.isValue);
        string[] memory subRoutes = new string[](0);
        router.updateRoute(command, RouteUpdateData("new name", "new url", "new descriptoin", subRoutes));
        Route memory updatedRoute = router.getRoute(command);
        assertEq(updatedRoute.name, "new name");
        assertEq(updatedRoute.url, "new url");
        assertTrue(updatedRoute.isValue);
    }

    function test_InvalidRoute() public {
        router.addRoute(TestUtils.newRoute(0));
        string memory command = "0";
        Route memory createdRoute = router.getRoute(command);
        assertEq(createdRoute.name, command);
        assertEq(createdRoute.url, command);
        assertTrue(createdRoute.isValue);
        router.deleteRoute(command);
        vm.expectRevert();
        router.getRoute(command);
    }

    function test_RoutePaginationAfterDelete() public {
        for (uint i = 0; i < 5; i++) {
            router.addRoute(TestUtils.newRoute(i));
        }
        router.deleteRoute("0");
        (Route[] memory routes, uint256 length, string memory cursor) = router.getRoutes("", 10);
        // account for reserved routes
        assertEq(length, 5);
        assertEq(cursor, "");
        assertEq(routes[1].command, "1");
        router.deleteRoute("1");
        (routes, length, cursor) = router.getRoutes("", 10);
        assertEq(length, 4);
        assertEq(cursor, "");
        assertEq(routes[1].command, "2");
        assertEq(routes[3].command, "4");
    }
}
