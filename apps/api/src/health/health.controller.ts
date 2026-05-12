import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import Redis from 'ioredis';
import { REDIS } from '../redis/redis.module';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness and dependency checks (DB, Redis, memory heap)',
  })
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      () => this.db.pingCheck('database', { timeout: 3000 }),
      () => this.redisPing(),
    ]);
  }

  private async redisPing(): Promise<HealthIndicatorResult> {
    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') {
        return { redis: { status: 'down', message: pong } };
      }
      return { redis: { status: 'up' } };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { redis: { status: 'down', message } };
    }
  }
}
