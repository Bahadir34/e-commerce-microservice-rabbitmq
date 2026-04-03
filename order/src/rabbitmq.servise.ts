import type { Channel, ChannelModel } from "amqplib";
import amqp from "amqplib";
import type { IOrder } from "./types/index.js";

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
      // connect to broker
      this.connection = await amqp.connect(process.env.RABBITMQ_URL);

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
        this.orderQueue,
        this.exchangeName,
        "order.created", // eger ki siparis olusturma ile ilgili bir haber gelirse bunlari order kuyruguna ata.
      );

      await this.channel.bindQueue(
        this.orderQueue,
        this.exchangeName,
        "order.ready",
      );

      console.log("Order Service Rabbitmq Bağlantısı Başarıyla Gerçekleşti!");
    } catch (error) {
      console.log("Rabbitmq bağlantısında hata oldu!");
    }
  }

  /* 
    ^ siparis olusturuldugunda olayi yayinla

    * - routingKey : order.created
    * {persistent : true} -> rabbitmq yeniden baslatilsa bile mesaj diske kaydedildigi icin mesaj kaybolmaz.
  */
  async publishOrderCreated(order: IOrder): Promise<void> {
    try {
      if (!this.channel) throw new Error("Rabbitmq kanalı başlatılmamış!");

      const message = Buffer.from(JSON.stringify(order)); // yayinlanacak mesaj olusturuldu
      await this.channel.publish(this.exchangeName, "order.created", message, {
        persistent: true,
      });

      console.log("Sipariş oluşturma mesajı yayınlandı!");
    } catch (error) {
      console.log(
        "Sipariş oluşturma mesajı yayınlanırken bir sorun oluştu! --- ",
        error,
      );
    }
  }

  /*
   ^ sipariş hazır olduğunda yayınlanacak mesaj 
   
   * - routingKey : order.ready
   */

  async publishOrderReady(order: IOrder): Promise<void> {
    try {
      if (!this.channel) throw new Error("Rabbitmq kanalı başlatılmamış!");

      const data = {
        orderId: order.id,
        userId: order.userId,
        restaurantId: order.restaurantId,
        deliveryAddress: order.deliveryAddress,
        estimatedDeliveryTime: 30,
        timeStamp: new Date().toISOString(),
      };

      // mesaji hazirla
      const message = Buffer.from(JSON.stringify(data));

      // mesaji yayinla
      await this.channel.publish(this.exchangeName, "order.ready", message, {
        persistent: true,
      });

      console.log("Sipariş durumu mesajı yayınlandı!");
    } catch (error) {
      console.log(
        "Sipariş oluşturma mesajı yayınlanırken bir sorun oluştu! --- ",
        error,
      );
    }
  }
}

export default new RabbitmqService();
