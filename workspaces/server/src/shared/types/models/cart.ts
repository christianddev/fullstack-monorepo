import { Cart } from '@lib'
import { DataTypes } from 'sequelize'
import { addModel } from '../../../shared/db'

export const CartAttributes = {
  cartId: {
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  userId: {
    type: DataTypes.UUID,
  },
  drawingId: {
    type: DataTypes.UUID,
  },
  quantity: {
    type: DataTypes.INTEGER,
  },
}

export const CartModel = addModel<Cart>('cart', CartAttributes)

export default CartModel
