import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export function setupSocketIO(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    socket.on('join-group', (groupId) => {
      socket.join(`group-${groupId}`);
      io.to(`group-${groupId}`).emit('user-joined', {
        userId: socket.id,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
}
