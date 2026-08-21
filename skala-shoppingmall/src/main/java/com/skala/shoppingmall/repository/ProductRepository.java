package com.skala.shoppingmall.repository;

import com.skala.shoppingmall.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContaining(String name);

    Product findById(Long id);

    Optional<Product> findByName(String name);

    boolean existsByName(String name);

}
