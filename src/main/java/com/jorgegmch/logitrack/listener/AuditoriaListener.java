package com.jorgegmch.logitrack.listener;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jorgegmch.logitrack.config.ApplicationContextProvider;
import com.jorgegmch.logitrack.entity.Auditoria;
import com.jorgegmch.logitrack.entity.Usuario;
import com.jorgegmch.logitrack.entity.enums.TipoOperacion;
import com.jorgegmch.logitrack.repository.AuditoriaRepository;
import com.jorgegmch.logitrack.repository.UsuarioRepository;

import jakarta.persistence.Id;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.PostRemove;
import jakarta.persistence.PostUpdate;

public class AuditoriaListener {

    private static final ThreadLocal<Map<String, String>> SNAPSHOTS = ThreadLocal.withInitial(HashMap::new);
    private static final ObjectMapper MAPPER = construirMapper();

    private static ObjectMapper construirMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return mapper;
    }

    @PostLoad
    public void alCargar(Object entidad) {
        SNAPSHOTS.get().put(clave(entidad), serializar(entidad));
    }

    @PostPersist
    public void alCrear(Object entidad) {
        registrarAuditoria(entidad, TipoOperacion.INSERT, null, serializar(entidad));
    }

    @PostUpdate
    public void alActualizar(Object entidad) {
        String anterior = SNAPSHOTS.get().get(clave(entidad));
        registrarAuditoria(entidad, TipoOperacion.UPDATE, anterior, serializar(entidad));
    }

    @PostRemove
    public void alEliminar(Object entidad) {
        registrarAuditoria(entidad, TipoOperacion.DELETE, serializar(entidad), null);
    }

    private void registrarAuditoria(Object entidad, TipoOperacion tipo, String valoresAnteriores, String valoresNuevos) {
        Usuario usuarioActual = obtenerUsuarioActual();
        if (usuarioActual == null) {
            return;
        }

        Auditoria auditoria = new Auditoria();
        auditoria.setTipoOperacion(tipo);
        auditoria.setFechaHora(LocalDateTime.now());
        auditoria.setUsuarioId(usuarioActual);
        auditoria.setEntidadAfectada(entidad.getClass().getSimpleName());
        auditoria.setValoresAnteriores(valoresAnteriores);
        auditoria.setValoresNuevos(valoresNuevos);

        AuditoriaRepository auditoriaRepository = ApplicationContextProvider.obtenerBean(AuditoriaRepository.class);
        auditoriaRepository.save(auditoria);
    }

    private Usuario obtenerUsuarioActual() {
        Authentication autenticacion = SecurityContextHolder.getContext().getAuthentication();
        if (autenticacion == null || !autenticacion.isAuthenticated()) {
            return null;
        }

        String username = autenticacion.getName();
        UsuarioRepository usuarioRepository = ApplicationContextProvider.obtenerBean(UsuarioRepository.class);
        return usuarioRepository.findByUsername(username).orElse(null);
    }

    private String clave(Object entidad) {
        return entidad.getClass().getSimpleName() + "-" + obtenerId(entidad);
    }

    private Object obtenerId(Object entidad) {
        for (Field campo : entidad.getClass().getDeclaredFields()) {
            if (campo.isAnnotationPresent(Id.class)) {
                campo.setAccessible(true);
                try {
                    return campo.get(entidad);
                } catch (IllegalAccessException e) {
                    return null;
                }
            }
        }
        return null;
    }

    private String serializar(Object entidad) {
        try {
            return MAPPER.writeValueAsString(entidad);
        } catch (Exception e) {
            return "No se pudo serializar la entidad: " + e.getMessage();
        }
    }

    public static void limpiarSnapshots() {
        SNAPSHOTS.remove();
    }
}
