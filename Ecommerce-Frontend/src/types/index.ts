export interface Product {
  id: number
  name: string
  description: string
  brand: string
  price: number
  category: string
  releaseDate?: string
  productAvailable: boolean
  stockQuantity: number
  imageName?: string
  imageType?: string
}

export interface Category {
  id: number
  name: string
  description?: string
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
}

export interface Cart {
  id: number
  items: CartItem[]
}

export type OrderStatus = 'CREATED' | 'PAID' | 'SHIPPED' | 'CANCELLED'

export interface OrderItem {
  id: number
  product: Product
  quantity: number
  priceAtPurchase: number
}

export interface Order {
  id: number
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  createdAt: string
}

export interface User {
  id?: number
  username: string
  email?: string
  role?: 'ROLE_USER' | 'ROLE_ADMIN'
}

export interface AppContextValue {
  data: Product[]
  isError: string
  cart: LocalCartItem[]
  user: User | null
  login: (userData: User, token: string) => void
  logout: () => void
  addToCart: (product: Product) => void
  removeFromCart: (productId: number) => void
  refreshData: () => void
  clearCart: () => void
}

export interface LocalCartItem extends Product {
  quantity: number
}
