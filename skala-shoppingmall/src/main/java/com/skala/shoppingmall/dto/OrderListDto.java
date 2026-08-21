package com.skala.shoppingmall.dto;

import lombok.Builder;
import java.util.List;

@Builder
public record OrderListDto(
        String userId,
        Double Point,
        List<OrderItemDto> products) {
}
