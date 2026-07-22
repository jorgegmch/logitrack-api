package com.jorgegmch.logitrack.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.jorgegmch.logitrack.entity.Producto;
import com.jorgegmch.logitrack.repository.ProductoRepository;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    public Producto buscarProductoPorId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("El id debe ser un número positivo");
        }
        Producto producto = productoRepository.findById(id).orElse(null);
        if (producto == null) {
            throw new RuntimeException("Producto no encontrado con id: " + id);
        }
        return producto;
    }

    public Producto crearProducto(String nombre, String categoria, BigDecimal precio) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El producto debe tener un nombre");
        }
        if (precio == null) {
            throw new IllegalArgumentException("El producto debe tener un precio");
        }
        if (precio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
        String categoriaFinal = (categoria != null) ? categoria.trim().toUpperCase() : null;

        return productoRepository.save(new Producto(null, nombre.trim().toUpperCase(), categoriaFinal, precio));
    }

    public Producto actualizarProducto(Long id, String nombre, String categoria, BigDecimal precio) {
        Producto producto = buscarProductoPorId(id);

        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El producto debe tener un nombre");
        }
        if (precio == null) {
            throw new IllegalArgumentException("El producto debe tener un precio");
        }
        if (precio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }

        String categoriaFinal = (categoria != null) ? categoria.trim().toUpperCase() : null;

        producto.setNombre(nombre.trim().toUpperCase());
        producto.setCategoria(categoriaFinal);
        producto.setPrecio(precio);

        return productoRepository.save(producto);
    }

    public void eliminarProducto(Long id) {
        buscarProductoPorId(id);
        productoRepository.deleteById(id);
    }

}
