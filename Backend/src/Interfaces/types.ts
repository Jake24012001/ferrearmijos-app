
import type { Request } from 'express';

export type Rol = 'admin' | 'cliente';

export interface TokenPayload {
  sub: string;
  rol: Rol;
}

export interface AuthRequest extends Request {
  usuario?: TokenPayload;
}

export interface ProductoInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precio_compra: number | string;
  precio_venta: number | string;
}

export interface ItemPedidoInput {
  producto_id: number;
  cantidad: number;
}

export interface PedidoInput {
  sucursal_id: number;
  items: ItemPedidoInput[];
}
