// CONFIGURACIÓN DE LAS 13 MARCAS REALES DEL NEGOCIO
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

// Generar el inventario inicial de la mañana para cada una (10 cajetillas y 5 sueltos de base)
const inventarioInicial = {};
for (const clave in MARCAS_CONFIG) {
  inventarioInicial[clave] = { cajetillas: 10, sueltos: 5 };
}

// Cargar datos previos o inicializar el estado del dashboard
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

// AL CARGAR LA PÁGINA: Crear las tarjetas HTML de forma dinámica y pintar los datos
document.addEventListener("DOMContentLoaded", () => {
  crearTarjetasEnPantalla();
  actualizarPantallaVisual();
});

// Función inteligente que dibuja las 13 tarjetas en el tablero automáticamente
function crearTarjetasEnPantalla() {
  const contenedor = document.getElementById("dashboard-marcas");
  contenedor.innerHTML = ""; // Limpiar

  for (const clave in MARCAS_CONFIG) {
    const nombreLegible = MARCAS_CONFIG[clave];

    const tarjetaHTML = `
            <div class="tarjeta-marca">
                <h2 class="titulo-marca">${nombreLegible}</h2>
                <div class="tarjeta-marca-contenido">
                    
                    <!-- Bloque de Cajetillas -->
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

                    <!-- Bloque de Sueltos -->
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

function calcularInventarioCierre() {
  const marca = document.getElementById("seleccionar-marca").value;
  const cajetillasVendidasLibreta =
    parseInt(document.getElementById("ventas-cajetillas").value) || 0;
  const sueltosRestantesContados =
    parseInt(document.getElementById("sueltos-restantes").value) || 0;

  const inicialCajetillas = inventarioInicial[marca].cajetillas;
  const inicialSueltos = inventarioInicial[marca].sueltos;

  // 1. DEDUCCIÓN AUTOMÁTICA DE APERTURA DE CAJETILLAS
  let cajetillasAbiertas = 0;
  if (sueltosRestantesContados > inicialSueltos) {
    const diferenciaSueltos = sueltosRestantesContados - inicialSueltos;
    cajetillasAbiertas = Math.ceil(diferenciaSueltos / CIGARROS_POR_CAJETILLA);
  }

  // 2. CÁLCULO DE CAJETILLAS FINALES EN INVENTARIO
  const cajetillasQuedan =
    inicialCajetillas - cajetillasVendidasLibreta - cajetillasAbiertas;

  // 3. CÁLCULO AUTOMÁTICO DE CIGARROS SUELTOS VENDIDOS
  const totalCigarrosIniciales =
    inicialCajetillas * CIGARROS_POR_CAJETILLA + inicialSueltos;
  const totalCigarrosFinales =
    cajetillasQuedan * CIGARROS_POR_CAJETILLA + sueltosRestantesContados;
  const totalCigarrosVendidosEnElDia =
    totalCigarrosIniciales - totalCigarrosFinales;
  const sueltosVendidosCalculados =
    totalCigarrosVendidosEnElDia -
    cajetillasVendidasLibreta * CIGARROS_POR_CAJETILLA;

  if (cajetillasQuedan < 0 || sueltosVendidosCalculados < 0) {
    alert(
      "¡Error en el conteo! Las ventas y el inventario restante superan el stock inicial.",
    );
    return;
  }

  // 4. GUARDAR RESULTADOS EN EL ESTADO
  estadoDashboard[marca].cajetillasInv = cajetillasQuedan;
  estadoDashboard[marca].cajetillasVen = cajetillasVendidasLibreta;
  estadoDashboard[marca].sueltosInv = sueltosRestantesContados;
  estadoDashboard[marca].sueltosVen = sueltosVendidosCalculados;

  // 5. PERSISTENCIA
  localStorage.setItem(
    "dashboardCigarrosData",
    JSON.stringify(estadoDashboard),
  );

  actualizarPantallaVisual();

  // Limpiar formulario
  document.getElementById("ventas-cajetillas").value = 0;
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
