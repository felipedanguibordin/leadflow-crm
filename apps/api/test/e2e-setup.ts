/** Must load before AppModule so TypeORM picks the in-memory driver in Jest e2e runs. */
process.env.E2E_TEST = 'true';
