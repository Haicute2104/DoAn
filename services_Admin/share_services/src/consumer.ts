import { Kafka } from 'kafkajs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const startSendMailConsumer = async () => {
  try {
    const kafkaBroker = process.env.Kafka_Broker || 'localhost:9092';
    
    const kafka = new Kafka({
      clientId: 'mail-service',
      brokers: [kafkaBroker],
    });

    const consumer = kafka.consumer({ groupId: 'mail-service-group' });

    await consumer.connect();

    const topicName = 'send-mail';

    await consumer.subscribe({ topic: topicName, fromBeginning: false });

    console.log('Mail consumer is running, đã sẵn sàng lắng nghe gửi mail');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
       try {
        const {to, subject, html} = JSON.parse(message.value?.toString() || '{}');

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to,
          subject,
          html,
        })

        console.log('Đã gửi mail thành công cho:', to);
       } catch (error) {
        console.log('Lỗi khi gửi mail:', error);
       }
      },
    });
  } catch (error) {
    console.log('Mail consumer is running, lỗi:', error);
  }
}