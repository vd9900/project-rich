// "use strict";

// const CoinKey = require("coinkey");
// const fs = require("fs");

// let privateKeyHex, ck, addresses;
// addresses = new Map();

// const data = fs.readFileSync("./riches.txt");
// data
//   .toString()
//   .split("\n")
//   .forEach((address) => addresses.set(address, true));

// function generate() {
//   // generate random private key hex
//   let privateKeyHex = r(64);

//   // create new bitcoin key pairs
//   let ck = new CoinKey(Buffer.from(privateKeyHex, "hex"));

//   ck.compressed = false;
//   console.log(ck.publicAddress, "hey");
//   console.log("file size", addresses.size);
//   // ^ remove "//" from line above if you wanna see the logs, but remember it slows down the whole process a lot.

//   // if generated wallet matches any from the riches.txt file, tell us we won!
//   if (addresses.has(ck.publicAddress)) {
//     process.stdout.write("\x07");
//     console.log("\x1b[32m%s\x1b[0m", ">> Success: " + ck.publicAddress);
//     console.log("\x1b[32m%s\x1b[0m", ">> Success Pass: " + ck.privateWif);
//     var successString =
//       "Wallet: " + ck.publicAddress + "\n\nSeed: " + ck.privateWif;

//     // save the wallet and its private key (seed) to a Success.txt file in the same folder
//     fs.appendFileSync("./Success.txt", successString, (err) => {
//       if (err) throw err;
//     });

//     // close program after success
//     process.exit();
//   }
//   // destroy the objects
//   ck = null;
//   privateKeyHex = null;
// }

// // the function to generate random hex string
// function r(l) {
//   let randomChars = "ABCDEF0123456789";
//   let result = "";
//   for (var i = 0; i < l; i++) {
//     result += randomChars.charAt(
//       Math.floor(Math.random() * randomChars.length)
//     );
//   }
//   return result;
// }

// // run forever
// while (true) {
//   generate();
//   if (process.memoryUsage().heapUsed / 1000000 > 500) {
//     global.gc();
//   }
//   console.log("Heap used : ", process.memoryUsage().heapUsed / 1000000);
// }

"use strict";

const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const CoinKey = require("coinkey");
const fs = require("fs");

let addresses = new Map();
const data = fs.readFileSync("./riches.txt");
data
  .toString()
  .split("\n")
  .forEach((address) => addresses.set(address, true));

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Worker process

  function generate() {
    let privateKeyHex = r(64);
    let ck = new CoinKey(Buffer.from(privateKeyHex, "hex"));

    ck.compressed = false;

    if (addresses.has(ck.publicAddress)) {
      process.stdout.write("\x07");
      console.log("\x1b[32m%s\x1b[0m", ">> Success: " + ck.publicAddress);
      console.log("\x1b[32m%s\x1b[0m", ">> Success Pass: " + ck.privateWif);
      var successString =
        "Wallet: " + ck.publicAddress + "\n\nSeed: " + ck.privateWif;

      fs.appendFileSync("./Success.txt", successString, (err) => {
        if (err) throw err;
      });

      process.exit();
    }

    ck = null;
    privateKeyHex = null;
  }

  while (true) {
    generate();
    if (process.memoryUsage().heapUsed / 1000000 > 500) {
      global.gc();
    }
    console.log("Heap used : ", process.memoryUsage().heapUsed / 1000000);
  }
}

// the function to generate random hex string
function r(l) {
  let randomChars = "ABCDEF0123456789";
  let result = "";
  for (var i = 0; i < l; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}
