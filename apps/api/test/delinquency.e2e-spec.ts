import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Delinquency (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('blocks lead mutations when a boleto is pending, allows reads, clears after settlement', async () => {
    const orgRes = await request(app.getHttpServer())
      .post('/api/v1/organizations')
      .send({ name: 'Tenant A' })
      .expect(201);
    const orgBody = orgRes.body as { id: string };
    const organizationId = orgBody.id;

    await request(app.getHttpServer())
      .post(`/api/v1/organizations/${organizationId}/leads`)
      .send({ title: 'First lead' })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/organizations/${organizationId}/payables`)
      .send({
        documentType: 'BOLETO',
        amountCents: 5000,
        dueDate: '2026-01-01',
        externalReference: 'BOL-1',
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/api/v1/organizations/${organizationId}/leads`)
      .expect(200);

    const blocked = await request(app.getHttpServer())
      .post(`/api/v1/organizations/${organizationId}/leads`)
      .send({ title: 'Should be blocked' })
      .expect(403);
    const errBody = blocked.body as { message: string };
    expect(errBody.message).toContain('pending');

    const payables = await request(app.getHttpServer())
      .get(`/api/v1/organizations/${organizationId}/payables`)
      .expect(200);
    const payablesBody = payables.body as Array<{ id: string }>;
    const payableId = payablesBody[0].id;

    await request(app.getHttpServer())
      .post(
        `/api/v1/organizations/${organizationId}/payables/${payableId}/settle`,
      )
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/organizations/${organizationId}/leads`)
      .send({ title: 'After settlement' })
      .expect(201);
  });
});
