package com.skala.shoppingmall.dto;

public record OrderItemDto(
        Long id,
        Long productId,
        String productName,
        Double productPrice,
        Integer quantity) {
}
