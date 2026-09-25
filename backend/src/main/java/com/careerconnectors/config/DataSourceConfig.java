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
        logger.info("Initializing DataSource with URL: {}", sanitizeUrl(rawUrl));

        HikariConfig config = new HikariConfig();

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://") || rawUrl.startsWith("jdbc:postgresql://"))) {
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
            if (rawUrl.startsWith("jdbc:postgresql://")) {
                config.setJdbcUrl(rawUrl);
                config.setUsername(System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : springDatasourceUsername);
                config.setPassword(System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : springDatasourcePassword);
                return;
            }

            // Parse postgres://user:pass@host:port/db or postgresql://user:pass@host:port/db
            String standardUriStr = rawUrl;
            if (standardUriStr.startsWith("postgresql://")) {
                standardUriStr = "postgres://" + standardUriStr.substring("postgresql://".length());
            }

            URI uri = new URI(standardUriStr);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();
            String dbName = (path != null && path.length() > 1) ? path.substring(1) : "career_connectors";

            String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
            config.setJdbcUrl(jdbcUrl);

            String userInfo = uri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String[] parts = userInfo.split(":", 2);
                config.setUsername(parts[0]);
                config.setPassword(parts[1]);
            } else {
                if (userInfo != null) {
                    config.setUsername(userInfo);
                } else if (System.getenv("DB_USERNAME") != null) {
                    config.setUsername(System.getenv("DB_USERNAME"));
                } else {
                    config.setUsername(springDatasourceUsername);
                }

                if (System.getenv("DB_PASSWORD") != null) {
                    config.setPassword(System.getenv("DB_PASSWORD"));
                } else {
                    config.setPassword(springDatasourcePassword);
                }
            }
        } catch (Exception e) {
            logger.warn("Parsing PostgreSQL URI warning, falling back to direct URL: {}", e.getMessage());
            String fallbackJdbc = rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl;
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
