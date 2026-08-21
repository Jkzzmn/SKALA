package com.skala.shoppingmall.service;

import java.util.stream.Collector;
import java.util.stream.Collectors;

import org.hibernate.query.ParameterLabelException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.skala.shoppingmall.dto.ProductDto;
import com.skala.shoppingmall.entity.Product;
import com.skala.shoppingmall.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository_1;
    private ProductRepository productRepository;

    public ProductService(ProductRepository productRepository, ProductRepository productRepository_1) {
        this.productRepository = productRepository;
        this.productRepository_1 = productRepository_1;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 존재하지 않습니다. id=" + id));

        return convertToDto(product);
    }

    public ProductDto createProduct(Product product) {
        if (productRepository.existsByName(product.getName())) {
            throw new IllegalArgumentException("이미 존재하는 상품입니다.");
        }
        productRepository.save(product);
        return convertToDto(product);
    }

    public ProductDto updateProduct(Product product) {
        if (productRepository.existsByName(product.getName())) {
            throw new ParameterLabelException("이미 존재하는 상품입니다.");
        }
        if (product.getPrice() <= 0) {
            throw new ParameterLabelException("물품의 가격은 0원을 넘어야 합니다.");
        }
        Product updateProduct = productRepository.findById(product.getId());
        updateProduct = product;
        productRepository.save(updateProduct);
        return convertToDto(updateProduct);
    }

    public void deleteProduct(Product product) {
        if (productRepository.existsById(product.getId())) {
            return productRepository.delete(product);
        }
        throw new ResponseStatusException(DATA_NOT_FOUND);
    }

    public ProductDto convertToDto(Product product) {
        ProductDto productDto = new ProductDto();
        productDto.setId(product.getId());
        productDto.setName(product.getName());
        productDto.setPrice(product.getPrice());
        productDto.setDescription(product.getDescription());
        productDto.setStock(product.getStock())
        return productDto;
    }
}
