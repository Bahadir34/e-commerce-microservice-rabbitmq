import {
  menuItemSchema,
  queryParamsSchema,
  restaurantSchema,
  validateDto,
} from "./restaurant.dto.js";
import restaurantService from "./restaurant.service.js";
import catchAsync from "./utils/index.js";

class RestaurantController {
  getAllRestaurants = catchAsync(async (req, res, next) => {
    const result = await validateDto(queryParamsSchema, req.query);

    if (result.status === "fail") {
      res.status(400).json(result);
      return;
    }

    const data = await restaurantService.getAll(req.query);

    res.status(200).json(data);
  });

  createRestaurant = catchAsync(async (req, res, next) => {
    const result = await validateDto(restaurantSchema, req.body);

    if (result.status === "fail") {
      res.status(400).json({
        status: result.status,
        messages: result.messages,
      });
      return;
    }

    const ownerId = req.user?.userId || "";

    const data = await restaurantService.create(req.body, ownerId);

    res.status(200).json(data);
  });

  getRestaurant = catchAsync(async (req, res, next) => {
    const result = await restaurantService.getById(req.params.id as string);
    res.status(200).json(result);
  });

  getRestaurantMenu = catchAsync(async (req, res, next) => {
    const category = req.query.category as string | undefined;
    const result = await restaurantService.getMenu(
      req.params.id as string,
      category,
    );

    res.status(200).json(result);
  });

  addMenuItem = catchAsync(async (req, res, next) => {
    const result = await validateDto(menuItemSchema, req.body);
    console.log(1);
    if (result.status === "fail") {
      res.status(400).json({
        status: result.status,
        messages: result.messages,
      });
      return;
    }
    console.log(2);
    const restaurantId = req.params.id;

    const data = await restaurantService.addMenuItem(
      req.body,
      restaurantId as string,
    );
    console.log(3);

    res.status(200).json(data);
  });
}

export default new RestaurantController(); // kullanilacak yerlerde new ile yazmaya gerek yok
