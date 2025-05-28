import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class SqlServerConnect {

    public static void connectToSqlServer() {
        String url = "jdbc:sqlserver://localhost:1433;databaseName=Healthcare_ServiceVer4";
        String user = "sa";
        String password = "12345";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            if (conn != null) {
                System.out.println("✅ Kết nối SQL Server thành công!");
            }
        } catch (SQLException e) {
            System.out.println("❌ Lỗi kết nối SQL Server:");
            e.printStackTrace();

        }
    }

    public static void main(String[] args) {
        connectToSqlServer();
    }
}
