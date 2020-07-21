const config = {};

config.keys = {
  secret: 'abc1234'
};

config.db = {
  username: 'postgres',
  password: 'abc123',
  dbName: 'minimessenger',
  host: 'localhost',
  dialect: 'postgres'
}

export default config;