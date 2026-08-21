package com.skala.shoppingmall.dto;

import lombok.Builder;

@Builder
public record UserDto(
        Long id,
        String username,
        String email,
        String password) {
}