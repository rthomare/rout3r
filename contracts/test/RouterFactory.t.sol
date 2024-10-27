// Test route creation and ownership
// Test implimentation address retreival from proxy
// Test simple add, delete, and get route

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.23;

import {TestUtils} from "./Utils.sol";
import {Test} from "forge-std/Test.sol";
import {Route} from "../src/Route.sol";
import {Router} from "../src/Router.sol";
import {RouterFactory} from "../src/RouterFactory.sol";
import {RouteAddData} from "../src/IRouteMutator.sol";

contract RouterV2 is Router {
    function version() public pure returns (string memory) {
        return "v2";
    }
}

/// @title RouterTest - a contract to test the Router contract
/// @dev The RouterTest contract is used to test the Router contract
/// Note: There are reserved routes created as part of construction and contract deployment
contract RouterFactoryTest is Test {
    RouterFactory public factory;
    Router public routerImpl;
    address user;
    
    function setUp() public {
        factory = new RouterFactory();
        routerImpl = factory.IMPLEMENTATION();
        user = address(0x123);
        vm.startPrank(user);
    }

    function test_CreateRouter() public {
        // Confirm conterfactiual address and that of the router created by the factory
        address routerAddress = factory.getAddress(user, 0);
        Router router = Router(factory.createRouter(0));
        assertEq(routerAddress, address(router));

        // Check that the deployed contract is a Router
        address impl = router.getImplementationAddress(); // Check implementation address
        assertEq(impl, address(routerImpl));
    }

    function test_Ownership() public {
        Router router = Router(factory.createRouter(0));
        assertEq(router.owner(), user);
    }

    function test_UpgradeRouter() public {
        Router userRouter = factory.createRouter(0); // Deploy a new router
        RouteAddData memory createdRoute = TestUtils.newRoute(0);
        userRouter.addRoute(createdRoute);

        // Deploy a new implementation
        RouterV2 newRouterImpl = new RouterV2();

        // Upgrade an existing router to the new implementation
        userRouter.upgradeToAndCall(address(newRouterImpl), "");

        // Check that the router's version is now v2
        assertEq(RouterV2(address(userRouter)).version(), "v2");

        // The 0 route should still exist after the upgrade
        Route memory gotRoute = userRouter.getRoute("0");
        assertEq(gotRoute.command, "0");
        assertEq(gotRoute.name, "0");
        assertEq(gotRoute.url, "0");
        assertTrue(gotRoute.isValue);

        RouteAddData memory v2CreatedRoute = TestUtils.newRoute(1);
        userRouter.addRoute(v2CreatedRoute);
        Route memory v2GotRoute = userRouter.getRoute("1");
        assertEq(v2GotRoute.command, "1");
        assertEq(v2GotRoute.name, "1");
        assertEq(v2GotRoute.url, "1");
        assertTrue(v2GotRoute.isValue);

        userRouter.deleteRoute("0");
        vm.expectRevert();
        userRouter.getRoute("0");
    }
}
