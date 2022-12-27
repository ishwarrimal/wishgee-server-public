const isProd = process.env.NODE_ENV === "production";

module.exports = {
   "type": "postgres",
   "url": isProd ? process.env.DATABASE_URL : process.env.DEV_DATABASE_URL,
   "synchronize": false,
   "logging": false,
   "entities": [
      "src/entity/**/*.ts"
   ],
   "migrations": [
      "src/migration/**/*.ts"
   ],
   "subscribers": [
      "src/subscriber/**/*.ts"
   ],
   "cli": {
      "entitiesDir": "src/entity",
      "migrationsDir": "src/migration",
      "subscribersDir": "src/subscriber"
   },
   "ssl": process.env.NODE_ENV === 'production'
   ? { rejectUnauthorized: false }
   : false
}