// Bussiness logic burada yonetilir ve veritabani ile iletisime gecilecek olan katman

import type {
  CourierLoginInput,
  CourierPerformanceInput,
  CourierRegisterInput,
  CourierStatusInput,
  DeliveryStatusUpdateInput,
} from "./delivery.dto.js";
import { Courier, DeliveryTracking } from "./delivery.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import rabbitmqService from "./rabbitmq.service.ts";

class DeliveryService {
  private initialized: boolean = false;

  private async initialize() {
    if (this.initialized) return;

    await rabbitmqService.initialize();

    this.initialized = true;
  }

  constructor() {
    this.initialize();
  }

  async register(data: CourierRegisterInput) {
    const payload = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      vehicleType: data.vehicleType,
      phone: data.phone,
      isAvailable: data.isAvailable,
      role: "courier",
      status: "offline",
      ...(data.vehiclePlate !== undefined
        ? { vehiclePlate: data.vehiclePlate }
        : {}),
    };

    const registeredCourier = await Courier.create(payload);

    const token = jwt.sign(
      { userId: registeredCourier.id, role: registeredCourier.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXP as string,
      } as jwt.SignOptions,
    );

    return {
      status: "success",
      data: {
        courier: registeredCourier,
        token,
      },
    };
  }

  async login(data: CourierLoginInput) {
    // veri tabaninda kullanici var mi?

    const courier = await Courier.findOne({ email: data.email });

    if (!courier) {
      throw new Error("Kullanıcı bulunamadı!");
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      courier.password,
    );

    if (!isPasswordValid) {
      throw new Error("Geçersiz email veya şifre!");
    }

    const token = jwt.sign(
      { userId: courier.id, role: courier.role },
      process.env.JWT_SECRET as string,
      {
        expiresIn: process.env.JWT_EXP as string,
      } as jwt.SignOptions,
    );

    return {
      status: "success",
      data: {
        courier,
        token,
      },
    };
  }

  async updateCourierStatus(courierId: string, data: CourierStatusInput) {
    const courier = await Courier.findByIdAndUpdate(
      courierId,
      {
        status: data.status,
        location: data.location,
      },
      {
        returnDocument: "after",
      },
    );

    return {
      status: "success",
      data: {
        courier,
      },
    };
  }
  async getCourierPerformance(
    courierId: string,
    data: CourierPerformanceInput,
  ) {
    const deliveries = await DeliveryTracking.find({ courierId });

    const totalDeliveries = deliveries.length;
    const completedDeliveries = deliveries.filter(
      (delivery) => delivery.status === "delivered",
    ).length;
    const averageDeliveryTime =
      deliveries
        .filter(
          (delivery) => delivery.actualDeliveryTime && delivery.acceptedAt,
        )
        .reduce(
          (acc, d) =>
            (acc =
              acc +
              new Date(d.actualDeliveryTime as Date).getTime() -
              new Date(d.acceptedAt as Date).getTime()),
          0,
        ) / completedDeliveries || 1;

    return {
      status: "success",
      data: {
        totalDeliveries,
        completedDeliveries,
        averageDeliveryTime,
        completionRate:
          totalDeliveries > 0
            ? (completedDeliveries / totalDeliveries) * 100
            : 0,
      },
    };
  }
  async getAvailableOrders(courierId: string) {
    const deliveries = await DeliveryTracking.find({
      status: { $in: ["pending", "ready"] },
      courierId: { $exists: false }, // baska bir kurye tarafindan henuz alinmamis
    });

    return {
      status: "success",
      data: {
        deliveries,
      },
    };
  }
  async acceptDelivery(orderId: string, courierId: string) {
    const delivery = await DeliveryTracking.findOneAndUpdate(
      {
        orderId,
        courierId: { $exists: false }, // bu siparisi baska kurye tarafindan kabul edilmediyse getir.
      },
      {
        courierId, // kurye id sini ata
        status: "assigned", // statusu assigned olsun yani order atanmis olsun.
        acceptedAt: new Date(),
      },
      {
        new: true,
      },
    );

    return {
      status: "success",
      data: {
        delivery,
      },
    };
  }
  async updateDeliveryStatus(
    orderId: string,
    courierId: string,
    data: DeliveryStatusUpdateInput,
  ) {
    const delivery = await DeliveryTracking.findOneAndUpdate(
      {
        orderId,
        courierId,
      },
      {
        status: data.status,
        location: data.location,
        estimatedDeliveryTime: data.estimatedArrival,
        actualDeliveryTime: data.actualArrival,
        notes: data.notes,
      },
      {
        new: true,
      },
    );

    return {
      status: "success",
      data: {
        delivery,
      },
    };
  }

  async trackDelivery(orderId: string) {
    const delivery = await DeliveryTracking.findOne({ orderId });

    if (!delivery) {
      throw new Error("Teslimat bulunamadı!");
    }

    return {
      status: "success",
      data: {
        delivery,
      },
    };
  }
}

export default new DeliveryService();
