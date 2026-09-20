import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OrdersApi } from '@/api/client'
import type { Order } from '@/types'
import AppContext from '@/Context/Context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREATED: 'secondary',
  PAID: 'default',
  SHIPPED: 'outline',
  CANCELLED: 'destructive',
}

export default function OrdersPage() {
  const { user } = useContext(AppContext)
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!user.id) {
      setLoading(false)
      return
    }
    OrdersApi.getForUser(user.id)
      .then(setOrders)
      .catch((err) => setError(err.response?.data ?? err.message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Order History</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading orders...</p>}
      {!loading && orders.length === 0 && (
        <p className="text-sm text-muted-foreground">You have not placed any orders yet.</p>
      )}

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Order #{order.id}</span>
                <Badge variant={statusVariant[order.status] ?? 'outline'}>{order.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-muted-foreground">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
              <ul className="mb-2 list-inside list-disc text-sm">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} x {item.product.name} (${item.priceAtPurchase.toFixed(2)} each)
                  </li>
                ))}
              </ul>
              <p className="font-semibold">Total: ${order.totalAmount.toFixed(2)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
