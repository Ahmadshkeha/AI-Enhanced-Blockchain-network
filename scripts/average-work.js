const Blockchain = require('../blockchain');

const blockchain = new Blockchain();

blockchain.addBlock({ data: [
  { input: 'foo1', outputMap: 'foo1', id: 1001 },
  { input: 'foo2', outputMap: 'foo2', id: 1002 },
  { input: 'foo3', outputMap: 'foo3', id: 1003 }
] });

console.log('first block', blockchain.chain[blockchain.chain.length-1]);

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i=0; i<10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;

  blockchain.addBlock({ data: [
    { input: 'foo1', outputMap: 'foo1', id: 1001 },
    { input: 'foo2', outputMap: 'foo2', id: 1002 },
    { input: 'foo3', outputMap: 'foo3', id: 1003 }
  ] });

  nextBlock = blockchain.chain[blockchain.chain.length-1];

  nextTimestamp = nextBlock.timestamp;
  timeDiff = nextTimestamp - prevTimestamp;
  times.push(timeDiff);

  average = times.reduce((total, num) => (total + num))/times.length;

  console.log(`Time to mine block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average time: ${average}ms`);
}
