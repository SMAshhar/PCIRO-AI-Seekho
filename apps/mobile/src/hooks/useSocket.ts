import {useEffect, useRef} from 'react';
import {io, Socket} from 'socket.io-client';
import {config} from '../constants/config';
import {useCrisisStore} from '../store/crisisStore';
import {useNotificationStore} from '../store/notificationStore';
import {useSocketStore} from '../store/socketStore';
import {useUserStore} from '../store/userStore';
import {CrisisEvent} from '../types/models';

export const useSocket = (enabled = true) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || config.USE_MOCK_DATA) {
      useSocketStore.getState().setConnected(false);
      return;
    }

    const socket = io(config.WS_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      useSocketStore.getState().setConnected(true);
      const sectors = useUserStore.getState().subscribedSectors;
      socket.emit('subscribe:sector', {sectors});
    });

    socket.on('disconnect', () => {
      useSocketStore.getState().setConnected(false);
    });

    socket.on('crisis:new', (crisis: CrisisEvent) => {
      useCrisisStore.getState().addOrUpdateCrisis(crisis);
    });

    socket.on('crisis:updated', (crisis: CrisisEvent) => {
      useCrisisStore.getState().addOrUpdateCrisis(crisis);
    });

    socket.on('crisis:resolved', ({crisisId}: {crisisId: string}) => {
      useCrisisStore.getState().removeCrisis(crisisId);
    });

    socket.on(
      'score:updated',
      ({crisisId, score}: {crisisId: string; score: number}) => {
        useCrisisStore.getState().updateScore(crisisId, score);
      },
    );

    socket.on('commander:approval_required', () => {
      useNotificationStore.getState().incrementPending();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled]);

  return socketRef;
};
