import { Router } from 'express'
import { getSupabase, throwIfSupabaseError } from '../lib/supabase.js'

const router = Router()

router.get('/:id', async (req, res) => {
  try {
    const { data: order, error } = await getSupabase()
      .from('orders')
      .select('id, user_id, email, total, status, created_at, items:order_items(id, order_id, product_id, quantity, price)')
      .eq('id', req.params.id)
      .maybeSingle()
    throwIfSupabaseError(error)

    if (!order) return res.status(404).json({ error: 'Order not found' })
    res.json({
      id: order.id,
      userId: order.user_id,
      email: order.email,
      total: order.total,
      status: order.status,
      createdAt: order.created_at,
      items: (order.items || []).map((item) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
