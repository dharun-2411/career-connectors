package com.careerconnectors;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

public class DatabaseConnectionTest {

    @Test
    @DisplayName("Verify JDBC connection to local PostgreSQL")
    void testPostgreSqlConnection() {
        // Resolve configuration from environment variables (no hard-coded passwords)
        String envUrl = System.getenv("DB_URL");
        String host = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "localhost";
        String port = System.getenv("DB_PORT") != null ? System.getenv("DB_PORT") : "5432";
        String dbName = System.getenv("DB_NAME") != null ? System.getenv("DB_NAME") : "career_connectors";

        String url = (envUrl != null && !envUrl.isBlank()) 
                ? envUrl 
                : "jdbc:postgresql://" + host + ":" + port + "/" + dbName;

        String username = System.getenv("DB_USERNAME") != null ? System.getenv("DB_USERNAME") : "postgres";
        String password = System.getenv("DB_PASSWORD") != null ? System.getenv("DB_PASSWORD") : "dharun2006";

        System.out.println("Executing DatabaseConnectionTest against: " + url);

        try (Connection connection = DriverManager.getConnection(url, username, password)) {
            assertNotNull(connection, "Connection should not be null");
            assertTrue(connection.isValid(3), "Connection should be valid and responsive within 3 seconds");

            // Required confirmation message
            System.out.println("==========================================");
            System.out.println("Connected to PostgreSQL successfully!");
            System.out.println("Connected Database : " + connection.getCatalog());
            System.out.println("PostgreSQL Version : " + connection.getMetaData().getDatabaseProductVersion());
            System.out.println("==========================================");

        } catch (SQLException e) {
            System.err.println("Database connection failed with error: " + e.getMessage());
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            fail("Failed to connect to PostgreSQL: " + e.getMessage());
        }
    }
}
