
import type { ProductoInput } from './types';

export function validarProducto(
  datos: ProductoInput
): string | null {
  const { codigo, nombre, categoria, precio_compra, precio_venta } = datos;

  if (
    typeof codigo !== 'string' ||
    !codigo.trim() ||
    typeof nombre !== 'string' ||
    !nombre.trim() ||
    typeof categoria !== 'string' ||
    !categoria.trim()
  ) {
    return 'El código, nombre y categoría son obligatorios.';
  }

  if (
    precio_compra === undefined ||
    precio_compra === null ||
    precio_compra === '' ||
    precio_venta === undefined ||
    precio_venta === null ||
    precio_venta === ''
  ) {
    return 'El precio de compra y el precio de venta son obligatorios.';
  }

  const compra = Number(precio_compra);
  const venta = Number(precio_venta);

  if (!Number.isFinite(compra) || !Number.isFinite(venta)) {
    return 'Los precios deben ser números válidos.';
  }

  if (compra < 0 || venta < 0) {
    return 'Los precios no pueden ser negativos.';
  }

  if (compra > 9999999999.99 || venta > 9999999999.99) {
    return 'El precio supera el límite permitido.';
  }

  return null;
}

export function esEnteroPositivo(valor: unknown): boolean {
  return (
    (typeof valor === 'number' || typeof valor === 'string') &&
    String(valor).trim() !== '' &&
    Number.isInteger(Number(valor)) &&
    Number(valor) > 0
  );
}
