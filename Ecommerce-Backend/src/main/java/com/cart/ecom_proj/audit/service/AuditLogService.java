package com.cart.ecom_proj.audit.service;

import com.cart.ecom_proj.audit.model.AuditLog;
import com.cart.ecom_proj.audit.repo.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository repository;

    public void record(String username, String action, String details) {
        AuditLog entry = AuditLog.builder()
                .username(username)
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        try {
            repository.save(entry);
        } catch (Exception e) {
            // Audit logging must never break the primary business flow.
            log.warn("Could not persist audit log entry for action '{}': {}", action, e.getMessage());
        }
    }
}
