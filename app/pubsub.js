const redis = require('redis');
const { json } = require('body-parser');
console.log("hello from MAIN@@ branch");
const CHANNELS = {
    test: "test",
    BLOCKCHAIN: "BLOCKCHAIN",
    TRANSACTION: "TRANSACTION"
    
};

class PubSub{

constructor({blockchain , transactionPool}){
    this.blockchain=blockchain;
    this.transactionPool=transactionPool;
    this.subscriber= redis.createClient();
    this.publisher= redis.createClient();

   this.subscribeToChannels();
    this.subscriber.on(
        'message' 
        ,( channel , message)=> this.handleMessage(channel,message)
         );

}

// Define a function to handle messages received through specific channels
handleMessage(channel, message) {
  // Print a message containing information about the channel and the received message
  console.log(`Message received. Channel: ${channel}. Message: ${message}`);

  // Parse the message from JSON string to a JavaScript object
  const parsedMessage = JSON.parse(message);

  // Check the value of the channel and take different actions based on the value
  switch (channel) {
      case channel.blockchain:
          // When receiving an update for the blockchain
          // Replace it and clear relevant transactions from the transaction pool
          this.blockchain.replaceChain(parsedMessage,  () => {
              this.transactionPool.clearBlockchainTransactions({
                  chain: parsedMessage
              });
          });
          break;

      case channel.transaction:
          // When receiving an update for a transaction
          // Add it to the transaction pool
          this.transactionPool.setTransaction(parsedMessage);
          break;

      default:
          // If the value doesn't match either of the above cases, do nothing
          return;
  }
}


// Define a method to subscribe to multiple channels
subscribeToChannels() {
  // Iterate over the values of the CHANNELS object
  Object.values(CHANNELS).forEach(channel => {
      // Subscribe to the current channel using the subscriber object
      this.subscriber.subscribe(channel);
  });
}



// Define a method to publish a message to a specific channel
publish({ channel, message }) {
  // Unsubscribe from the channel temporarily
  this.subscriber.unsubscribe(channel, () => {
      // Publish the message to the channel using the publisher
      this.publisher.publish(channel, message, () => {
          // Subscribe again to the channel after publishing
          this.subscriber.subscribe(channel);
      });
  });
}


// Method to broadcast the current blockchain to all subscribers
broadcastChain() {
  // Publish the current blockchain to the BLOCKCHAIN channel
  this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
  });
}

// Method to broadcast a transaction to all subscribers
broadcastTransaction(transaction) {
  // Publish the transaction to the TRANSACTION channel
  this.publish({
      channel: CHANNELS.TRANSACTION,
      message: JSON.stringify(transaction)
  });
}


}
module.exports= PubSub;