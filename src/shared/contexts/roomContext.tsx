import { createContext, Dispatch, FC, SetStateAction, useContext, useState } from 'react';

import { JazzRoom } from '@salutejs/jazz-sdk-web';
import { createEventBus, EventBus } from '../utils/createEventBus';

export type RoomEventBusEvent = {
  type: 'openLobbyModal';
};

export type RoomContext = {
  room?: JazzRoom | null;
  setRoom: Dispatch<SetStateAction<JazzRoom | null>>;
  eventBus: EventBus<RoomEventBusEvent>;
  isChatActive: boolean;
  setIsChatActive: Dispatch<SetStateAction<boolean>>;
};

const RoomContext = createContext<RoomContext | undefined>(undefined);

export function useRoomContext(): RoomContext {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('RoomContext is required');
  }
  return context;
}


export const RoomContextProvider: FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [room, setRoom] = useState<JazzRoom | null>(null);
  const [isChatActive, setIsChatActive] = useState<boolean>(false);
  const eventBus = createEventBus<RoomEventBusEvent>();


  return <RoomContext.Provider value={{ room, setRoom, eventBus, isChatActive, setIsChatActive }}>{children}</RoomContext.Provider>;
};
