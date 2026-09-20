import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CategoriesApi, ProductsApi } from '@/api/client'
import type { Category, Product } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    CategoriesApi.getAll()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selected) {
      setProducts([])
      return
    }
    ProductsApi.search(selected)
      .then(setProducts)
      .catch((err) => setError(err.message))
  }, [selected])

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Browse Categories</h1>

      {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
      {loading && <p className="text-sm text-muted-foreground">Loading categories...</p>}

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selected === category.name ? 'default' : 'outline'}
            className="cursor-pointer select-none px-3 py-1 text-sm"
            onClick={() => setSelected(category.name)}
          >
            {category.name}
          </Badge>
        ))}
        {categories.length === 0 && !loading && (
          <p className="text-sm text-muted-foreground">No categories found yet.</p>
        )}
      </div>

      {selected && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Products in "{selected}"</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">${product.price?.toFixed?.(2) ?? product.price}</span>
                    <Link
                      to={`/product/${product.id}`}
                      className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))}
                    >
                      View
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {products.length === 0 && (
              <p className="text-sm text-muted-foreground">No products found in this category.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
