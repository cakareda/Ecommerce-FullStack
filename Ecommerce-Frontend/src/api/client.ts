import API from '@/axios'
import type { Cart, Category, Order, Product } from '@/types'

export const ProductsApi = {
  getAll: () => API.get<Product[]>('/products').then((r) => r.data),
  getById: (id: number) => API.get<Product>(`/products/${id}`).then((r) => r.data),
  search: (keyword: string) =>
    API.get<Product[]>('/products/search', { params: { keyword } }).then((r) => r.data),
}

export const CategoriesApi = {
  getAll: () => API.get<Category[]>('/categories').then((r) => r.data),
  getById: (id: number) => API.get<Category>(`/categories/${id}`).then((r) => r.data),
  create: (category: Partial<Category>) =>
    API.post<Category>('/categories', category).then((r) => r.data),
  update: (id: number, category: Partial<Category>) =>
    API.put<Category>(`/categories/${id}`, category).then((r) => r.data),
  remove: (id: number) => API.delete<string>(`/categories/${id}`).then((r) => r.data),
}

export const CartApi = {
  get: () => API.get<Cart>('/cart').then((r) => r.data),
  addItem: (productId: number, quantity: number) =>
    API.post<Cart>('/cart', { productId, quantity }).then((r) => r.data),
  removeItem: (cartItemId: number) =>
    API.delete<Cart>(`/cart/${cartItemId}`).then((r) => r.data),
}

export const OrdersApi = {
  checkout: () => API.post<Order>('/orders').then((r) => r.data),
  getForUser: (userId: number) => API.get<Order[]>(`/orders/${userId}`).then((r) => r.data),
  getById: (orderId: number) => API.get<Order>(`/orders/detail/${orderId}`).then((r) => r.data),
}
