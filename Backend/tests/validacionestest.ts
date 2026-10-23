import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarProducto, esEnteroPositivo } from '../src/validaciones';
import type { ProductoInput } from '../src/types';

const productoValido: ProductoInput = {
  codigo: 'CEM-001',
  nombre: 'Cemento',
  categoria: 'Construcción',
  precio_compra: 7.5,
  precio_venta: 9
};

test('acepta un producto válido', () => {
  assert.equal(validarProducto(productoValido), null);
});

test('rechaza un producto sin nombre', () => {
  assert.match(
    validarProducto({ ...productoValido, nombre: ' ' }) ?? '',
    /nombre/i
  );
});

test('rechaza precios negativos', () => {
  assert.match(
    validarProducto({ ...productoValido, precio_compra: -1 }) ?? '',
    /negativos/i
  );
});

test('rechaza precios que no son números', () => {
  assert.match(
    validarProducto({ ...productoValido, precio_compra: 'abc' }) ?? '',
    /números válidos/i
  );
});

test('acepta únicamente identificadores enteros positivos', () => {
  assert.equal(esEnteroPositivo(5), true);
  assert.equal(esEnteroPositivo('5'), true);
  assert.equal(esEnteroPositivo(0), false);
  assert.equal(esEnteroPositivo(-1), false);
  assert.equal(esEnteroPositivo('abc'), false);
});
