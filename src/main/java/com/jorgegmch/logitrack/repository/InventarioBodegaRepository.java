package com.jorgegmch.logitrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jorgegmch.logitrack.entity.Bodega;
import com.jorgegmch.logitrack.entity.InventarioBodega;
import com.jorgegmch.logitrack.entity.Producto;

public interface InventarioBodegaRepository extends JpaRepository<InventarioBodega, Long> {
    Optional<InventarioBodega> findByBodegaIdAndProductoId(Bodega bodegaId, Producto productoId);
    List<InventarioBodega> findByStockLessThan(Integer stock);
}
