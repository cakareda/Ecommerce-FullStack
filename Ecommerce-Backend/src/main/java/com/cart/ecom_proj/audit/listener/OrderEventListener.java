package com.cart.ecom_proj.audit.listener;

import com.cart.ecom_proj.audit.service.AuditLogService;
import com.cart.ecom_proj.config.RabbitMQConfig;
import com.cart.ecom_proj.order.dto.OrderCreatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumes OrderCreatedEvent messages published to the order exchange and
 * records an audit log entry, decoupling audit logging from the synchronous
 * order-creation request/response cycle.
 */
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    private final AuditLogService auditLogService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_CREATED_QUEUE)
    public void handleOrderCreated(OrderCreatedEvent event) {
        auditLogService.record(
                event.getUsername(),
                "ORDER_CREATED_ASYNC",
                "Order #" + event.getOrderId() + " for user " + event.getUserId() + " totaling " + event.getTotal()
        );
    }
}
