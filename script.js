// ==========================================
// 1. CONFIGURACIÓN DE LAS 13 MARCAS REALES
// ==========================================
const MARCAS_CONFIG = {
  "marlboro-clavo": "Marlboro Clavo",
  "marlboro-rojo": "Marlboro Rojo",
  "marlboro-blossom": "Marlboro Blossom Mix",
  "marlboro-velvet": "Marlboro Fusion Velvet",
  "marlboro-ruby": "Marlboro Ruby",
  "marlboro-garden": "Marlboro Garden Fusion",
  "marlboro-ice": "Marlboro Ice Mix",
  "marlboro-capsula": "Marlboro Cápsula",
  "marlboro-summer": "Marlboro Summer Mix",
  "marlboro-ruby-mix": "Marlboro Ruby Mix",
  "baronet-20": "Baronet 20",
  "baronet-25": "Baronet 25",
  boots: "Boots",
};

const CIGARROS_POR_CAJETILLA = 20;

// Inventario inicial fijo de la mañana para control de deducción (10 cajetillas y 5 sueltos base)
const inventarioInicial = {};
for (const clave in MARCAS_CONFIG) {
  inventarioInicial[clave] = { cajetillas: 10, sueltos: 5 };
}

// Intentar cargar datos previos guardados en el almacenamiento del navegador
let estadoDashboard = JSON.parse(localStorage.getItem("dashboardCigarrosData"));

if (!estadoDashboard) {
  estadoDashboard = {};
  for (const clave in MARCAS_CONFIG) {
    estadoDashboard[clave] = {
      cajetillasInv: 10,
      cajetillasVen: 0,
      sueltosInv: 5,
      sueltosVen: 0,
    };
  }
}

// ==========================================
// 2. CONTROL DE EVENTO DE ARRANQUE (UX)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  iniciarReloj();
  crearTarjetasEnPantalla();
  actualizarPantallaVisual();
});

// ==========================================
// 3. GENERADOR DINÁMICO DE TARJETAS HTML
// ==========================================
function crearTarjetasEnPantalla() {
  const contenedor = document.getElementById("dashboard-marcas");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  for (const clave in MARCAS_CONFIG) {
    const nombreLegible = MARCAS_CONFIG[clave];
    const tarjetaHTML = `
            <div class="tarjeta-marca">
                <h2 class="titulo-marca">${nombreLegible}</h2>
                <div class="tarjeta-marca-contenido">
                    
                    <!-- Bloque de Cajetillas (Izquierda con Relieve) -->
                    <div class="sub-seccion bloque-cajetillas">
                        <div class="bloque-valor">
                            <span class="numero-grande" id="cajetillas-inv-${clave}">0</span>
                            <span class="etiqueta-chica">Cajetillas en Inv.</span>
                        </div>
                        <div class="bloque-valor divider">
                            <span class="numero-grande color-venda" id="cajetillas-ven-${clave}">0</span>
                            <span class="etiqueta-chica">Vendidas</span>
                        </div>
                    </div>

                    <!-- Bloque de Sueltos (Derecha Plano Contrastante) -->
                    <div class="sub-seccion bloque-sueltos">
                        <div class="bloque-valor">
                            <span class="numero-grande" id="sueltos-inv-${clave}">0</span>
                            <span class="etiqueta-chica">Cigarros Sueltos</span>
                        </div>
                        <div class="bloque-valor divider">
                            <span class="numero-grande color-venda" id="sueltos-ven-${clave}">0</span>
                            <span class="etiqueta-chica">Vendidos</span>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
    contenedor.innerHTML += tarjetaHTML;
  }
}

// ==========================================
// 4. LÓGICA MATEMÁTICA BASADA EN CONTEO FÍSICO
// ==========================================
function calcularInventarioCierre() {
  const marca = document.getElementById("seleccionar-marca").value;

  // Captura de lo que se contó físicamente al cierre del día
  const cajetillasRestantesContadas =
    parseInt(document.getElementById("inventario-cajetillas").value) || 0;
  const sueltosRestantesContados =
    parseInt(document.getElementById("sueltos-restantes").value) || 0;

  const inicialCajetillas = inventarioInicial[marca].cajetillas;
  const inicialSueltos = inventarioInicial[marca].sueltos;

  // --- CÁLCULO DEDUCTIVO POR CONVERSIONES ---
  // 1. Convertimos todo el stock de la mañana a cigarros sueltos totales
  const totalCigarrosMañana =
    inicialCajetillas * CIGARROS_POR_CAJETILLA + inicialSueltos;

  // 2. Convertimos todo el stock que se contó en la noche a cigarros sueltos totales
  const totalCigarrosNoche =
    cajetillasRestantesContadas * CIGARROS_POR_CAJETILLA +
    sueltosRestantesContados;

  // 3. La diferencia absoluta es el total de cigarros vendidos en el día
  const totalCigarrosVendidos = totalCigarrosMañana - totalCigarrosNoche;

  if (totalCigarrosVendidos < 0) {
    alert(
      "¡Error en el conteo! Hay más producto registrado en la noche del que había en la mañana.",
    );
    return;
  }

  // 4. DEDUCIR CUÁNTAS CAJETILLAS ENTERAS Y CUÁNTOS SUELTOS SE VENDIERON
  // Las cajetillas vendidas se obtienen dividiendo el total vendido entre 20
  const cajetillasVendidasCalculadas = Math.floor(
    totalCigarrosVendidos / CIGARROS_POR_CAJETILLA,
  );
  // El sobrante de esa división son los cigarros sueltos individuales vendidos
  const sueltosVendidosCalculados =
    totalCigarrosVendidos % CIGARROS_POR_CAJETILLA;

  // Guardar los nuevos valores en nuestro estado del Dashboard
  estadoDashboard[marca].cajetillasInv = cajetillasRestantesContadas;
  estadoDashboard[marca].cajetillasVen = cajetillasVendidasCalculadas;
  estadoDashboard[marca].sueltosInv = sueltosRestantesContados;
  estadoDashboard[marca].sueltosVen = sueltosVendidosCalculados;

  // Guardado persistente local en el navegador
  localStorage.setItem(
    "dashboardCigarrosData",
    JSON.stringify(estadoDashboard),
  );

  actualizarPantallaVisual();

  // Limpiar el formulario de captura
  document.getElementById("inventario-cajetillas").value = 0;
  document.getElementById("sueltos-restantes").value = 0;
}

function actualizarPantallaVisual() {
  for (const marca in estadoDashboard) {
    const data = estadoDashboard[marca];

    if (document.getElementById(`cajetillas-inv-${marca}`)) {
      document.getElementById(`cajetillas-inv-${marca}`).innerText =
        data.cajetillasInv;
      document.getElementById(`cajetillas-ven-${marca}`).innerText =
        data.cajetillasVen;
      document.getElementById(`sueltos-inv-${marca}`).innerText =
        data.sueltosInv;
      document.getElementById(`sueltos-ven-${marca}`).innerText =
        data.sueltosVen;
    }
  }
}

// ==========================================
// 5. RELOJ DIGITAL Y FECHA EN TIEMPO REAL
// ==========================================
function iniciarReloj() {
  actualizarTiempo();
  setInterval(actualizarTiempo, 1000);
}

function actualizarTiempo() {
  const ahora = new Date();
  const opcionesFecha = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let fechaTexto = ahora.toLocaleDateString("es-MX", opcionesFecha);
  fechaTexto = fechaTexto.charAt(0).toUpperCase() + fechaTexto.slice(1);
  const horaTexto = ahora.toLocaleTimeString("es-MX", { hour12: false });

  if (document.getElementById("fecha-actual")) {
    document.getElementById("fecha-actual").innerText = fechaTexto;
    document.getElementById("hora-actual").innerText = horaTexto;
  }
}
// ==========================================
// 6. GENERACIÓN DE REPORTE DEL DÍA CORREGIDO
// ==========================================
function generarReporteDelDia() {
  const ahora = new Date();
  const opcionesFecha = { year: "numeric", month: "long", day: "numeric" };
  const fechaTexto = ahora.toLocaleDateString("es-MX", opcionesFecha);
  const horaTexto = ahora.toLocaleTimeString("es-MX", { hour12: false });

  let contenidoReporte = `=========================================\n`;
  contenidoReporte += `       REPORTE DE MOVIMIENTOS DEL DÍA    \n`;
  contenidoReporte += `=========================================\n`;
  contenidoReporte += `Fecha: ${fechaTexto}\n`;
  contenidoReporte += `Hora de Corte: ${horaTexto}\n`;
  contenidoReporte += `-----------------------------------------\n\n`;

  let huboMovimientos = false;

  // Recorremos las 13 marcas configuradas
  for (const clave in MARCAS_CONFIG) {
    const nombreMarca = MARCAS_CONFIG[clave];

    // CORRECCIÓN PROTECTORA: Si el estado de la marca no existe en la memoria local,
    // le creamos una plantilla vacía temporal con ceros para que no truene el código.
    const data = estadoDashboard[clave] || {
      cajetillasInv: 10,
      cajetillasVen: 0,
      sueltosInv: 5,
      sueltosVen: 0,
    };

    // Evaluamos los movimientos usando la variable segura "data"
    if (data.cajetillasVen > 0 || data.sueltosVen > 0) {
      huboMovimientos = true;
      contenidoReporte += `📌 MARCA: ${nombreMarca}\n`;
      contenidoReporte += `   - Cajetillas Vendidas: ${data.cajetillasVen}\n`;
      contenidoReporte += `   - Cigarros Sueltos Vendidos: ${data.sueltosVen}\n`;
      contenidoReporte += `   - STOCK ACTUAL EN TIENDA: ${data.cajetillasInv} Cajetillas y ${data.sueltosInv} Sueltos\n`;
      contenidoReporte += `-----------------------------------------\n`;
    }
  }

  if (!huboMovimientos) {
    contenidoReporte += `No se registraron ventas ni movimientos de inventario el día de hoy.\n`;
  }

  contenidoReporte += `\n=========================================\n`;
  contenidoReporte += `         Fin del Reporte - ¡Buen descanso! \n`;

  // OPERACIÓN DE DESCARGA AUTOMÁTICA
  const blob = new Blob([contenidoReporte], {
    type: "text/plain;charset=utf-8",
  });
  const enlaceDescarga = document.createElement("a");
  const nombreArchivo = `Reporte_Cigarros_${fechaTexto.replace(/ /g, "_")}.txt`;

  enlaceDescarga.href = URL.createObjectURL(blob);
  enlaceDescarga.download = nombreArchivo;

  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();
  document.body.removeChild(enlaceDescarga);
}
