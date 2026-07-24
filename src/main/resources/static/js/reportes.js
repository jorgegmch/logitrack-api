/*
reportes.js - Detalle tabular del reporte de resumen general
(stock por bodega y productos mas movidos). Accesible para cualquier
usuario autenticado. Los graficos resumidos ya viven en el dashboard;
aqui se muestran las tablas completas para consulta analitica.
*/

function mostrarErrorReportes(mensaje) {
    const alerta = document.getElementById('reportesAlert');
    alerta.textContent = mensaje;
    alerta.classList.add('show');
}

function renderizarTablaStockBodega(datos) {
    const tbody = document.getElementById('tablaStockBodega');
    tbody.innerHTML = '';

    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="empty-state">Sin datos</td></tr>';
        return;
    }

    datos.forEach((item) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${item.nombreBodega}</td><td>${item.stockTotal}</td>`;
        tbody.appendChild(fila);
    });
}

function renderizarTablaProductosMovidos(datos) {
    const tbody = document.getElementById('tablaProductosMovidos');
    tbody.innerHTML = '';

    if (datos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="empty-state">Sin datos</td></tr>';
        return;
    }

    datos.forEach((item) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `<td>${item.nombreProducto}</td><td>${item.cantidadTotalMovida}</td>`;
        tbody.appendChild(fila);
    });
}

async function cargarReportes() {
    try {
        const resumen = await apiGet('/reportes/resumen');
        renderizarTablaStockBodega(resumen.stockTotalPorBodega);
        renderizarTablaProductosMovidos(resumen.productosMasMovidos);
    } catch (error) {
        mostrarErrorReportes(error.message);
    }
}

function inicializarReportes() {
    requerirAutenticacion();
    inicializarLayoutComun('reportes');
    cargarReportes();
}

document.addEventListener('DOMContentLoaded', inicializarReportes);