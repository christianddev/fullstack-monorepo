/* eslint-disable @typescript-eslint/no-unused-vars */
import { CheckoutRequest, OrderStatus } from '@lib'
import express from 'express'
import { DrawingModel, EnrichedRequest } from '../../shared/types'
import { OrderModel } from '../../shared/types/models/order'

export async function checkout(_req: express.Request, res: express.Response) {
  const req = _req as EnrichedRequest
  const { items, intent, shippingAddressId, paymentMethodId } = req.body as CheckoutRequest
  const productSelect = await DrawingModel.findAll({
    where: { drawingId: items.map(i => i.drawingId) },
  })
  const products = productSelect.map(item => item.get())
  const total = products.reduce((acc, item) => acc + (item.price || 0), 0)
  const order = OrderModel.create({
    userId: req.auth?.userId,
    status: OrderStatus.Pending,
    shippingAddressId,
    paymentMethodId,
    total,
  })

  res.json({ order })
}
