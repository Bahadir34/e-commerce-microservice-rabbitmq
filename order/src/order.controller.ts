import {
  orderItemSchema,
  orderSchema,
  orderStatusSchema,
  validateDto,
} from "./order.dto.js";
import orderService from "./order.service.js";
import catchAsync from "./utils/index.js";

class OrderController {
  createOrder = catchAsync(async (req, res, next) => {
    const result = await validateDto(orderSchema, req.body);

    if (result.status === "fail") {
      res.status(400).json(result);
      return;
    }

    const data = await orderService.createOrder(
      req.user?.userId as string,
      req.body,
    );

    res.status(201).json(data);
    return;
  });
  getOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await orderService.getOrderById(orderId as string);

    if (!order!) {
      res.status(404).json({ status: "fail", message: "Sipariş bulunamadı." });
      return;
    }

    res.status(200).json(order);
    return;
  });
  getUserOrders = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const result = await orderService.getUserOrders(userId as string);

    res.status(200).json(result);
  });
  updateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;

    const result = await validateDto(orderStatusSchema, req.body);

    if (result.status === "fail") {
      res.status(400).json(result);
      return;
    }
    const data = await orderService.updateOrderStatus(
      orderId as string,
      req.body.status as string,
    );

    if (!data!) {
      res.status(404).json({
        status: "fail",
        message: "Sipariş bulunamadı.",
      });
      return;
    }

    res.status(200).json(data);
    return;
  });
}

export default new OrderController(); // kullanilacak yerlerde new ile yazmaya gerek yok
