package com.cart.ecom_proj.order;

import com.cart.ecom_proj.audit.repo.AuditLogRepository;
import com.cart.ecom_proj.cart.model.Cart;
import com.cart.ecom_proj.cart.repo.CartRepo;
import com.cart.ecom_proj.cart.service.CartService;
import com.cart.ecom_proj.model.Product;
import com.cart.ecom_proj.model.Role;
import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.order.model.Order;
import com.cart.ecom_proj.order.service.OrderService;
import com.cart.ecom_proj.repo.ProductRepo;
import com.cart.ecom_proj.repo.UserRepo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end integration test exercising the real order checkout flow against
 * a PostgreSQL and MongoDB container: a product is added to a user's cart,
 * checkout persists an order, and the audit log entry written synchronously
 * during checkout is verified. Requires Docker; run explicitly via the
 * "integration" tag (excluded from the default `mvn test` unit-test run).
 */
@Tag("integration")
@Testcontainers
@SpringBootTest
class OrderCheckoutIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("ecommerce")
            .withUsername("postgres")
            .withPassword("postgres");

    @Container
    static MongoDBContainer mongo = new MongoDBContainer("mongo:7");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("spring.flyway.enabled", () -> "false");
        registry.add("spring.data.mongodb.uri", mongo::getReplicaSetUrl);
    }

    @Autowired
    private UserRepo userRepo;
    @Autowired
    private ProductRepo productRepo;
    @Autowired
    private CartRepo cartRepo;
    @Autowired
    private CartService cartService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private AuditLogRepository auditLogRepository;

    @Test
    void checkoutPersistsOrderAndWritesAuditLog() {
        User user = userRepo.save(User.builder()
                .username("it-user")
                .password("encoded")
                .email("it-user@example.com")
                .role(Role.ROLE_USER)
                .build());

        Product product = productRepo.save(Product.builder()
                .name("IT Test Product")
                .price(new BigDecimal("25.00"))
                .stockQuantity(10)
                .build());

        cartService.addItem(user.getUsername(), product.getId(), 2);

        Order order = orderService.checkout(user.getUsername());

        assertThat(order.getId()).isNotNull();
        assertThat(order.getTotalAmount()).isEqualByComparingTo("50.00");

        Cart clearedCart = cartRepo.findByUserId(user.getId()).orElseThrow();
        assertThat(clearedCart.getItems()).isEmpty();

        assertThat(auditLogRepository.findAll())
                .anyMatch(log -> "ORDER_CREATED".equals(log.getAction()));
    }
}
