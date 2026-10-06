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

// Estado actual del dashboard e Historial permanente
let estadoDashboard =
  JSON.parse(localStorage.getItem("dashboardCigarrosData")) || {};
let registroHistorico =
  JSON.parse(localStorage.getItem("historialMovimientosCigarros")) || [];

// Inicializar marcas vacías si no existen en la memoria
for (const clave in MARCAS_CONFIG) {
  if (!estadoDashboard[clave]) {
    estadoDashboard[clave] = {
      cajetillasInv: 0,
      cajetillasVen: 0,
      sueltosInv: 0,
      sueltosVen: 0,
    };
  }
}

// ==========================================
// 2. EVENTO DE ARRANQUE E INTERFAZ
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Iniciar reloj dinámico cada segundo
  actualizarTiempo();
  setInterval(actualizarTiempo, 1000);

  // Crear la estructura de tarjetas en el tablero
  const contenedor = document.getElementById("dashboard-marcas");
  if (contenedor) {
    contenedor.innerHTML = Object.keys(MARCAS_CONFIG)
      .map(
        (clave) => `
            <div class="tarjeta-marca">
                <h2 class="titulo-marca">${MARCAS_CONFIG[clave]}</h2>
                <div class="tarjeta-marca-contenido">
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
        `,
      )
      .join("");
  }

  actualizarPantallaVisual();
  mostrarHistorialEnTabla();
});

// ==========================================
// 3. LÓGICA DE AUDITORÍA Y CÁLCULO
// ==========================================
function calcularInventarioCierre() {
  const marca = document.getElementById("seleccionar-marca").value;

  const inicialCajetillas =
    parseInt(document.getElementById("inicial-cajetillas").value) || 0;
  const inicialSueltos =
    parseInt(document.getElementById("inicial-sueltos").value) || 0;
  const cajetillasRestantesContadas =
    parseInt(document.getElementById("inventario-cajetillas").value) || 0;
  const sueltosRestantesContados =
    parseInt(document.getElementById("sueltos-restantes").value) || 0;

  const totalCigarrosMañana =
    inicialCajetillas * CIGARROS_POR_CAJETILLA + inicialSueltos;
  const totalCigarrosNoche =
    cajetillasRestantesContadas * CIGARROS_POR_CAJETILLA +
    sueltosRestantesContados;
  const totalCigarrosVendidos = totalCigarrosMañana - totalCigarrosNoche;

  if (totalCigarrosVendidos < 0) {
    alert(
      "¡Error en el conteo! Hay más producto en la noche del que ingresó en la mañana.",
    );
    return;
  }

  const cajetillasVendidasCalculadas = Math.floor(
    totalCigarrosVendidos / CIGARROS_POR_CAJETILLA,
  );
  const sueltosVendidosCalculados =
    totalCigarrosVendidos % CIGARROS_POR_CAJETILLA;

  // Guardar en las variables globales
  estadoDashboard[marca] = {
    cajetillasInv: cajetillasRestantesContadas,
    cajetillasVen: cajetillasVendidasCalculadas,
    sueltosInv: sueltosRestantesContados,
    sueltosVen: sueltosVendidosCalculados,
  };

  // Añadir fila al historial acumulativo
  const ahora = new Date();
  const tiempoMarcado = `${ahora.toLocaleDateString("es-MX")} | ${ahora.toLocaleTimeString("es-MX", { hour12: false })}`;

  registroHistorico.unshift({
    fecha: tiempoMarcado,
    nombre: MARCAS_CONFIG[marca],
    inicial: `${inicialCajetillas}c / ${inicialSueltos}s`,
    final: `${cajetillasRestantesContadas}c / ${sueltosRestantesContados}s`,
    cajetillasV: cajetillasVendidasCalculadas,
    sueltosV: sueltosVendidosCalculados,
  });

  // Guardar en la base de datos del navegador
  localStorage.setItem(
    "dashboardCigarrosData",
    JSON.stringify(estadoDashboard),
  );
  localStorage.setItem(
    "historialMovimientosCigarros",
    JSON.stringify(registroHistorico),
  );

  actualizarPantallaVisual();
  mostrarHistorialEnTabla();

  // Limpiar formulario de captura
  document.getElementById("inicial-cajetillas").value = 0;
  document.getElementById("inicial-sueltos").value = 0;
  document.getElementById("inventario-cajetillas").value = 0;
  document.getElementById("sueltos-restantes").value = 0;
}

// ==========================================
// 4. AUXILIARES DE RENDERIZADO VISUAL
// ==========================================
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

function mostrarHistorialEnTabla() {
  const tbody = document.getElementById("lista-historial-filas");
  if (!tbody) return;
  tbody.innerHTML = registroHistorico
    .map(
      (mov) => `
        <tr>
            <td style="font-family: monospace; font-size:13px;">${mov.fecha}</td>
            <td style="font-weight: 600;">${mov.nombre}</td>
            <td>${mov.inicial}</td>
            <td>${mov.final}</td>
            <td style="color:#a45a3c; font-weight:bold;">${mov.cajetillasV}</td>
            <td style="color:#a45a3c; font-weight:bold;">${mov.sueltosV}</td>
        </tr>
    `,
    )
    .join("");
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

  if (document.getElementById("fecha-actual")) {
    document.getElementById("fecha-actual").innerText = fechaTexto;
    document.getElementById("hora-actual").innerText = ahora.toLocaleTimeString(
      "es-MX",
      { hour12: false },
    );
  }
}

function borrarHistorialPermanente() {
  if (
    confirm(
      "¿Está seguro de que desea borrar todos los registros históricos? Esta acción no se puede deshacer.",
    )
  ) {
    registroHistorico = [];
    localStorage.removeItem("historialMovimientosCigarros");
    mostrarHistorialEnTabla();
  }
}

function generarReporteDelDia() {
  const ahora = new Date();
  const fechaTexto = ahora.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let contenidoReporte = `=========================================\n`;
  contenidoReporte += `       REPORTE DE MOVIMIENTOS DEL DÍA    \n`;
  contenidoReporte += `=========================================\n`;
  contenidoReporte += `Fecha: ${fechaTexto}\n\n`;

  let huboMovimientos = false;
  for (const clave in MARCAS_CONFIG) {
    const data = estadoDashboard[clave] || {
      cajetillasInv: 0,
      cajetillasVen: 0,
      sueltosInv: 0,
      sueltosVen: 0,
    };
    if (data.cajetillasVen > 0 || data.sueltosVen > 0) {
      huboMovimientos = true;
      contenidoReporte += `📌 MARCA: ${MARCAS_CONFIG[clave]}\n`;
      contenidoReporte += `   - Cajetillas Vendidas: ${data.cajetillasVen}\n`;
      contenidoReporte += `   - Cigarros Sueltos Vendidos: ${data.sueltosVen}\n`;
      contenidoReporte += `   - STOCK ACTUAL: ${data.cajetillasInv}c y ${data.sueltosInv}s\n`;
      contenidoReporte += `-----------------------------------------\n`;
    }
  }

  if (!huboMovimientos)
    contenidoReporte += `No se registraron ventas el día de hoy.\n`;

  const blob = new Blob([contenidoReporte], {
    type: "text/plain;charset=utf-8",
  });
  const enlaceDescarga = document.createElement("a");
  enlaceDescarga.href = URL.createObjectURL(blob);
  enlaceDescarga.download = `Reporte_${fechaTexto.replace(/ /g, "_")}.txt`;
  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();
  document.body.removeChild(enlaceDescarga);
}
