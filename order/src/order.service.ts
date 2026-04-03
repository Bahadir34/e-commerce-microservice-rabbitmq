// Bussiness logic burada yonetilir ve veritabani ile iletisime gecilecek olan katman

import type { OrderInput } from "./order.dto.js";
import Order from "./order.model.js";
import rabbitmqServise from "./rabbitmq.servise.js";
import type { IAddress, IOrder } from "./types/index.js";

class OrderService {
  private initialized: boolean = false;

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await rabbitmqServise
        .initialize()
        .then(() => {
          this.initialized = true;
        })
        .catch((err) => console.log("Rabbitmq bağlantısında bir hata oluştu!"));
    }
  }

  // todo : Define schemas!
  async createOrder(userId: string, orderData: OrderInput): Promise<IOrder> {
    // rabbitm1 bağlantısı başlar
    await this.initialize();

    // toplam tutarı hesapla
    const totalAmount = orderData.items.reduce(
      (sum, item) => (sum = sum + item.price * item.quantity),
      0,
    );

    // siparişi oluştur
    const order = await Order.create({
      userId,
      restaurantId: orderData.restaurantId,
      items: orderData.items,
      totalAmount,
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      specialInstructions: orderData.specialInstructions || "",
      status: "pending",
    }).catch((err) => {
      console.log(err);
      throw new Error(err);
    });

    // siğariş oluşturulduğunda kuyruğa haber gönder.
    await rabbitmqServise.publishOrderCreated(order);

    return order;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    return (await Order.findById(orderId)) as IOrder;
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    return await Order.find({ userId });
  }

  async updateOrderStatus(orderId: string, newStatus: string): Promise<IOrder> {
    await this.initialize();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: newStatus },
      { new: true }, // guncellenmis order i kullaniciya geri vericez.
    );

    // * siparis hazir olduysa delivery service e haber gondermek gerekir.
    if (updatedOrder && newStatus === "ready") {
    }

    if (updatedOrder && newStatus === " ready") {
      await rabbitmqServise.publishOrderReady(updatedOrder);
    }

    return updatedOrder as IOrder;
  }
}

export default new OrderService();
