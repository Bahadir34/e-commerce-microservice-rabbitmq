import { da } from "zod/locales";
import {
  courierLoginSchema,
  courierPerformanceSchema,
  courierRegisterSchema,
  courierStatusUpdateSchema,
  deliveryStatusUpdateSchema,
  validateDto,
} from "./delivery.dto.js";
import deliveryService from "./delivery.service.js";
import catchAsync from "./utils/index.js";

class DeliveryController {
  register = catchAsync(async (req, res, next) => {
    const result = await validateDto(courierRegisterSchema, req.body);

    if (result.status === "fail") {
      res.status(400).json(result.messages);
      return;
    }

    const registerData = await deliveryService
      .register(req.body)
      .catch((err: Error) => {
        next(err);
      });

    res.cookie("accessToken", registerData?.data.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json(registerData);
  });

  login = catchAsync(async (req, res, next) => {
    const result = await validateDto(courierLoginSchema, req.body);

    if (result.status === "fail") {
      res.status(400).json(result.messages);
      return;
    }

    const loginData = await deliveryService
      .login(req.body)
      .catch((err: Error) => next(err));

    res.cookie("accessToken", loginData?.data.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json(loginData);
  });

  updateCourierStatus = catchAsync(async (req, res, next) => {
    const result = await validateDto(courierStatusUpdateSchema, req.body);

    const courierId = req.user?.userId as string;

    if (result.status === "fail") {
      res.status(400).json(result.messages);
      return;
    }

    const data = await deliveryService
      .updateCourierStatus(courierId, req.body)
      .catch((err) => console.log(err));

    res.status(200).json(data);
  });

  getCourierPerformance = catchAsync(async (req, res, next) => {
    const result = await validateDto(courierPerformanceSchema, req.body);

    const { courierId } = req.params;

    if (result.status === "fail") {
      res.status(400).json(result.messages);
      return;
    }

    const data = await deliveryService.getCourierPerformance(
      courierId as string,
      req.body,
    );

    res.status(200).json(data);
  });

  getAvailableOrders = catchAsync(async (req, res, next) => {
    const { courierId } = req.params;

    const data = await deliveryService.getAvailableOrders(courierId as string);

    res.status(200).json(data);
  });

  acceptDelivery = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const courierId = req.user?.userId as string;

    const data = await deliveryService.acceptDelivery(
      orderId as string,
      courierId,
    );

    res.status(200).json(data);
  });

  updateDeliveryStatus = catchAsync(async (req, res, next) => {
    const result = await validateDto(deliveryStatusUpdateSchema, req.body);
    const { orderId } = req.params;
    const courierId = req.user?.userId;

    if (result.status === "fail") {
      res.status(400).json(result.messages);
      return;
    }

    const data = await deliveryService.updateDeliveryStatus(
      orderId as string,
      courierId as string,
      req.body,
    );

    res.status(200).json(data);
  });

  trackDelivery = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const data = await deliveryService.trackDelivery(orderId as string);
    res.status(200).json(data);
  });
}

export default new DeliveryController(); // kullanilacak yerlerde new ile yazmaya gerek yok
