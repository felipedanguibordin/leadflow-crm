import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface Notification {
  type: string;
  organizationId: string;
  data: Record<string, any>;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private socket: Socket | null = null;
  private notifications$ = new BehaviorSubject<Notification | null>(null);
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor() {}

  connect(organizationId: string, apiUrl: string = 'http://localhost:3000'): void {
    if (this.socket) {
      return; // Already connected
    }

    this.socket = io(`${apiUrl}/notifications`, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to notifications gateway');
      this.connected$.next(true);

      // Subscribe to organization notifications
      this.socket?.emit('subscribe', { organizationId });
    });

    this.socket.on('subscribed', (data) => {
      console.log('Subscribed to organization:', data);
    });

    this.socket.on('lead:created', (notification: Notification) => {
      console.log('Received notification:', notification);
      this.notifications$.next(notification);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notifications gateway');
      this.connected$.next(false);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }

  getNotifications(): Observable<Notification | null> {
    return this.notifications$.asObservable();
  }

  isConnected(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  unsubscribe(organizationId: string): void {
    if (this.socket) {
      this.socket.emit('unsubscribe', { organizationId });
    }
  }

  ping(): void {
    if (this.socket) {
      this.socket.emit('ping');
    }
  }
}
