/*
auditorias.js - Consulta de auditoria (solo lectura). Pagina exclusiva ADMIN.
*/

let auditoriaSeleccionParaDetalle = [];

function mostrarErrorAuditorias(mensaje) {
    const alerta = document.getElementById('auditoriasAlert');
    alerta.textContent = mensaje;
    alerta.classList.add('show');
    setTimeout(() => alerta.classList.remove('show'), 5000);
}

function badgeTipoOperacion(tipo) {
    if (tipo === 'INSERT') {
        return '<span class="badge badge-success">INSERT</span>';
    }
    if (tipo === 'DELETE') {
        return '<span class="badge badge-danger">DELETE</span>';
    }
    return '<span class="badge badge-warning">UPDATE</span>';
}

function formatearFecha(fechaIso) {
    const fecha = new Date(fechaIso);
    return fecha.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
}

function formatearJson(texto) {
    if (!texto) {
        return '—';
    }
    try {
        return JSON.stringify(JSON.parse(texto), null, 2);
    } catch (error) {
        return texto;
    }
}

function renderizarTablaAuditorias(auditorias) {
    const tbody = document.getElementById('tablaAuditorias');
    tbody.innerHTML = '';

    if (auditorias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay registros de auditoría</td></tr>';
        return;
    }

    const ordenadas = [...auditorias].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

    ordenadas.forEach((auditoria) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${auditoria.idAuditoria}</td>
            <td>${formatearFecha(auditoria.fechaHora)}</td>
            <td>${badgeTipoOperacion(auditoria.tipoOperacion)}</td>
            <td>${auditoria.usuarioId.username}</td>
            <td>${auditoria.entidadAfectada}</td>
            <td><button class="btn btn-secondary btn-sm" data-id="${auditoria.idAuditoria}">Ver detalle</button></td>
        `;
        tbody.appendChild(fila);
    });

    tbody.querySelectorAll('button[data-id]').forEach((boton) => {
        boton.addEventListener('click', () => mostrarDetalle(boton.dataset.id, ordenadas));
    });
}

function mostrarDetalle(id, auditorias) {
    const auditoria = auditorias.find((a) => String(a.idAuditoria) === String(id));
    if (!auditoria) {
        return;
    }

    document.getElementById('detalleAnteriores').textContent = formatearJson(auditoria.valoresAnteriores);
    document.getElementById('detalleNuevos').textContent = formatearJson(auditoria.valoresNuevos);
    document.getElementById('modalDetalleAuditoria').classList.add('show');
}

async function cargarAuditorias() {
    try {
        const auditorias = await apiGet('/auditorias');
        renderizarTablaAuditorias(auditorias);
    } catch (error) {
        mostrarErrorAuditorias(error.message);
    }
}

async function cargarUsuariosParaFiltro() {
    try {
        const usuarios = await apiGet('/usuarios');
        const select = document.getElementById('filtroUsuario');
        usuarios.forEach((usuario) => {
            const option = document.createElement('option');
            option.value = usuario.idUsuario;
            option.textContent = usuario.username;
            select.appendChild(option);
        });
    } catch (error) {
        mostrarErrorAuditorias('No se pudo cargar la lista de usuarios: ' + error.message);
    }
}

async function aplicarFiltrosAuditoria() {
    const usuarioId = document.getElementById('filtroUsuario').value;
    const tipoOperacion = document.getElementById('filtroTipoOperacion').value;

    try {
        let auditorias;
        if (usuarioId) {
            auditorias = await apiGet(`/auditorias/usuario/${usuarioId}`);
        } else if (tipoOperacion) {
            auditorias = await apiGet(`/auditorias/tipo/${tipoOperacion}`);
        } else {
            auditorias = await apiGet('/auditorias');
        }
        renderizarTablaAuditorias(auditorias);
    } catch (error) {
        mostrarErrorAuditorias(error.message);
    }
}

/* ---------- Inicializacion ---------- */

function inicializarAuditorias() {
    requerirAutenticacion();

    if (!esAdmin()) {
        window.location.href = '/html/dashboard.html';
        return;
    }

    inicializarLayoutComun('auditorias');
    cargarAuditorias();
    cargarUsuariosParaFiltro();

    document.getElementById('btnAplicarFiltroAuditoria').addEventListener('click', aplicarFiltrosAuditoria);
    document.getElementById('btnLimpiarFiltroAuditoria').addEventListener('click', () => {
        document.getElementById('filtroUsuario').value = '';
        document.getElementById('filtroTipoOperacion').value = '';
        cargarAuditorias();
    });
    document.getElementById('btnCerrarModalDetalle').addEventListener('click', () => {
        document.getElementById('modalDetalleAuditoria').classList.remove('show');
    });
}

document.addEventListener('DOMContentLoaded', inicializarAuditorias);