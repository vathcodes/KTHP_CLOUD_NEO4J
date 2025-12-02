import neo4j from "neo4j-driver";
import 'dotenv/config';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const session = driver.session();

session.run("RETURN 1 AS test")
  .then(res => {
    console.log("Neo4j OK:", res.records[0].get("test"));
  })
  .catch(err => {
    console.log("Neo4j ERROR:", err);
  })
  .finally(() => session.close());
