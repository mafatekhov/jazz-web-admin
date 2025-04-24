import { FC, useCallback, useMemo } from 'react';

import { JazzRoom, getLobby } from '@salutejs/jazz-sdk-web';
import { Badge, Button, Headline3 } from '@salutejs/plasma-b2c';
import { IconSettings } from '@salutejs/plasma-icons';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../../../shared/contexts/globalContext';
import { useQuery } from '../../../../shared/hooks/useQuery';
import { EventBus } from '../../../../shared/utils/createEventBus';
import { RoomEventBusEvent } from '../../../../shared/contexts/roomContext';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 10px;
  gap: 16px;
  display: grid;
  grid-template-columns: auto 1fr auto;
`;

export const Header: FC<{ room: JazzRoom, roomEventBus: EventBus<RoomEventBusEvent> }> = ({ room, roomEventBus }) => {
  const { eventBus } = useGlobalContext();

  const title = useQuery(room.settings.title);

  const userPermissions = useQuery(room.userPermissions);

  const lobby = useMemo(() => {
    return getLobby(room);
  }, [room]);

  const isLobbyEnabled = useQuery(lobby.settings.isLobbyEnabled);

  //  todo: add settings modal
  const handleOpenSettings = useCallback(() => {
    eventBus({
      type: 'roomSettingsOpen',
      payload: {
        room,
      },
    });
  }, [room, eventBus]);

  const handleOpenLobby = useCallback(() => {
    roomEventBus({
      type: 'openLobbyModal',
    });
  }, [roomEventBus]);

  const lobbyParticipants = useQuery(lobby.participants);

  return (
    <>
      <Wrapper>
        <Headline3>{title}</Headline3>
        {isLobbyEnabled && userPermissions.canManageLobby && (
          <Button
            contentRight={
              <Badge size="l" text={`${lobbyParticipants.length}`} />
            }
            aria-label="Lobby"
            title="Lobby"
            onClick={handleOpenLobby}
            text="Lobby"
          />
        )}
      </Wrapper>
    </>
  );
};
