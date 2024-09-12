import { Db, MongoClient } from 'mongodb';

export function setupTest() {
  let db: Db;
  let connection: MongoClient;

  before('connect to db', async () => {
    connection = new MongoClient('mongodb://localhost:27017/enterprise-patterns');
    await connection.connect();
    db = connection.db('enterprise-patterns');
  });

  after('close connection to db', async () => {
    await db.dropDatabase();
    await connection.close();
  });

  return {
    getDb: () => db,
  };
}
