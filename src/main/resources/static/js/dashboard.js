/*
dashboard.js - Logica de la pantalla principal (resumen general).
*/

function mostrarErrorDashboard(mensaje) {
    const alerta = document.getElementById('dashboardAlert');
    alerta.textContent = mensaje;
    alerta.classList.add('show');
}

function badgeTipoMovimiento(tipo) {
    if (tipo === 'ENTRADA') {
        return '<span class="badge badge-success">ENTRADA</span>';
    }
    if (tipo === 'SALIDA') {
        return '<span class="badge badge-danger">SALIDA</span>';
    }
    return '<span class="badge badge-warning">TRANSFERENCIA</span>';
}

function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

function renderizarUltimosMovimientos(movimientos) {
    const tbody = document.getElementById('tablaUltimosMovimientos');
    tbody.innerHTML = '';

    if (movimientos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-state">No hay movimientos registrados</td></tr>';
        return;
    }

    const ordenados = [...movimientos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ultimosCinco = ordenados.slice(0, 5);

    ultimosCinco.forEach((movimiento) => {
        const fila = document.createElement('tr');
        const bodegaOrigen = movimiento.bodegaOrigenId ? movimiento.bodegaOrigenId.nombre : '—';
        const bodegaDestino = movimiento.bodegaDestinoId ? movimiento.bodegaDestinoId.nombre : '—';

        fila.innerHTML = `
            <td>${formatearFecha(movimiento.fecha)}</td>
            <td>${badgeTipoMovimiento(movimiento.tipo)}</td>
            <td>${movimiento.usuarioId.username}</td>
            <td>${bodegaOrigen}</td>
            <td>${bodegaDestino}</td>
        `;
        tbody.appendChild(fila);
    });
}

async function cargarDashboard() {
    try {
        const [productos, bodegas, stockBajo, movimientos] = await Promise.all([
            apiGet('/productos'),
            apiGet('/bodegas'),
            apiGet('/inventario/stock-bajo?limite=10'),
            apiGet('/movimientos'),
        ]);

        document.getElementById('statProductos').textContent = productos.length;
        document.getElementById('statBodegas').textContent = bodegas.length;
        document.getElementById('statStockBajo').textContent = stockBajo.length;
        document.getElementById('statMovimientos').textContent = movimientos.length;

        renderizarUltimosMovimientos(movimientos);
    } catch (error) {
        mostrarErrorDashboard(error.message);
    }
}

function inicializarDashboard() {
    requerirAutenticacion();
    inicializarLayoutComun('dashboard');
    cargarDashboard();
}

document.addEventListener('DOMContentLoaded', inicializarDashboard);