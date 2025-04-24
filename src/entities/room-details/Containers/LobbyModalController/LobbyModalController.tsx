import { FC, useCallback, useEffect, useState } from 'react';

import { JazzRoom, handleEvent } from '@salutejs/jazz-sdk-web';

import { LobbyModal } from '../LobbyModal/LobbyModal';
import { useRoomContext } from '../../../../shared/contexts/roomContext';

export const LobbyModalController: FC<{ room: JazzRoom }> = ({ room }) => {
  const { eventBus } = useRoomContext();

  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = handleEvent(eventBus.event$, 'openLobbyModal', () => {
      setOpen(true);
    });

    return () => {
      unsubscribe();
    };
  }, [eventBus]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return <LobbyModal isOpen={isOpen} onClose={handleClose} room={room}/>;
};
