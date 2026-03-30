// Bussiness logic burada yonetilir ve veritabani ile iletisime gecilecek olan katman

import type {
  MenuItemInput,
  QueryParamsInput,
  RestaurantInput,
} from "./restaurant.dto.js";
import { MenuItem, Restaurant } from "./restaurant.model.js";

class RestaurantService {
  constructor() {}

  async getAll(query: QueryParamsInput) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (query.category) filter.categories = query.category;
    if (query.rating !== undefined) filter.rating = { $gte: query.rating };
    if (query.deliveryTime !== undefined)
      filter.deliveryTime = { $lte: query.deliveryTime };
    if (query.minOrder !== undefined)
      filter.minOrder = { $lte: query.minOrder };

    const query1 = Restaurant.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    const query2 = Restaurant.countDocuments(filter);

    const [items, total] = await Promise.all([query1, query2]);

    return { items, total, page, limit };
  }

  async getById(restaurantId: string) {
    const item = await Restaurant.findById(restaurantId);

    return item;
  }

  async getMenu(restaurantId: string, category: string | undefined) {
    const filter: { restaurantId: string; category?: string } = {
      restaurantId,
    };

    if (category) {
      filter.category = category;
    }

    const items = await MenuItem.find(filter);

    return items;
  }

  async addMenuItem(data: MenuItemInput, restaurantId: string) {
    console.log("ADD MENU ITEM 1");
    const newItem = await MenuItem.create({
      ...data,
      restaurantId: restaurantId,
      imageUrl: data.imageUrl || "",
    }).catch((err) => console.log(err));
    console.log("ADD MENU ITEM 2");

    return newItem;
  }

  async create(data: RestaurantInput, ownerId: string) {
    const newRestaurant = await Restaurant.create({
      ...data,
      ownerId,
    });

    return newRestaurant;
  }
}

export default new RestaurantService();
