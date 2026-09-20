package com.cart.ecom_proj.order.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Lightweight event published to RabbitMQ whenever a new order is created,
 * allowing downstream consumers (e.g. audit logging, notifications) to react
 * asynchronously without coupling to the order creation transaction.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderCreatedEvent implements Serializable {
    private Long orderId;
    private Long userId;
    private String username;
    private BigDecimal total;
    private LocalDateTime timestamp;
}
