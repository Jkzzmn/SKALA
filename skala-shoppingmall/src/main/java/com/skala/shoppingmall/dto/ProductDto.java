package com.skala.shoppingmall.dto;

import lombok.Builder;

@Builder
public record ProductDto(
                Long id,
                String name,
                Double price,
                Integer stock,
                String description) {
}