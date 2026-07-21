package com.jorgegmch.logitrack.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.jorgegmch.logitrack.entity.enums.TipoMovimiento;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "movimiento")
@Data
@EqualsAndHashCode(of = "idMovimiento")
@NoArgsConstructor
@AllArgsConstructor
public class Movimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idMovimiento;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuarioId;

    @ManyToOne
    @JoinColumn(name = "bodega_origen_id")
    private Bodega bodegaOrigenId;

    @ManyToOne
    @JoinColumn(name = "bodega_destino_id")
    private Bodega bodegaDestinoId;

    @OneToMany(mappedBy = "movimiento", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<DetalleMovimiento> detalles = new ArrayList<>();
}
