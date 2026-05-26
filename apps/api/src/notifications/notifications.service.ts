import { Injectable } from '@nestjs/common';
import { NotificationEventDto } from './dto/notification-event.dto';

interface ClientConnection {
  organizationId: string;
  socketIds: Set<string>;
}

@Injectable()
export class NotificationsService {
  private connections: Map<string, ClientConnection> = new Map();

  registerClient(socketId: string, organizationId: string): void {
    if (!this.connections.has(organizationId)) {
      this.connections.set(organizationId, {
        organizationId,
        socketIds: new Set(),
      });
    }
    this.connections.get(organizationId)!.socketIds.add(socketId);
  }

  unregisterClient(socketId: string, organizationId: string): void {
    const conn = this.connections.get(organizationId);
    if (conn) {
      conn.socketIds.delete(socketId);
      if (conn.socketIds.size === 0) {
        this.connections.delete(organizationId);
      }
    }
  }

  getClientsForOrganization(organizationId: string): string[] {
    const conn = this.connections.get(organizationId);
    return conn ? Array.from(conn.socketIds) : [];
  }

  broadcastToOrganization(
    organizationId: string,
    event: NotificationEventDto,
  ): void {
    const socketIds = this.getClientsForOrganization(organizationId);
    console.log(
      `Broadcasting event "${event.type}" to ${socketIds.length} clients in org ${organizationId}`,
    );
  }
}
