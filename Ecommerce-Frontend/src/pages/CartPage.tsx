import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartApi, OrdersApi } from '@/api/client'
import type { Cart } from '@/types'
import AppContext from '@/Context/Context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function CartPage() {
  const { user } = useContext(AppContext)
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)

  const loadCart = () => {
    setLoading(true)
    CartApi.get()
      .then(setCart)
      .catch((err) => setError(err.response?.data ?? err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadCart()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRemove = async (cartItemId: number) => {
    try {
      const updated = await CartApi.removeItem(cartItemId)
      setCart(updated)
    } catch (err: any) {
      setError(err.response?.data ?? err.message)
    }
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    setError('')
    try {
      const order = await OrdersApi.checkout()
      navigate('/orders', { state: { justPlacedOrderId: order.id } })
    } catch (err: any) {
      setError(err.response?.data ?? err.message ?? 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  const total = cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Your Cart</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading cart...</p>}

      {!loading && cart && cart.items.length === 0 && (
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      )}

      <div className="flex flex-col gap-4">
        {cart?.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.quantity} x ${item.product.price.toFixed(2)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleRemove(item.id)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {cart && cart.items.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleCheckout} disabled={checkingOut}>
              {checkingOut ? 'Placing order...' : 'Checkout'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
