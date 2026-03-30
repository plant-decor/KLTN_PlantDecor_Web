import { CartApiItem } from "@/lib/api/cartWishlistService";
import { CartItem } from "./cart.types";

export interface ResponseModel<T> {
  map(toCartItem: (item: CartApiItem) => CartItem): unknown;
  success?: boolean;
  statusCode?: number;
  message?: string;
  payload?: T;
  data?: T;
}
