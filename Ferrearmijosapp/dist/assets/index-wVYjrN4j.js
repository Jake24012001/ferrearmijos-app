(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`http://${typeof window<`u`&&window.location.hostname?window.location.hostname:`localhost`}:3000/api`;async function t(t,n={}){let r=localStorage.getItem(`token`),i={"Content-Type":`application/json`,...r?{Authorization:`Bearer ${r}`}:{},...n.headers||{}};try{let r=await fetch(`${e}${t}`,{...n,headers:i}),a=await r.json();if(!r.ok)throw r.status===401&&(localStorage.removeItem(`token`),localStorage.removeItem(`usuario`)),Error(a.error||`Ocurrió un error en el servidor`);return a}catch(t){throw t.message===`Failed to fetch`||t.name===`TypeError`?Error(`No se pudo conectar con el servidor Backend en ${e}. Verifica que esté iniciado.`):t}}function n(e,t){localStorage.setItem(`token`,e),localStorage.setItem(`usuario`,JSON.stringify(t))}function r(){let e=localStorage.getItem(`usuario`);if(!e)return null;try{return JSON.parse(e)}catch{return null}}function i(){localStorage.removeItem(`token`),localStorage.removeItem(`usuario`)}var a={1:{vistaDefault:`ventas`,verNavVentas:!0,verNavHistorial:!0,verNavProductos:!0,verNavUsuarios:!0,puedeCrearProductos:!0,puedeVerPrecioCompra:!0,puedeVerStockBajo:!0,puedeGestionarUsuarios:!0,puedeAjustarInventario:!0,etiquetaRol:`Administrador`,colorRol:`bg-amber-500 text-amber-950`,iconoRol:`👑`},2:{vistaDefault:`ventas`,verNavVentas:!0,verNavHistorial:!0,verNavProductos:!1,verNavUsuarios:!1,puedeCrearProductos:!1,puedeVerPrecioCompra:!1,puedeVerStockBajo:!1,puedeGestionarUsuarios:!1,puedeAjustarInventario:!1,etiquetaRol:`Vendedor`,colorRol:`bg-blue-500 text-white`,iconoRol:`💼`},3:{vistaDefault:`productos`,verNavVentas:!1,verNavHistorial:!1,verNavProductos:!0,verNavUsuarios:!1,puedeCrearProductos:!0,puedeVerPrecioCompra:!1,puedeVerStockBajo:!0,puedeGestionarUsuarios:!1,puedeAjustarInventario:!0,etiquetaRol:`Bodeguero`,colorRol:`bg-emerald-600 text-white`,iconoRol:`📦`}};function o(){return a[r()?.rol_id??2]??a[2]}function s(r){r.innerHTML=`
    <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center px-4 py-8">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        <!-- Header del Formulario -->
        <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 p-6 text-center text-white relative">
          <div class="w-16 h-16 bg-amber-500 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-3">
            🔨
          </div>
          <h1 class="text-2xl font-black tracking-wide">FerreArmijos</h1>
          <p class="text-xs text-blue-200 mt-1 font-medium">Sistema Móvil de Facturación e Inventario</p>
          <div class="mt-2 text-[10px] bg-blue-950/50 py-1 px-2.5 rounded-full inline-block text-blue-300">
            Conectado a: <span class="font-mono">${e}</span>
          </div>
        </div>

        <!-- Cuerpo del Formulario -->
        <form id="login-form" class="p-6 sm:p-8 space-y-4">
          <div id="login-error" class="hidden bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2">
            <span class="text-base">⚠️</span>
            <span id="login-error-text"></span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">📧</span>
              <input 
                type="email" 
                id="login-email" 
                class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                placeholder="correo@ferrearmijos.com" 
                required 
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">🔒</span>
              <input 
                type="password" 
                id="login-password" 
                class="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                placeholder="••••••••" 
                required 
              />
            </div>
          </div>

          <button 
            type="submit" 
            id="btn-login-submit"
            class="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 rounded-xl shadow-md transition active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
          >
            <span>Ingresar al Sistema</span>
            <span>➔</span>
          </button>

          <!-- Acceso rápido para pruebas de roles -->
          <div class="pt-3 border-t border-slate-100">
            <p class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Acceso rápido de prueba por Rol:</p>
            <div class="grid grid-cols-3 gap-2">
              <button 
                type="button" 
                id="btn-fill-admin" 
                class="py-2 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-0.5"
                title="Administrador (Acceso total)"
              >
                <span>👑</span>
                <span>Admin</span>
              </button>
              <button 
                type="button" 
                id="btn-fill-vendedor" 
                class="py-2 px-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-0.5"
                title="Vendedor (Ventas y su propio historial)"
              >
                <span>💼</span>
                <span>Vendedor</span>
              </button>
              <button 
                type="button" 
                id="btn-fill-bodeguero" 
                class="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center gap-0.5"
                title="Bodeguero (Inventario y alertas críticas)"
              >
                <span>📦</span>
                <span>Bodeguero</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <p class="text-xs text-slate-400 text-center mt-6">
        Carrera de Tecnologías de la Información • UTMACH
      </p>
    </div>
  `;let i=document.getElementById(`login-form`),a=document.getElementById(`login-email`),s=document.getElementById(`login-password`),c=document.getElementById(`login-error`),l=document.getElementById(`login-error-text`),u=document.getElementById(`btn-login-submit`);document.getElementById(`btn-fill-admin`)?.addEventListener(`click`,()=>{a.value=`admin@ferrearmijos.com`,s.value=`admin123`,c.classList.add(`hidden`)}),document.getElementById(`btn-fill-vendedor`)?.addEventListener(`click`,()=>{a.value=`vendedor@ferrearmijos.com`,s.value=`vendedor123`,c.classList.add(`hidden`)}),document.getElementById(`btn-fill-bodeguero`)?.addEventListener(`click`,()=>{a.value=`bodeguero@ferrearmijos.com`,s.value=`bodeguero123`,c.classList.add(`hidden`)}),i.addEventListener(`submit`,async e=>{e.preventDefault(),c.classList.add(`hidden`),u.disabled=!0,u.innerHTML=`<span>Iniciando sesión...</span>`;try{let e=a.value.trim(),r=s.value,i=await t(`/auth/login`,{method:`POST`,body:JSON.stringify({email:e,password:r})});n(i.token,i.usuario),B(o().vistaDefault)}catch(e){l.textContent=e.message||`Error al iniciar sesión`,c.classList.remove(`hidden`)}finally{u.disabled=!1,u.innerHTML=`<span>Ingresar al Sistema</span> <span>➔</span>`}})}function c(e){let t=r(),n=o(),i=t?t.nombre:`Usuario`,a=(t,n,r,i)=>i?`<button 
          onclick="window.cambiarVista('${t}')" 
          class="px-4 py-1.5 rounded-lg transition flex items-center gap-2 ${e===t?`bg-amber-500 text-blue-950 font-bold shadow`:`text-blue-100 hover:bg-blue-800/50`}"
        >
          ${n} ${r}
        </button>`:``,s=(t,n,r,i)=>i?`<button 
          onclick="window.cambiarVista('${t}')" 
          class="flex flex-col items-center flex-1 py-1 transition ${e===t?`text-blue-700 font-bold`:`text-gray-500 hover:text-gray-800`}"
        >
          <span class="text-xl">${n}</span>
          <span class="text-[11px] mt-0.5">${r}</span>
        </button>`:``;return`
    <!-- Barra Superior -->
    <header class="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 text-white shadow-lg sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-2.5">
          <div class="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow text-blue-950 font-black text-xl">
            🔨
          </div>
          <div>
            <span class="font-extrabold text-lg sm:text-xl tracking-wide block leading-tight">FerreArmijos</span>
            <span class="text-[11px] text-blue-200 block font-medium">App Móvil de Gestión</span>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <!-- Chip de rol -->
          <div class="hidden sm:flex flex-col text-right">
            <span class="text-xs font-semibold text-white leading-tight">${i}</span>
            <span class="text-[10px] mt-0.5">
              <span class="inline-flex items-center gap-1 ${n.colorRol} text-[10px] font-bold px-2 py-0.5 rounded-full">
                ${n.iconoRol} ${n.etiquetaRol}
              </span>
            </span>
          </div>

          <button 
            onclick="window.cerrarSesion()" 
            class="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-400/40 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span class="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>

      <!-- Nav Desktop -->
      <nav class="hidden md:flex border-t border-blue-800/60 bg-blue-950/40 px-4 py-1.5 justify-center gap-4 text-sm font-medium">
        ${a(`ventas`,`🛒`,`Nueva Venta`,n.verNavVentas)}
        ${a(`productos`,`📦`,`Inventario`,n.verNavProductos)}
        ${a(`historial`,`📋`,`Historial de Ventas`,n.verNavHistorial)}
        ${a(`usuarios`,`👥`,`Gestión de Usuarios`,n.verNavUsuarios)}
      </nav>
    </header>

    <!-- Bottom Nav Móvil (solo pestañas habilitadas para el rol) -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 py-1.5 px-3 flex justify-around items-center">
      ${s(`ventas`,`🛒`,`Venta`,n.verNavVentas)}
      ${s(`productos`,`📦`,`Inventario`,n.verNavProductos)}
      ${s(`historial`,`📋`,`Historial`,n.verNavHistorial)}
      ${s(`usuarios`,`👥`,`Usuarios`,n.verNavUsuarios)}
    </nav>
  `}function l(){return`
    <!-- Modal para Insertar Nuevo Producto -->
    <div id="modal-nuevo-producto" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm hidden animate-fadeIn">
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        
        <!-- Header del Modal -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 sm:p-5 flex justify-between items-center">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-xl bg-amber-500 text-blue-950 flex items-center justify-center font-black text-lg">➕</span>
            <div>
              <h2 class="text-base sm:text-lg font-black leading-tight">Registrar Nuevo Producto</h2>
              <p class="text-[11px] text-blue-200">Se agregará al catálogo y al inventario de PostgreSQL</p>
            </div>
          </div>
          <button id="btn-cerrar-modal" class="text-blue-200 hover:text-white p-1 text-xl font-bold leading-none">&times;</button>
        </div>

        <!-- Formulario -->
        <form id="form-nuevo-producto" class="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 text-xs sm:text-sm">
          
          <div id="modal-producto-error" class="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs hidden"></div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Código del Producto *
              </label>
              <input 
                type="text" 
                id="nuevo-prod-codigo" 
                class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                placeholder="PROD-001" 
                required 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Categoría *
              </label>
              <select 
                id="nuevo-prod-categoria" 
                class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="1">Herramientas</option>
                <option value="2">Construcción</option>
                <option value="3">Fijación</option>
                <option value="4">Pinturas</option>
                <option value="5">Plomería</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Nombre del Producto *
            </label>
            <input 
              type="text" 
              id="nuevo-prod-nombre" 
              class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none" 
              placeholder="Ej. Taladro Percutor 1/2 pulgada" 
              required 
            />
          </div>

          <div>
            <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
              Descripción (Opcional)
            </label>
            <input 
              type="text" 
              id="nuevo-prod-descripcion" 
              class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none" 
              placeholder="Ej. Potencia 650W, velocidad variable" 
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Precio Compra ($)
              </label>
              <input 
                type="number" 
                step="0.01" 
                min="0" 
                id="nuevo-prod-precio-compra" 
                class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                placeholder="0.00" 
              />
            </div>

            <div>
              <label class="block font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-1">
                Precio Venta ($) *
              </label>
              <input 
                type="number" 
                step="0.01" 
                min="0.01" 
                id="nuevo-prod-precio-venta" 
                class="w-full bg-slate-50 border border-emerald-300 font-bold text-emerald-700 px-3 py-2 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none" 
                placeholder="0.00" 
                required 
              />
            </div>
          </div>

          <!-- Sucursal y Stock Inicial -->
          <div class="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 space-y-2.5">
            <span class="text-[11px] font-black uppercase text-blue-900 block">
              📦 Inventario Inicial
            </span>

            <div>
              <label class="block font-semibold text-slate-700 text-[11px] mb-1">
                Asignar Stock a Sucursal:
              </label>
              <select 
                id="nuevo-prod-sucursal" 
                class="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="">Todas las sucursales</option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 text-[11px] mb-1">
                  Stock Inicial (Unidades) *
                </label>
                <input 
                  type="number" 
                  min="0" 
                  id="nuevo-prod-stock" 
                  value="15" 
                  class="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                  required 
                />
              </div>

              <div>
                <label class="block font-semibold text-slate-700 text-[11px] mb-1">
                  Stock Mínimo (Alerta) *
                </label>
                <input 
                  type="number" 
                  min="1" 
                  id="nuevo-prod-stock-minimo" 
                  value="5" 
                  class="w-full bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none" 
                  required 
                />
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              id="btn-cancelar-modal" 
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition"
            >
              Cancelar
            </button>

            <button 
              type="submit" 
              id="btn-guardar-producto" 
              class="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition active:scale-[0.99] flex justify-center items-center gap-1.5"
            >
              <span>Guardar Producto</span>
              <span>💾</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `}function u(e){let n=document.getElementById(`modal-nuevo-producto`),r=document.getElementById(`btn-cerrar-modal`),i=document.getElementById(`btn-cancelar-modal`),a=document.getElementById(`form-nuevo-producto`),o=document.getElementById(`nuevo-prod-categoria`),s=document.getElementById(`nuevo-prod-sucursal`),c=document.getElementById(`modal-producto-error`),l=document.getElementById(`btn-guardar-producto`);async function u(){try{let[e,n]=await Promise.all([t(`/categorias`).catch(()=>[]),t(`/sucursales`).catch(()=>[])]);e.length>0&&(o.innerHTML=e.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)),n.length>0&&(s.innerHTML=`
          <option value="">Todas las sucursales</option>
          ${n.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
        `)}catch(e){console.warn(`No se pudieron precargar selects del modal:`,e)}}u();function d(e){a.reset(),c.classList.add(`hidden`);let t=`PROD-${Math.floor(100+Math.random()*900)}`;document.getElementById(`nuevo-prod-codigo`).value=t,document.getElementById(`nuevo-prod-stock`).value=`20`,document.getElementById(`nuevo-prod-stock-minimo`).value=`5`,e&&(s.value=String(e)),n.classList.remove(`hidden`)}function f(){n.classList.add(`hidden`)}return r.addEventListener(`click`,f),i.addEventListener(`click`,f),n.addEventListener(`click`,e=>{e.target===n&&f()}),a.addEventListener(`submit`,async n=>{n.preventDefault(),c.classList.add(`hidden`);let r=document.getElementById(`nuevo-prod-codigo`).value.trim(),i=document.getElementById(`nuevo-prod-nombre`).value.trim(),a=document.getElementById(`nuevo-prod-descripcion`).value.trim(),u=Number(o.value),d=Number(document.getElementById(`nuevo-prod-precio-compra`).value)||0,p=Number(document.getElementById(`nuevo-prod-precio-venta`).value),m=Number(document.getElementById(`nuevo-prod-stock`).value),h=Number(document.getElementById(`nuevo-prod-stock-minimo`).value),g=s.value?Number(s.value):void 0;if(!i)c.textContent=`El nombre del producto es obligatorio.`,c.classList.remove(`hidden`);else if(!p||p<=0)c.textContent=`El precio de venta debe ser un número mayor a 0.`,c.classList.remove(`hidden`);else{l.disabled=!0,l.innerHTML=`<span>Guardando en BD...</span>`;try{await t(`/productos`,{method:`POST`,body:JSON.stringify({codigo:r,nombre:i,descripcion:a,categoria_id:u,precio_compra:d,precio_venta:p,stock:m,stock_minimo:h,sucursal_id:g})}),alert(`🎉 ¡Producto "${i}" registrado exitosamente en la base de datos!`),f(),await e()}catch(e){c.textContent=e.message||`Error al guardar el producto en el servidor.`,c.classList.remove(`hidden`)}finally{l.disabled=!1,l.innerHTML=`<span>Guardar Producto</span> <span>💾</span>`}}}),{abrirModal:d,cerrarModal:f}}var d=[],f=[],p=``,m=0;async function h(e){let n=o();e.innerHTML=`
    <div class="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-6">
      ${c(`ventas`)}

      <main class="max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 flex-1">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>🛒</span> Punto de Venta / Facturación
            </h1>
            <p class="text-xs text-slate-500">Registra ventas y actualiza el inventario en tiempo real.</p>
          </div>
        </div>

        <!-- Panel de configuración de la venta -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase mb-1">🏢 Sucursal:</label>
            <select id="select-sucursal" class="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none">
              <option value="">Cargando...</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase mb-1">👤 Cliente:</label>
            <select id="select-cliente" class="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none">
              <option value="">Cargando...</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 uppercase mb-1">💳 Forma de Pago:</label>
            <select id="select-pago" class="w-full bg-slate-50 border border-slate-300 p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none">
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">📱 Transferencia</option>
              <option value="tarjeta">💳 Tarjeta</option>
              <option value="credito">📝 Crédito</option>
            </select>
          </div>
        </div>

        <!-- Catálogo + Carrito -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">

          <!-- Catálogo -->
          <div class="lg:col-span-7 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[520px]">
            <div class="flex items-center justify-between mb-3 gap-2">
              <div class="flex items-center gap-2">
                <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📦</span> Productos Disponibles
                </h2>
                <span id="badge-total-prods" class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">0 items</span>
              </div>

              ${n.puedeCrearProductos?`
                <button 
                  id="btn-abrir-modal-nuevo-prod"
                  type="button"
                  class="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  title="Registrar nuevo producto en la base de datos"
                >
                  <span>➕</span><span>Nuevo Producto</span>
                </button>
              `:``}
            </div>

            <!-- Buscador -->
            <div class="relative mb-3">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">🔍</span>
              <input 
                type="text" 
                id="input-buscar-producto" 
                placeholder="Buscar por nombre o código..." 
                class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <!-- Lista de productos -->
            <div id="lista-productos" class="flex-1 overflow-y-auto space-y-2 pr-1">
              <p class="text-slate-400 text-center py-12 text-sm">Selecciona una sucursal para ver los productos.</p>
            </div>
          </div>

          <!-- Carrito -->
          <div class="lg:col-span-5 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[520px] justify-between">
            <div>
              <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🛒</span> Carrito de Compra
                </h2>
                <button id="btn-vaciar-carrito" class="text-xs text-red-500 hover:text-red-700 font-semibold hidden">Vaciar</button>
              </div>

              <div id="lista-carrito" class="overflow-y-auto max-h-[260px] space-y-2 pr-1">
                <div class="text-center py-12 text-slate-400">
                  <span class="text-3xl block mb-1">🛒</span>
                  <p class="text-xs">El carrito está vacío</p>
                </div>
              </div>
            </div>

            <div class="border-t border-slate-200 pt-3 mt-2 bg-slate-50 -mx-4 -mb-4 p-4 rounded-b-2xl">
              <div class="space-y-1 text-xs text-slate-600 mb-2">
                <div class="flex justify-between"><span>Subtotal:</span><span id="resumen-subtotal" class="font-semibold text-slate-800">$0.00</span></div>
                <div class="flex justify-between"><span>IVA (15%):</span><span id="resumen-iva" class="font-semibold text-slate-800">$0.00</span></div>
                <div class="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Total a Pagar:</span>
                  <span id="resumen-total" class="text-emerald-600">$0.00</span>
                </div>
              </div>

              <button 
                id="btn-pagar" 
                class="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-black text-sm shadow-md transition active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                disabled
              >
                <span>Facturar y Registrar Venta</span>
                <span>✓</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      ${n.puedeCrearProductos?l():``}
    </div>
  `;let r=document.getElementById(`select-sucursal`);if(n.puedeCrearProductos){let e=u(async()=>{await g(m)});document.getElementById(`btn-abrir-modal-nuevo-prod`)?.addEventListener(`click`,()=>{e.abrirModal(m)})}try{let[e,n]=await Promise.all([t(`/sucursales`),t(`/clientes`)]);r.innerHTML=e.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``);let i=document.getElementById(`select-cliente`);i.innerHTML=n.map(e=>`<option value="${e.id}">${e.nombre}${e.cedula_ruc?` (${e.cedula_ruc})`:``}</option>`).join(``),r.addEventListener(`change`,()=>{d=[],v(),m=Number(r.value),g(m)}),e.length>0&&(m=e[0].id,await g(m))}catch(e){alert(e.message||`Error al conectar con el servidor backend.`)}document.getElementById(`input-buscar-producto`).addEventListener(`input`,e=>{p=e.target.value.toLowerCase(),_()}),document.getElementById(`btn-vaciar-carrito`)?.addEventListener(`click`,()=>{confirm(`¿Deseas vaciar el carrito?`)&&(d=[],v())}),document.getElementById(`btn-pagar`).addEventListener(`click`,y)}async function g(e){let n=document.getElementById(`lista-productos`);n.innerHTML=`<p class="text-slate-400 text-center py-12 text-sm">Cargando inventario...</p>`;try{f=(await t(`/inventario?sucursal_id=${e}`)).map(e=>({id:e.id,producto_id:e.producto_id,sucursal_id:e.sucursal_id,stock:Number(e.stock),stock_minimo:Number(e.stock_minimo),nombre:e.nombre||e.producto?.nombre||`Producto #${e.producto_id}`,precio_venta:Number(e.precio_venta||e.producto?.precio_venta||0),codigo:e.codigo||e.producto?.codigo||``})),_()}catch(e){n.innerHTML=`<p class="text-red-500 text-center py-12 text-sm">${e.message}</p>`}}function _(){let e=document.getElementById(`lista-productos`),t=document.getElementById(`badge-total-prods`),n=f.filter(e=>e.nombre.toLowerCase().includes(p)||e.codigo?.toLowerCase().includes(p));t&&(t.textContent=`${n.length} items`),e.innerHTML=n.length===0?`<p class="text-slate-400 text-center py-12 text-xs">No se encontraron productos disponibles.</p>`:n.map(e=>{let t=d.find(t=>t.productoId===e.producto_id),n=t?t.cantidad:0,r=e.stock-n,i=r<=0;return`
      <div class="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-sm transition ${i?`opacity-60 bg-slate-50`:``}">
        <div class="pr-2 flex-1">
          <div class="flex items-center gap-1.5">
            ${e.codigo?`<span class="text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 py-0.5 rounded font-bold">${e.codigo}</span>`:``}
            <p class="font-bold text-slate-800 text-xs sm:text-sm leading-tight">${e.nombre}</p>
          </div>
          <div class="flex items-center gap-3 mt-1 text-xs">
            <span class="font-bold text-emerald-600 text-sm">$${e.precio_venta.toFixed(2)}</span>
            <span class="text-[11px] ${r<=e.stock_minimo?`text-amber-600 font-semibold`:`text-slate-500`}">
              Stock: <strong>${r}</strong> disp.
            </span>
          </div>
        </div>
        <button 
          onclick="window.agregarCarrito(${e.producto_id})" 
          class="px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95 ${i?`bg-slate-200 text-slate-400 cursor-not-allowed`:`bg-blue-600 hover:bg-blue-700 text-white`}"
          ${i?`disabled`:``}
        >
          <span>+</span><span class="hidden sm:inline">Agregar</span>
        </button>
      </div>
    `}).join(``)}window.agregarCarrito=e=>{let t=f.find(t=>t.producto_id===e);if(!t)return;let n=d.find(t=>t.productoId===e);if(n){if(n.cantidad<t.stock)n.cantidad++;else{alert(`Stock máximo alcanzado (${t.stock} unidades disponibles).`);return}}else{if(t.stock<=0){alert(`Producto agotado en esta sucursal.`);return}d.push({productoId:t.producto_id,codigo:t.codigo,nombre:t.nombre,precio:t.precio_venta,cantidad:1,stockDisponible:t.stock})}v(),_()},window.modificarCantidadCarrito=(e,t)=>{let n=d.find(t=>t.productoId===e);if(!n)return;let r=n.cantidad+t;if(r<=0)d=d.filter(t=>t.productoId!==e);else if(r>n.stockDisponible){alert(`Solo hay ${n.stockDisponible} unidades disponibles.`);return}else n.cantidad=r;v(),_()},window.eliminarItemCarrito=e=>{d=d.filter(t=>t.productoId!==e),v(),_()};function v(){let e=document.getElementById(`lista-carrito`),t=document.getElementById(`resumen-subtotal`),n=document.getElementById(`resumen-iva`),r=document.getElementById(`resumen-total`),i=document.getElementById(`btn-pagar`),a=document.getElementById(`btn-vaciar-carrito`);if(d.length===0){e.innerHTML=`<div class="text-center py-12 text-slate-400"><span class="text-3xl block mb-1">🛒</span><p class="text-xs">El carrito está vacío</p></div>`,t.textContent=`$0.00`,n.textContent=`$0.00`,r.textContent=`$0.00`,i.disabled=!0,a?.classList.add(`hidden`);return}a?.classList.remove(`hidden`);let o=0;e.innerHTML=d.map(e=>{let t=e.precio*e.cantidad;return o+=t,`
      <div class="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
        <div class="flex-1 pr-2">
          <p class="font-bold text-slate-800 leading-tight">${e.nombre}</p>
          <p class="text-[11px] text-slate-500">$${e.precio.toFixed(2)} c/u</p>
        </div>
        <div class="flex items-center space-x-2">
          <div class="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
            <button onclick="window.modificarCantidadCarrito(${e.productoId}, -1)" class="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold">-</button>
            <span class="px-2 text-xs font-black text-slate-800">${e.cantidad}</span>
            <button onclick="window.modificarCantidadCarrito(${e.productoId}, 1)" class="px-2 py-0.5 text-slate-600 hover:bg-slate-100 font-bold">+</button>
          </div>
          <span class="font-extrabold text-slate-800 w-14 text-right">$${t.toFixed(2)}</span>
          <button onclick="window.eliminarItemCarrito(${e.productoId})" class="text-red-400 hover:text-red-600 text-sm font-bold p-1" title="Quitar">✕</button>
        </div>
      </div>
    `}).join(``);let s=Math.round(o*.15*100)/100,c=Math.round((o+s)*100)/100;t.textContent=`$${o.toFixed(2)}`,n.textContent=`$${s.toFixed(2)}`,r.textContent=`$${c.toFixed(2)}`,i.disabled=!1}async function y(){let e=Number(document.getElementById(`select-sucursal`).value),n=Number(document.getElementById(`select-cliente`).value),i=document.getElementById(`select-pago`).value,a=r()?.id||1;if(!e){alert(`Selecciona una sucursal.`);return}if(!n){alert(`Selecciona un cliente.`);return}if(d.length===0){alert(`El carrito está vacío.`);return}let o=document.getElementById(`btn-pagar`);o.disabled=!0,o.innerHTML=`<span>Procesando venta...</span>`;try{let r=await t(`/ventas`,{method:`POST`,body:JSON.stringify({usuarioId:a,sucursalId:e,clienteId:n,metodoPago:i,items:d.map(e=>({productoId:e.productoId,cantidad:e.cantidad}))})});alert(`🎉 ¡Venta registrada exitosamente!\nPedido Nro: #${r.pedidoId}`),d=[],v(),await g(e)}catch(e){alert(e.message||`Error al procesar la venta`)}finally{o.disabled=!1,o.innerHTML=`<span>Facturar y Registrar Venta</span> <span>✓</span>`}}async function b(e){e.innerHTML=`
    <div class="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-6">
      ${c(`historial`)}

      <main class="max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 flex-1">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>📋</span> Historial de Ventas / Pedidos
            </h1>
            <p class="text-xs text-slate-500">Registro histórico de transacciones facturadas en todas las sucursales.</p>
          </div>

          <button 
            id="btn-refrescar-historial"
            class="self-start sm:self-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 active:scale-95"
          >
            <span>🔄</span> Refrescar
          </button>
        </div>

        <!-- Tarjetas de resumen -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Pedidos</span>
            <span id="stat-total-pedidos" class="text-xl font-black text-slate-800">0</span>
          </div>

          <div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monto Total Facturado</span>
            <span id="stat-total-monto" class="text-xl font-black text-emerald-600">$0.00</span>
          </div>

          <div class="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado de Facturación</span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">100% Pagados</span>
          </div>
        </div>

        <!-- Lista de Pedidos en formato móvil (Cards) -->
        <div id="lista-pedidos-historial" class="space-y-3">
          <p class="text-slate-400 text-center py-12 text-sm">Cargando pedidos...</p>
        </div>

      </main>
    </div>
  `,document.getElementById(`btn-refrescar-historial`)?.addEventListener(`click`,x),await x()}async function x(){let e=document.getElementById(`lista-pedidos-historial`),n=document.getElementById(`stat-total-pedidos`),r=document.getElementById(`stat-total-monto`);e.innerHTML=`<p class="text-slate-400 text-center py-12 text-sm">Cargando pedidos...</p>`;try{let i=await t(`/ventas`);if(n&&(n.textContent=`${i.length}`),i.length===0){e.innerHTML=`
        <div class="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400">
          <span class="text-4xl block mb-2">🧾</span>
          <p class="font-bold text-slate-700 text-sm">Aún no hay pedidos registrados.</p>
          <p class="text-xs text-slate-400 mt-1">Realiza tu primera venta desde la pestaña "Venta".</p>
        </div>
      `,r&&(r.textContent=`$0.00`);return}let a=0;e.innerHTML=i.map(e=>{let t=Number(e.total)||0;a+=t;let n=Number(e.subtotal)||0,r=Number(e.iva)||0,i=new Date(e.created_at),o=isNaN(i.getTime())?`Fecha no disponible`:i.toLocaleDateString(`es-EC`,{day:`2-digit`,month:`short`,year:`numeric`,hour:`2-digit`,minute:`2-digit`}),s={efectivo:`💵 Efectivo`,transferencia:`📱 Transferencia`,tarjeta:`💳 Tarjeta`,credito:`📝 Crédito`}[e.metodo_pago]||e.metodo_pago;return`
          <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-black text-blue-900 text-sm sm:text-base font-mono">Pedido #${e.id}</span>
                <span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full capitalize">
                  ${e.estado||`Pagado`}
                </span>
                <span class="text-xs text-slate-400 font-medium">| ${o}</span>
              </div>

              <div class="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5">
                <span>👤 Cliente: <strong class="text-slate-800">${e.cliente?.nombre||`Consumidor Final`}</strong></span>
                <span>🏢 Sucursal: <strong class="text-slate-800">${e.sucursal?.nombre||`Matriz`}</strong></span>
                <span class="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">${s}</span>
              </div>
            </div>

            <div class="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span class="text-[11px] text-slate-400">Total Factura:</span>
              <span class="text-lg sm:text-xl font-black text-emerald-600">$${t.toFixed(2)}</span>
              <span class="text-[10px] text-slate-400 hidden sm:block">Sub: $${n.toFixed(2)} + IVA: $${r.toFixed(2)}</span>
            </div>
          </div>
        `}).join(``),r&&(r.textContent=`$${a.toFixed(2)}`)}catch(t){e.innerHTML=`<p class="text-red-500 text-center py-12 text-sm">${t.message||`Error al cargar el historial`}</p>`}}var S=[],C=1,w=`inventario`,T=[],E=[],D=``;async function O(e){let n=o();if(e.innerHTML=`
    <div class="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-6">
      ${c(`productos`)}

      <main class="max-w-6xl mx-auto w-full px-3 sm:px-6 py-4 flex-1">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>📦</span> Control de Inventario y Stock
            </h1>
            <p class="text-xs text-slate-500">Supervisión de existencias en sucursales y alertas de reabastecimiento.</p>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-600 hidden sm:inline">Sucursal:</span>
            <select id="inv-select-sucursal" class="bg-white border border-slate-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm">
              <option value="">Cargando...</option>
            </select>

            ${n.puedeCrearProductos?`
              <button 
                id="btn-inv-nuevo-prod" 
                class="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
                title="Registrar nuevo producto"
              >
                <span>➕</span>
                <span>Nuevo</span>
              </button>
            `:``}
          </div>
        </div>

        <!-- Pestañas de Navegación -->
        <div class="flex items-center space-x-2 border-b border-slate-200 mb-4 bg-white p-1 rounded-xl shadow-sm">
          <button 
            id="tab-inv-general" 
            class="flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition text-center flex justify-center items-center gap-2 ${w===`inventario`?`bg-blue-800 text-white shadow`:`text-slate-600 hover:bg-slate-100`}"
          >
            <span>📋 Existencias en Sucursal</span>
            <span id="badge-total-stock" class="text-[10px] bg-blue-900/60 text-white px-2 py-0.5 rounded-full font-bold">0</span>
          </button>

          ${n.puedeVerStockBajo?`
            <button 
              id="tab-inv-alertas" 
              class="flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition text-center flex justify-center items-center gap-2 ${w===`alertas`?`bg-red-700 text-white shadow`:`text-slate-600 hover:bg-slate-100`}"
            >
              <span>⚠️ Alertas de Stock Bajo</span>
              <span id="badge-total-alertas" class="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black">0</span>
            </button>
          `:``}
        </div>

        <!-- Buscador -->
        <div class="relative mb-4">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm">🔍</span>
          <input 
            type="text" 
            id="inv-buscar-input" 
            placeholder="Buscar por nombre o código de producto..." 
            class="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
        </div>

        <!-- Contenedor dinámico de datos -->
        <div id="contenedor-vista-inventario" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <p class="text-slate-400 text-center py-12 col-span-full text-sm">Cargando información...</p>
        </div>

      </main>

      ${n.puedeCrearProductos?l():``}
    </div>
  `,n.puedeCrearProductos){let e=u(async()=>{await k()});document.getElementById(`btn-inv-nuevo-prod`)?.addEventListener(`click`,()=>{e.abrirModal(C)})}let r=document.getElementById(`tab-inv-general`);r.addEventListener(`click`,()=>{w=`inventario`,r.className=`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition text-center flex justify-center items-center gap-2 bg-blue-800 text-white shadow`;let e=document.getElementById(`tab-inv-alertas`);e&&(e.className=`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition text-center flex justify-center items-center gap-2 text-slate-600 hover:bg-slate-100`),A()});let i=document.getElementById(`tab-inv-alertas`);i&&i.addEventListener(`click`,()=>{w=`alertas`,i.className=`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition text-center flex justify-center items-center gap-2 bg-red-700 text-white shadow`,r.className=`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition text-center flex justify-center items-center gap-2 text-slate-600 hover:bg-slate-100`,A()}),document.getElementById(`inv-buscar-input`).addEventListener(`input`,e=>{D=e.target.value.toLowerCase(),A()});try{S=await t(`/sucursales`);let e=document.getElementById(`inv-select-sucursal`);e.innerHTML=S.map(e=>`<option value="${e.id}" ${e.id===C?`selected`:``}>${e.nombre}</option>`).join(``),e.addEventListener(`change`,async()=>{C=Number(e.value),await k()}),S.length>0&&!C&&(C=S[0].id)}catch(e){console.error(`Error cargando sucursales:`,e)}await k()}async function k(){let e=document.getElementById(`contenedor-vista-inventario`),n=o();e&&(e.innerHTML=`<p class="text-slate-400 text-center py-12 col-span-full text-sm">Actualizando datos...</p>`);try{let e=[t(`/inventario?sucursal_id=${C}`)];n.puedeVerStockBajo&&e.push(t(`/inventario/stock-bajo`));let[r,i=[]]=await Promise.all(e);T=r.map(e=>({id:e.id,producto_id:e.producto_id,sucursal_id:e.sucursal_id,stock:Number(e.stock),stock_minimo:Number(e.stock_minimo),nombre:e.nombre||e.producto?.nombre||`Producto #${e.producto_id}`,precio_venta:Number(e.precio_venta||e.producto?.precio_venta||0),codigo:e.codigo||e.producto?.codigo||``})),E=i.map(e=>({id:e.id,producto_id:e.producto_id,codigo:e.codigo||``,nombre:e.producto_nombre||e.nombre||`Producto #${e.producto_id}`,sucursal_id:e.sucursal_id,sucursal_nombre:e.sucursal_nombre||`Sucursal #${e.sucursal_id}`,stock:Number(e.stock),stock_minimo:Number(e.stock_minimo),faltante:Number(e.faltante||Math.max(0,e.stock_minimo-e.stock))}));let a=document.getElementById(`badge-total-stock`);a&&(a.textContent=`${T.length}`);let o=document.getElementById(`badge-total-alertas`);o&&(o.textContent=`${E.length}`),A()}catch(t){e&&(e.innerHTML=`<p class="text-red-500 text-center py-12 col-span-full text-sm">${t.message||`Error cargando datos de inventario`}</p>`)}}function A(){let e=document.getElementById(`contenedor-vista-inventario`),t=o();if(e){if(w===`inventario`||!t.puedeVerStockBajo){let t=T.filter(e=>e.nombre.toLowerCase().includes(D)||e.codigo?.toLowerCase().includes(D));if(t.length===0){e.innerHTML=`<div class="bg-white p-8 rounded-2xl border border-slate-200 text-center col-span-full text-slate-400 text-sm">No se encontraron productos en esta sucursal.</div>`;return}e.innerHTML=t.map(e=>{let t=`<span class="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Óptimo</span>`,n=`border-slate-200`;return e.stock<=e.stock_minimo?(t=`<span class="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Crítico</span>`,n=`border-red-300 bg-red-50/20`):e.stock<=e.stock_minimo*1.5&&(t=`<span class="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Ajustado</span>`,n=`border-amber-300`),`
          <div class="bg-white p-4 rounded-2xl shadow-sm border ${n} flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">${e.codigo||`S/C`}</span>
                ${t}
              </div>
              <h3 class="font-bold text-slate-800 text-sm leading-snug">${e.nombre}</h3>
              <p class="text-xs text-slate-500 mt-1">
                Precio Venta: <strong class="text-slate-800 font-extrabold">$${e.precio_venta.toFixed(2)}</strong>
              </p>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span class="text-slate-500">Stock Actual:</span>
                <span class="font-black text-sm ml-1 ${e.stock<=e.stock_minimo?`text-red-600`:`text-slate-800`}">${e.stock}</span>
              </div>
              <div class="text-right">
                <span class="text-slate-400 text-[11px]">Mínimo:</span>
                <span class="font-semibold text-slate-600 ml-0.5">${e.stock_minimo}</span>
              </div>
            </div>
          </div>
        `}).join(``)}else{let t=E.filter(e=>e.nombre.toLowerCase().includes(D)||e.codigo?.toLowerCase().includes(D));if(t.length===0){e.innerHTML=`
        <div class="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center col-span-full">
          <span class="text-3xl block mb-2">🎉</span>
          <p class="font-bold text-emerald-900 text-sm">¡Todo el inventario está en orden!</p>
          <p class="text-xs text-emerald-700 mt-1">Todas las sucursales tienen stock por encima del nivel mínimo.</p>
        </div>
      `;return}e.innerHTML=t.map(e=>`
        <div class="bg-red-50 border border-red-200 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-1 mb-1">
              <span class="text-[10px] font-mono font-bold bg-red-100 text-red-800 px-1.5 py-0.5 rounded">${e.codigo||`S/C`}</span>
              <span class="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Stock Bajo</span>
            </div>
            <h3 class="font-bold text-red-950 text-sm leading-snug">${e.nombre}</h3>
            <p class="text-xs text-slate-600 mt-1 flex items-center gap-1">🏢 <strong>${e.sucursal_nombre}</strong></p>
          </div>
          <div class="mt-3 pt-2.5 border-t border-red-200 flex items-center justify-between text-xs">
            <div>
              <span class="text-slate-500">Stock:</span>
              <span class="font-black text-red-700 text-sm ml-1">${e.stock}</span>
              <span class="text-[11px] text-slate-400">(Mín: ${e.stock_minimo})</span>
            </div>
            <div class="bg-red-200 text-red-900 text-[11px] font-bold px-2 py-0.5 rounded">
              Faltan: ${e.faltante}
            </div>
          </div>
        </div>
      `).join(``)}}}var j={1:{texto:`Administrador`,color:`bg-amber-100 text-amber-900 border-amber-300`,icono:`👑`},2:{texto:`Vendedor`,color:`bg-blue-100 text-blue-900 border-blue-300`,icono:`💼`},3:{texto:`Bodeguero`,color:`bg-emerald-100 text-emerald-900 border-emerald-300`,icono:`📦`}},M=[],N=[],P=!1;async function F(e){o().puedeGestionarUsuarios?(I(e),await L()):e.innerHTML=`
      <div class="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-6">
        ${c(`usuarios`)}
        <main class="flex-1 flex items-center justify-center">
          <div class="text-center p-8">
            <span class="text-5xl block mb-3">🔒</span>
            <h2 class="text-xl font-black text-slate-700">Acceso Restringido</h2>
            <p class="text-slate-500 text-sm mt-2">No tienes permiso para gestionar usuarios.</p>
          </div>
        </main>
      </div>
    `}function I(e){e.innerHTML=`
    <div class="min-h-screen bg-slate-100 flex flex-col pb-20 md:pb-6">
      ${c(`usuarios`)}

      <main class="max-w-5xl mx-auto w-full px-3 sm:px-6 py-4 flex-1">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <span>👥</span> Gestión de Empleados
            </h1>
            <p class="text-xs text-slate-500">Administra las cuentas de acceso del sistema.</p>
          </div>

          <button
            id="btn-toggle-form"
            class="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <span id="icon-toggle-form">➕</span>
            <span id="texto-toggle-form">Nuevo Empleado</span>
          </button>
        </div>

        <!-- Formulario de Nuevo Usuario (inicialmente oculto) -->
        <div id="panel-form-usuario" class="hidden mb-4">
          <div class="bg-white rounded-2xl shadow-sm border border-blue-200 p-5">
            <h2 class="font-black text-slate-800 text-base mb-3 flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-blue-700 text-white flex items-center justify-center text-sm">➕</span>
              Registrar Nuevo Empleado
            </h2>

            <div id="form-usuario-error" class="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-xl text-xs mb-3 hidden"></div>

            <form id="form-nuevo-usuario" class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">

              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  id="usr-nombre"
                  class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Ej. Juan Pérez"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  id="usr-email"
                  class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="correo@empresa.com"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Contraseña *</label>
                <input
                  type="password"
                  id="usr-password"
                  class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Mínimo 6 caracteres"
                  minlength="6"
                  required
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Rol *</label>
                <select
                  id="usr-rol"
                  class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="2">💼 Vendedor</option>
                  <option value="3">📦 Bodeguero</option>
                  <option value="1">👑 Administrador</option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Sucursal Asignada</label>
                <select
                  id="usr-sucursal"
                  class="w-full bg-slate-50 border border-slate-300 px-3 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">Sin sucursal específica</option>
                </select>
              </div>

              <div class="sm:col-span-2 flex gap-3 pt-1">
                <button
                  type="button"
                  id="btn-cancelar-form"
                  class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-sm transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-guardar-usuario"
                  class="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition active:scale-[0.99] flex justify-center items-center gap-2"
                >
                  <span>Guardar Empleado</span>
                  <span>💾</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Tabla / Lista de usuarios -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Empleados registrados</span>
            <span id="badge-total-usuarios" class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">0 usuarios</span>
          </div>
          <div id="lista-usuarios" class="p-4">
            <p class="text-slate-400 text-center py-10 text-sm">Cargando empleados...</p>
          </div>
        </div>

      </main>
    </div>
  `;let t=document.getElementById(`btn-toggle-form`),n=document.getElementById(`panel-form-usuario`),r=document.getElementById(`btn-cancelar-form`);t.addEventListener(`click`,()=>{P=!P,n.classList.toggle(`hidden`,!P),document.getElementById(`icon-toggle-form`).textContent=P?`✕`:`➕`,document.getElementById(`texto-toggle-form`).textContent=P?`Cancelar`:`Nuevo Empleado`}),r.addEventListener(`click`,()=>{P=!1,n.classList.add(`hidden`),document.getElementById(`icon-toggle-form`).textContent=`➕`,document.getElementById(`texto-toggle-form`).textContent=`Nuevo Empleado`}),document.getElementById(`form-nuevo-usuario`).addEventListener(`submit`,z)}async function L(){try{let[e,n]=await Promise.all([t(`/usuarios`),t(`/sucursales`)]);M=e,N=n;let r=document.getElementById(`usr-sucursal`);r&&N.length>0&&(r.innerHTML=`
        <option value="">Sin sucursal específica</option>
        ${N.map(e=>`<option value="${e.id}">${e.nombre}</option>`).join(``)}
      `),R()}catch(e){let t=document.getElementById(`lista-usuarios`);t&&(t.innerHTML=`<p class="text-red-500 text-center py-8 text-sm">${e.message||`Error al cargar empleados`}</p>`)}}function R(){let e=document.getElementById(`lista-usuarios`),t=document.getElementById(`badge-total-usuarios`);t&&(t.textContent=`${M.length} usuarios`),e.innerHTML=M.length===0?`
      <div class="text-center py-12 text-slate-400">
        <span class="text-4xl block mb-2">👤</span>
        <p class="text-sm font-semibold">No hay empleados registrados.</p>
        <p class="text-xs mt-1">Usa el botón "Nuevo Empleado" para agregar uno.</p>
      </div>
    `:`
    <div class="space-y-2">
      ${M.map(e=>{let t=j[e.rol_id]??{texto:`Desconocido`,color:`bg-slate-100 text-slate-700 border-slate-300`,icono:`❓`},n=N.find(t=>t.id===e.sucursal_id);return`
          <div class="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition">
            <!-- Avatar -->
            <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg flex-shrink-0">
              ${e.nombre.charAt(0).toUpperCase()}
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="font-bold text-slate-800 text-sm truncate">${e.nombre}</p>
              <p class="text-xs text-slate-500 truncate">${e.email}</p>
              ${n?`<p class="text-[11px] text-slate-400 mt-0.5">🏢 ${n.nombre}</p>`:``}
            </div>

            <!-- Badge de rol -->
            <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${t.color}">
                ${t.icono} ${t.texto}
              </span>
              <span class="text-[10px] font-semibold ${e.activo?`text-emerald-600`:`text-slate-400`}">
                ${e.activo?`● Activo`:`○ Inactivo`}
              </span>
            </div>
          </div>
        `}).join(``)}
    </div>
  `}async function z(e){e.preventDefault();let n=document.getElementById(`form-usuario-error`),r=document.getElementById(`btn-guardar-usuario`),i=document.getElementById(`usr-nombre`).value.trim(),a=document.getElementById(`usr-email`).value.trim(),o=document.getElementById(`usr-password`).value,s=Number(document.getElementById(`usr-rol`).value),c=document.getElementById(`usr-sucursal`).value?Number(document.getElementById(`usr-sucursal`).value):void 0;if(n.classList.add(`hidden`),!i||!a||!o)n.textContent=`Todos los campos obligatorios deben completarse.`,n.classList.remove(`hidden`);else{r.disabled=!0,r.innerHTML=`<span>Guardando...</span>`;try{await t(`/usuarios`,{method:`POST`,body:JSON.stringify({nombre:i,email:a,password:o,rol_id:s,sucursal_id:c})}),alert(`✅ Empleado "${i}" registrado correctamente.`),document.getElementById(`form-nuevo-usuario`).reset(),P=!1,document.getElementById(`panel-form-usuario`).classList.add(`hidden`),document.getElementById(`icon-toggle-form`).textContent=`➕`,document.getElementById(`texto-toggle-form`).textContent=`Nuevo Empleado`,await L()}catch(e){n.textContent=e.message||`Error al guardar el empleado.`,n.classList.remove(`hidden`)}finally{r.disabled=!1,r.innerHTML=`<span>Guardar Empleado</span> <span>💾</span>`}}}function B(e){let t=document.getElementById(`app`);if(!t)return;let n=localStorage.getItem(`token`);if(!n&&e!==`login`){s(t);return}let r=o();if(n&&e===`login`)B(r.vistaDefault);else if(n&&e!==`login`&&(e===`ventas`&&!r.verNavVentas||e===`historial`&&!r.verNavHistorial||e===`productos`&&!r.verNavProductos||e===`usuarios`&&!r.verNavUsuarios))B(r.vistaDefault);else switch(window.scrollTo({top:0,behavior:`smooth`}),e){case`login`:s(t);break;case`ventas`:h(t);break;case`historial`:b(t);break;case`productos`:O(t);break;case`usuarios`:F(t)}}window.cambiarVista=B,window.cerrarSesion=()=>{i(),B(`login`)},document.addEventListener(`DOMContentLoaded`,()=>{localStorage.getItem(`token`)?B(o().vistaDefault):B(`login`)});