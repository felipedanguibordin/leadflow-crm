// Application configuration loaded from environment variables.
export default () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-change-me-access',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-change-me-refresh',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    user: process.env.DB_USER ?? 'leadflow',
    password: process.env.DB_PASSWORD ?? 'leadflow',
    name: process.env.DB_NAME ?? 'leadflow',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  storage: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'leadflow-uploads',
    accessKey: process.env.S3_ACCESS_KEY ?? 'minio',
    secretKey: process.env.S3_SECRET_KEY ?? 'minio12345',
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
  },
});
