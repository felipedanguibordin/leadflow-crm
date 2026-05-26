import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { NotificationEventDto } from './dto/notification-event.dto';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private notificationsService: NotificationsService) {}

  afterInit() {
    console.log('WebSocket notifications gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Note: organizationId is stored during subscribe, needs to be passed here
    // For now, we'll handle cleanup in the unsubscribe method
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { organizationId: string },
  ): void {
    const { organizationId } = data;

    if (!organizationId) {
      throw new WsException('organizationId is required');
    }

    // Store organizationId on the socket for later use
    (client as any).organizationId = organizationId;

    // Register client with notifications service
    this.notificationsService.registerClient(client.id, organizationId);

    // Join a room named after the organization
    client.join(`org:${organizationId}`);

    console.log(
      `Client ${client.id} subscribed to organization ${organizationId}`,
    );

    // Send confirmation
    client.emit('subscribed', { organizationId, clientId: client.id });
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { organizationId: string },
  ): void {
    const { organizationId } = data;

    // Unregister client
    this.notificationsService.unregisterClient(client.id, organizationId);

    // Leave the room
    client.leave(`org:${organizationId}`);

    console.log(`Client ${client.id} unsubscribed from organization`);
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): void {
    client.emit('pong');
  }

  // Method to broadcast notifications to a specific organization
  broadcastToOrganization(
    organizationId: string,
    event: NotificationEventDto,
  ): void {
    // This will be called from services to emit notifications
    // The gateway uses socket.io's room broadcasting
    this.notificationsService.broadcastToOrganization(organizationId, event);
  }
}
