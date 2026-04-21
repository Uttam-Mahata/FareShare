package com.commutesplit.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
public class DatabaseRetryConfig {
    private static final Logger log = LoggerFactory.getLogger(DatabaseRetryConfig.class);
    private final DataSource dataSource;

    public DatabaseRetryConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void warmUpConnection() {
        int maxRetries = 5;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try (Connection conn = dataSource.getConnection()) {
                conn.createStatement().execute("SELECT 1");
                log.info("Azure SQL connection established on attempt {}", attempt);
                return;
            } catch (SQLException e) {
                log.warn("DB connection attempt {}/{} failed: {}", attempt, maxRetries, e.getMessage());
                if (attempt < maxRetries) {
                    long waitMs = (long) Math.pow(2, attempt) * 5000L;
                    log.info("Azure SQL may be waking up — retrying in {}ms...", waitMs);
                    try { Thread.sleep(waitMs); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); return; }
                }
            }
        }
        log.warn("Could not warm up Azure SQL after {} retries — will retry on first request", maxRetries);
    }
}
