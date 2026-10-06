// ==========================================
// 1. CONFIGURACIÓN DE LAS 14 MARCAS REALES
// ==========================================
const MARCAS_CONFIG = {
  camel: "Camel",
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

// Cargar bases de datos persistentes del navegador
let estadoDashboard =
  JSON.parse(localStorage.getItem("dashboardCigarrosData")) || {};
let registroHistorico =
  JSON.parse(localStorage.getItem("historialMovimientosCigarros")) || [];

// Asegurar inicialización limpia en 0 si no hay memoria previa
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

document.addEventListener("DOMContentLoaded", () => {
  iniciarReloj();
  crearTarjetasEnPantalla();
  actualizarPantallaVisual();
  mostrarHistorialEnTabla();
});

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
        `;
    contenedor.innerHTML += tarjetaHTML;
  }
}

// ==========================================
// 4. REGISTRO DE APERTURA (MAÑANA)
// ==========================================
function registrarAperturaMañana() {
  const marca = document.getElementById("seleccionar-marca").value;
  const inicialCajetillas =
    parseInt(document.getElementById("inicial-cajetillas").value) || 0;
  const inicialSueltos =
    parseInt(document.getElementById("inicial-sueltos").value) || 0;

  estadoDashboard[marca] = {
    cajetillasInv: inicialCajetillas,
    cajetillasVen: 0,
    sueltosInv: inicialSueltos,
    sueltosVen: 0,
  };

  localStorage.setItem(
    "dashboardCigarrosData",
    JSON.stringify(estadoDashboard),
  );
  actualizarPantallaVisual();

  document.getElementById("inicial-cajetillas").value = 0;
  document.getElementById("inicial-sueltos").value = 0;

  alert(`¡Inventario inicial cargado con éxito para ${MARCAS_CONFIG[marca]}!`);
}

// ==========================================
// 5. REGISTRO DE CIERRE (NOCHE)
// ==========================================
function calcularInventarioCierre() {
  const marca = document.getElementById("seleccionar-marca").value;
  const cajetillasRestantesContadas =
    parseInt(document.getElementById("inventario-cajetillas").value) || 0;
  const sueltosRestantesContados =
    parseInt(document.getElementById("sueltos-restantes").value) || 0;

  const inicialCajetillas = estadoDashboard[marca].cajetillasInv;
  const inicialSueltos = estadoDashboard[marca].sueltosInv;

  const totalCigarrosMañana =
    inicialCajetillas * CIGARROS_POR_CAJETILLA + inicialSueltos;
  const totalCigarrosNoche =
    cajetillasRestantesContadas * CIGARROS_POR_CAJETILLA +
    sueltosRestantesContados;
  const totalCigarrosVendidos = totalCigarrosMañana - totalCigarrosNoche;

  if (totalCigarrosVendidos < 0) {
    alert(
      "¡Error en el conteo! El inventario de la noche supera al registrado en la mañana.",
    );
    return;
  }

  const cajetillasVendidasCalculadas = Math.floor(
    totalCigarrosVendidos / CIGARROS_POR_CAJETILLA,
  );
  const sueltosVendidosCalculados =
    totalCigarrosVendidos % CIGARROS_POR_CAJETILLA;

  estadoDashboard[marca] = {
    cajetillasInv: cajetillasRestantesContadas,
    cajetillasVen: cajetillasVendidasCalculadas,
    sueltosInv: sueltosRestantesContados,
    sueltosVen: sueltosVendidosCalculados,
  };

  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, "0");
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const año = ahora.getFullYear();
  const tiempoMarcado = `${año}-${mes}-${dia} | ${ahora.toLocaleTimeString("es-MX", { hour12: false })}`;

  registroHistorico.unshift({
    fecha: tiempoMarcado,
    nombre: MARCAS_CONFIG[marca],
    inicial: `${inicialCajetillas}c / ${inicialSueltos}s`,
    final: `${cajetillasRestantesContadas}c / ${sueltosRestantesContados}s`,
    cajetillasV: cajetillasVendidasCalculadas,
    sueltosV: sueltosVendidosCalculados,
    fechaFiltro: `${año}-${mes}-${dia}`,
  });

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

  document.getElementById("inventario-cajetillas").value = 0;
  document.getElementById("sueltos-restantes").value = 0;
}

// ==========================================
// 6. SISTEMA DE FILTRADO AVANZADO
// ==========================================
function mostrarHistorialEnTabla() {
  const tbody = document.getElementById("lista-historial-filas");
  if (!tbody) return;

  const filtroFecha = document.getElementById("filtro-fecha").value;
  const filtroMarca = document.getElementById("filtro-marca").value;

  const registrosFiltrados = registroHistorico.filter((mov) => {
    const coincideFecha = !filtroFecha || mov.fechaFiltro === filtroFecha;
    const coincideMarca = filtroMarca === "todas" || mov.nombre === filtroMarca;
    return coincideFecha && coincideMarca;
  });

  tbody.innerHTML = "";
  for (let i = 0; i < registrosFiltrados.length; i++) {
    const mov = registrosFiltrados[i];
    tbody.innerHTML += `
            <tr>
                <td style="font-family: monospace; font-size:13px;">${mov.fecha}</td>
                <td style="font-weight: 600;">${mov.nombre}</td>
                <td>${mov.inicial}</td>
                <td>${mov.final}</td>
                <td style="color:#a45a3c; font-weight:bold;">${mov.cajetillasV}</td>
                <td style="color:#a45a3c; font-weight:bold;">${mov.sueltosV}</td>
            </tr>
        `;
  }
}

function limpiarFiltrosVisuales() {
  document.getElementById("filtro-fecha").value = "";
  document.getElementById("filtro-marca").value = "todas";
  mostrarHistorialEnTabla();
}

// ==========================================
// 7. IMPRESIÓN DE TICKET TÉRMICO (CORREGIDO)
// ==========================================
function imprimirTicketDelDia() {
  const ahora = new Date();
  const fechaTexto = ahora.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaTexto = ahora.toLocaleTimeString("es-MX", { hour12: false });
  const ventanaTicket = window.open("", "_blank", "width=350,height=600");

  let lineasProductos = "";
  let huboVentas = false;

  for (const clave in MARCAS_CONFIG) {
    const data = estadoDashboard[clave];
    if (data && (data.cajetillasVen > 0 || data.sueltosVen > 0)) {
      huboVentas = true;
      // CORRECCIÓN DE LA LÍNEA 234: Envolviendo el HTML con comillas invertidas ` de forma estricta
      lineasProductos += `
                <div class="ticket-linea-prod">
                    <strong>${MARCAS_CONFIG[clave]}</strong><br>
                    <span>  Vendidos: ${data.cajetillasVen}c / ${data.sueltosVen}s</span><br>
                    <span class="stock-ticket">  Stock: ${data.cajetillasInv}c / ${data.sueltosInv}s</span>
                </div>
                <div class="linea-puntos">--------------------------------</div>
            `;
    }
  }

  if (!huboVentas) lineasProductos = "<div>No se registraron ventas hoy.</div>";

  ventanaTicket.document.write(`
        <html>
        <head>
            <title>Ticket de Corte</title>
            <style>
                body { font-family: 'Courier New', monospace; width: 280px; margin: 0; padding: 10px; color: #000; font-size: 14px; }
                .text-center { text-align: center; }
                .titulo { font-size: 16px; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
.linea-puntos { border-bottom: 1px dashed #000; margin: 10px 0; }
.ticket-linea-prod { margin-bottom: 8px; line-height: 1.3; }
.stock-ticket { font-size: 12px; color: #444; }
@media print { body { margin: 0; } }



MINISUPER 9
CORTE DE CIGARROS
--------------------------------
FECHA: ${fechaTexto}
HORA : ${horaTexto}
--------------------------------
${lineasProductos}
¡CORTE EXITOSO!
Buen descanso.


`);
  ventanaTicket.document.close();
  ventanaTicket.focus();
  ventanaTicket.print();
  ventanaTicket.close();
}
// ==========================================
// 8. AUXILIARES VISUALES Y RELOJ
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
  if (document.getElementById("fecha-actual")) {
    document.getElementById("fecha-actual").innerText = fechaTexto;
    document.getElementById("hora-actual").innerText = ahora.toLocaleTimeString(
      "es-MX",
      { hour12: false },
    );
  }
}
