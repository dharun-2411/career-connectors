package com.careerconnectors.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Validates the JDBC connection to PostgreSQL upon application startup
 * and provides clear error diagnostics without modifying any database tables.
 */
@Component
@Order(0)
public class DatabaseConnectionChecker implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnectionChecker.class);

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/career_connectors}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:postgres}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:}")
    private String datasourcePassword;

    @Override
    public void run(String... args) {
        testConnection();
    }

    /**
     * Attempts a direct JDBC connection using environment variables / application configuration.
     * Password is never hard-coded in Java source code.
     *
     * @return true if connected successfully, false otherwise.
     */
    public boolean testConnection() {
        String url = resolveJdbcUrl();
        String username = resolveUsername();
        String password = resolvePassword();

        logger.info("Testing PostgreSQL JDBC connection to: {}", url);

        try (Connection connection = DriverManager.getConnection(url, username, password)) {
            if (connection != null && !connection.isClosed()) {
                String successMsg = "Connected to PostgreSQL successfully!";
                System.out.println("==================================================================");
                System.out.println(successMsg);
                System.out.println("Database Product : " + connection.getMetaData().getDatabaseProductName() + " " + connection.getMetaData().getDatabaseProductVersion());
                System.out.println("Connected DB     : " + connection.getCatalog());
                System.out.println("User             : " + connection.getMetaData().getUserName());
                System.out.println("==================================================================");
                logger.info(successMsg);
                return true;
            }
        } catch (SQLException e) {
            handleConnectionError(e, url, username);
        } catch (Exception e) {
            logger.error("Unexpected error while connecting to PostgreSQL: {}", e.getMessage(), e);
        }
        return false;
    }

    private String resolveJdbcUrl() {
        String envUrl = System.getenv("DB_URL");
        if (envUrl != null && !envUrl.isBlank()) {
            return envUrl;
        }
        String envHost = System.getenv("DB_HOST");
        String envPort = System.getenv("DB_PORT");
        String envName = System.getenv("DB_NAME");
        if (envHost != null || envPort != null || envName != null) {
            String host = (envHost != null && !envHost.isBlank()) ? envHost : "localhost";
            String port = (envPort != null && !envPort.isBlank()) ? envPort : "5432";
            String db = (envName != null && !envName.isBlank()) ? envName : "career_connectors";
            return "jdbc:postgresql://" + host + ":" + port + "/" + db;
        }
        return datasourceUrl;
    }

    private String resolveUsername() {
        String envUser = System.getenv("DB_USERNAME");
        if (envUser != null && !envUser.isBlank()) {
            return envUser;
        }
        return datasourceUsername;
    }

    private String resolvePassword() {
        // Explicitly prioritize DB_PASSWORD from environment variable
        String envPass = System.getenv("DB_PASSWORD");
        if (envPass != null) {
            return envPass;
        }
        return datasourcePassword;
    }

    private void handleConnectionError(SQLException e, String url, String username) {
        System.err.println("==================================================================");
        System.err.println("PostgreSQL Connection Error!");
        System.err.println("Attempted URL : " + url);
        System.err.println("Attempted User: " + username);
        System.err.println("SQLState      : " + e.getSQLState());
        System.err.println("Error Code    : " + e.getErrorCode());
        System.err.println("Message       : " + e.getMessage());

        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        if (msg.contains("password authentication failed")) {
            System.err.println("DIAGNOSIS: Password authentication failed for user '" + username + "'.");
            System.err.println("RESOLUTION: Verify that the DB_PASSWORD environment variable matches your local PostgreSQL password.");
        } else if (msg.contains("does not exist")) {
            System.err.println("DIAGNOSIS: The specified database does not exist on PostgreSQL.");
            System.err.println("RESOLUTION: Check the DB_NAME parameter and verify the database exists in pgAdmin 4.");
        } else if (msg.contains("connection refused") || msg.contains("the connection attempt failed")) {
            System.err.println("DIAGNOSIS: Could not connect to PostgreSQL on the specified host and port.");
            System.err.println("RESOLUTION: Verify PostgreSQL 18 service is running and listening on port 5432.");
        }
        System.err.println("==================================================================");
        logger.error("Failed to connect to PostgreSQL at {}: {}", url, e.getMessage());
    }

    /**
     * Standalone CLI runner for checking PostgreSQL connection independently.
     */
    public static void main(String[] args) {
        DatabaseConnectionChecker checker = new DatabaseConnectionChecker();
        checker.datasourceUrl = "jdbc:postgresql://localhost:5432/career_connectors";
        checker.datasourceUsername = "postgres";
        checker.datasourcePassword = "";
        boolean success = checker.testConnection();
        System.exit(success ? 0 : 1);
    }
}
