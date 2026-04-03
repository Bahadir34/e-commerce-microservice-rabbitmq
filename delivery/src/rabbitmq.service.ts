import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib";
import type { IOrder } from "./types/index.ts";
import deliveryService from "./delivery.service.ts";
import { Courier, DeliveryTracking } from "./delivery.model.ts";
import type { Types } from "mongoose";

class RabbitmqService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  // * channel or exchange element name
  private readonly exchangeName = "food_delivery_exchange";

  // * queues' name
  private readonly orderQueue = "order_queue";
  private readonly deliveryQueue = "delivery_queue";

  /*
    ^ connect broker and create channels/exchanges
    
    * exchange elemaninin tipi "topic" olunca routing key degerlerine gore (or : order.*) yonlendirme yapar.
    * {durable : true} -> servis kapatilmis olsa bile exchange elemani ve kuyruklar kalir.
  */
  async initialize(): Promise<void> {
    try {
      const url = process.env.RABBITMQ_URL;
      // connect to broker
      this.connection = await amqp.connect(url);

      // create channel
      this.channel = await this.connection.createChannel();

      // topic -> olaya gore yonlendirme yapiyor.
      await this.channel.assertExchange(this.exchangeName, "topic", {
        durable: true, // rabbitmq restart edilse bile exchange kalir.
      });

      // durable : true -> server kapansa bile kuyruk kalici olarak kalsin
      await this.channel.assertQueue(this.orderQueue, { durable: true });
      await this.channel.assertQueue(this.deliveryQueue, { durable: true });

      // ^ kuyruklar exchange'e baglanir
      await this.channel.bindQueue(
        this.deliveryQueue,
        this.exchangeName,
        "order.created", // eger ki siparis olusturma ile ilgili bir haber gelirse bunlari order kuyruguna ata.
      );

      await this.channel.bindQueue(
        this.deliveryQueue,
        this.exchangeName,
        "order.ready",
      );

      // * queue'lari dinle
      await this.listenToDeliveryRequest();

      console.log(
        "Delivery Service Rabbitmq Bağlantısı Başarıyla Gerçekleşti!",
      );
    } catch (error) {
      console.log("Rabbitmq bağlantısında hata oldu!");
    }
  }

  // * order servisinden gelen teslimat isteklerini dinlemen gerek
  async listenToDeliveryRequest(): Promise<void> {
    if (!this.channel) {
      throw new Error("Rabbitmq başlatılmamış! Mesajlar dinlenemiyor.");
    }

    await this.channel.consume(this.orderQueue, async (message) => {
      //bufferdan json verisine cevirilecek
      const data = JSON.parse(message?.content.toString() as string) as IOrder;

      // eger yeni siparis durumu pending ise yeni bir delivery tracking olusturulacak; eger siparis durumu ready ise delivery tracking'i guncelle
      if (data.status === "pending") {
        // musait bir kurye bul ve kuryeye siparisi ata. siparis durumunu assigned yap
        const deliveryTracking = await DeliveryTracking.create({
          orderId: data._id,
          status: "pending",
          estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
          notes: data.specialInstructions as string,
        });

        const courier = await Courier.findOne({
          status: "available",
          isAvailable: true,
        }).sort({ createdAt: 1 });

        if (courier) {
          // siparis verisini guncelle
          const updatedDeliveryTracking =
            await DeliveryTracking.findOneAndUpdate(
              { id: deliveryTracking.id },
              {
                courierId: courier.id,
                status: "assigned",
              },
              {
                new: true,
              },
            );
          // kurye durumunu guncelle
          await Courier.findByIdAndUpdate(courier.id, {
            status: "busy",
            isAvailable: false,
          });
        }
      }
      // eger siparis durumu ready ise delivery trackingi guncelle
      else if (data.status === "ready") {
        await DeliveryTracking.findOneAndUpdate(
          { orderId: data._id },
          { status: "ready" },
        );
      }
      console.log("RABBITMQ -> Teslimat istegi geldi --- ", data);
    });
  }
}

export default new RabbitmqService();
