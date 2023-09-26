const amqp = require("amqplib");
const messages = "hello";

const runProducer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:12345@localhost");
    const channel = await connection.createChannel();

    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.sendToQueue(queueName, Buffer.from(messages));
    console.log(`message sent: ${messages}`);
  } catch (error) {
    console.log(error);
  }
};

runProducer().catch(console.error);
