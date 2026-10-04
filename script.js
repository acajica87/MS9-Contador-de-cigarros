// Inventario Inicial de Control (La mañana)
const inventarioInicial = {
  "marlboro-rojo": { cajetillas: 10, sueltos: 5 },
  "pall-mall": { cajetillas: 10, sueltos: 5 },
  delicados: { cajetillas: 10, sueltos: 5 },
};

const CIGARROS_POR_CAJETILLA = 20;

// Estado actual del dashboard (Se almacena de forma persistente)
let estadoDashboard = JSON.parse(
  localStorage.getItem("dashboardCigarrosData"),
) || {
  "marlboro-rojo": {
    cajetillasInv: 10,
    cajetillasVen: 0,
    sueltosInv: 5,
    sueltosVen: 0,
  },
  "pall-mall": {
    cajetillasInv: 10,
    cajetillasVen: 0,
    sueltosInv: 5,
    sueltosVen: 0,
  },
  delicados: {
    cajetillasInv: 10,
    cajetillasVen: 0,
    sueltosInv: 5,
    sueltosVen: 0,
  },
};

document.addEventListener("DOMContentLoaded", () => {
  actualizarPantallaVisual();
});

function calcularInventarioCierre() {
  const marca = document.getElementById("seleccionar-marca").value;

  // Captura de datos ingresados
  const cajetillasVendidasLibreta =
    parseInt(document.getElementById("ventas-cajetillas").value) || 0;
  const sueltosRestantesContados =
    parseInt(document.getElementById("sueltos-restantes").value) || 0;

  // Valores fijos del inicio de la jornada
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
  // Convertimos todo lo inicial y final a unidades individuales para saber exactamente qué se vendió
  const totalCigarrosIniciales =
    inicialCajetillas * CIGARROS_POR_CAJETILLA + inicialSueltos;
  const totalCigarrosFinales =
    cajetillasQuedan * CIGARROS_POR_CAJETILLA + sueltosRestantesContados;

  const totalCigarrosVendidosEnElDia =
    totalCigarrosIniciales - totalCigarrosFinales;

  // De ese gran total vendido, le restamos lo que se vendió en cajetillas cerradas para aislar las unidades sueltas vendidas
  const sueltosVendidosCalculados =
    totalCigarrosVendidosEnElDia -
    cajetillasVendidasLibreta * CIGARROS_POR_CAJETILLA;

  // Validación por si hay un error de dedo en la captura
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

  // 5. PERSISTENCIA EN EL NAVEGADOR
  localStorage.setItem(
    "dashboardCigarrosData",
    JSON.stringify(estadoDashboard),
  );

  // Refrescar paneles visuales
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
