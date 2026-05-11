import { Kafka, Producer, Admin } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

let producer: Producer | null = null;
let admin: Admin | null = null;
let retryTimeout: NodeJS.Timeout | null = null;

const RETRY_INTERVAL = 5000; // 5s

export const connectKafka = async () => {
  try {
    const kafkaBroker = process.env.Kafka_Broker || 'localhost:9092';

    const kafka = new Kafka({
      clientId: 'auth-service',
      brokers: [kafkaBroker],
    });

    // ----- ADMIN -----
    admin = kafka.admin();
    await admin.connect();

    const topics = await admin.listTopics();

    if (!topics.includes('send-mail')) {
      await admin.createTopics({
        topics: [
          {
            topic: 'send-mail',
            numPartitions: 1,
            replicationFactor: 1,
          },
        ],
      });
      console.log('Topic send-mail đã được tạo');
    }

    await admin.disconnect();

    // ----- PRODUCER -----
    producer = kafka.producer();
    await producer.connect();

    console.log('Kafka đã được kết nối');

    // ✅ Kết nối thành công thì clear retry
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }

  } catch (error) {
    console.log('❌ Lỗi khi kết nối Kafka:', error);

    // 🔁 Retry sau 5s nếu chưa có timer
    if (!retryTimeout) {
      console.log(`⏳ Thử kết nối lại Kafka sau ${RETRY_INTERVAL / 1000}s...`);
      retryTimeout = setTimeout(() => {
        retryTimeout = null;
        connectKafka();
      }, RETRY_INTERVAL);
    }
  }
};

export const publishToTopic = async (topic: string, message: any) => {
  if (!producer) {
    console.log('⚠️ Producer chưa được kết nối');
    return;
  }

  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  } catch (error) {
    console.log('❌ Lỗi khi gửi message:', error);
  }
};

export const disconnectKafka = async () => {
  try {
    if (producer) {
      await producer.disconnect();
      producer = null;
      console.log('Producer đã được ngắt kết nối');
    }

    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  } catch (error) {
    console.log('Lỗi khi disconnect Kafka:', error);
  }
};
