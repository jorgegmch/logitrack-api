package com.jorgegmch.logitrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jorgegmch.logitrack.entity.Auditoria;
import com.jorgegmch.logitrack.entity.Usuario;
import com.jorgegmch.logitrack.entity.enums.TipoOperacion;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByUsuarioId(Usuario usuarioId);
    List<Auditoria> findByTipoOperacion(TipoOperacion tipoOperacion);
}
