import { promisedWorld } from './core';


export * from "./core/world";

console.log("start init start*");

promisedWorld.then(world => {
    console.log(`start: Updated world from promise`);
    console.log(`start: world is: `, world);

    world.initialize();
});

console.log("start init end");
