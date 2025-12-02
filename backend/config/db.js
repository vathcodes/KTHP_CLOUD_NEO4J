import neo4j from "neo4j-driver";
import 'dotenv/config'; // PHẢI DÒNG ĐẦU

let driver;

export const connectDB = async () => {
  if (!driver) {
    try {
      driver = neo4j.driver(
        process.env.NEO4J_URI,
        neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
      );

      // Thử kết nối
      await driver.verifyConnectivity();
      console.log("Kết nối Neo4j thành công");
    } catch (error) {
      console.error("Lỗi kết nối Neo4j:", error);
      process.exit(1);
    }
  }

  return driver;
};

// Helper tạo session
export const getSession = () => {
  if (!driver) throw new Error("Driver chưa kết nối! Hãy gọi connectDB() trước.");
  return driver.session();
};

export default connectDB;
