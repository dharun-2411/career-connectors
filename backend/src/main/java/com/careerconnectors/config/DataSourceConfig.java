package com.careerconnectors.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Intelligent DataSource Configuration that seamlessly normalizes Render, Docker,
 * and Cloud PostgreSQL connection URLs into standard Spring Boot JDBC format.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String springDatasourceUsername;

    @Value("${spring.datasource.password:}")
    private String springDatasourcePassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        String rawUrl = getRawUrl();
        logger.info("Initializing DataSource with raw URL: {}", sanitizeUrl(rawUrl));

        HikariConfig config = new HikariConfig();

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://") || rawUrl.startsWith("jdbc:postgresql://") || rawUrl.contains("postgres"))) {
            configurePostgres(config, rawUrl);
        } else {
            config.setJdbcUrl(rawUrl != null && !rawUrl.isBlank() ? rawUrl : "jdbc:postgresql://localhost:5432/career_connectors");
            config.setUsername(springDatasourceUsername);
            config.setPassword(springDatasourcePassword);
            config.setDriverClassName("org.postgresql.Driver");
        }

        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(30000);

        return new HikariDataSource(config);
    }

    private String getRawUrl() {
        String url = System.getenv("DB_URL");
        if (url != null && !url.isBlank()) return url.trim();

        url = System.getenv("DATABASE_URL");
        if (url != null && !url.isBlank()) return url.trim();

        if (springDatasourceUrl != null && !springDatasourceUrl.isBlank()) {
            return springDatasourceUrl.trim();
        }

        return "jdbc:postgresql://localhost:5432/career_connectors";
    }

    private void configurePostgres(HikariConfig config, String rawUrl) {
        config.setDriverClassName("org.postgresql.Driver");

        try {
            // Strip any "jdbc:" prefix first to get the clean URI
            String cleanUriStr = rawUrl.trim();
            if (cleanUriStr.startsWith("jdbc:")) {
                cleanUriStr = cleanUriStr.substring("jdbc:".length());
            }

            if (cleanUriStr.startsWith("postgresql://")) {
                cleanUriStr = "postgres://" + cleanUriStr.substring("postgresql://".length());
            }

            if (!cleanUriStr.startsWith("postgres://")) {
                cleanUriStr = "postgres://" + cleanUriStr;
            }

            URI uri = new URI(cleanUriStr);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            String dbName = (path != null && path.length() > 1) ? path.substring(1) : "career_connectors";

            // Standard PostgreSQL JDBC URL must NOT contain user:pass@
            String validJdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
            config.setJdbcUrl(validJdbcUrl);

            String userInfo = uri.getUserInfo();
            String username = null;
            String password = null;

            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                username = parts[0];
                password = parts[1];
            } else if (userInfo != null) {
                username = userInfo;
            }

            if (username == null || username.isBlank()) {
                username = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : springDatasourceUsername;
            }
            if (password == null || password.isBlank()) {
                password = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : springDatasourcePassword;
            }

            config.setUsername(username);
            config.setPassword(password);

            logger.info("Successfully configured PostgreSQL DataSource: URL={}, User={}", validJdbcUrl, username);
        } catch (Exception e) {
            logger.error("Failed to parse PostgreSQL URI ({}), falling back to direct configuration", e.getMessage(), e);
            String fallbackJdbc = rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl;
            if (fallbackJdbc.contains("@")) {
                fallbackJdbc = fallbackJdbc.replaceAll("://[^/@]+@", "://");
            }
            config.setJdbcUrl(fallbackJdbc);
            config.setUsername(System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : springDatasourceUsername);
            config.setPassword(System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : springDatasourcePassword);
        }
    }

    private String sanitizeUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll(":[^:@]+@", ":****@");
    }
}
