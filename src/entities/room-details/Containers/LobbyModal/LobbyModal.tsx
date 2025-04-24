import { FC, useCallback } from 'react';

import { JazzRoom, getLobby } from '@salutejs/jazz-sdk-web';
// import { Button, Headline3, Modal } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useQuery } from '../../../../shared/hooks/useQuery';
import { LobbyParticipants } from '../LobbyParticipants';
import { Button, Grid, Modal, Typography } from '@mui/material';

const StyledModal = styled(Modal)`
  display: flex; 
  align-items: center; 
  justify-content: center;
  height: 100%;
  > div {
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }
`;

const Footer = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-items: center;
  gap: 8px;
  padding: 24px;
  max-height: 100px;
  margin-top: auto;
`;

const Header = styled.div`
  padding: 32px 24px 24px;
`;

export type RoomModalProps = {
  room: JazzRoom;
  isOpen: boolean;
  onClose: () => void;
};

export const LobbyModal: FC<RoomModalProps> = ({ room, isOpen, onClose }) => {
  const lobby = getLobby(room);

  const participants = useQuery(lobby.participants);

  const handleApprove = useCallback(() => {
    lobby.moderator.approveAccessAll();
  }, [lobby]);

  const handleDeny = useCallback(() => {
    lobby.moderator.denyAccessAll();
  }, [lobby]);

  const isDisabled = participants.length === 0;

  return (
    <StyledModal open={isOpen} onClose={onClose}>
      <Grid sx={{ backgroundColor: "white" }}>
        <Header>
          <Typography variant='h2'>Participants</Typography>
        </Header>
        <LobbyParticipants room={room} />
        <Footer>
          <Button
            disabled={isDisabled}
            onClick={handleApprove}
          >
            Approve all
          </Button>
          <Button
            disabled={isDisabled}
            onClick={handleDeny}>
            Deny all
          </Button>
        </Footer>
      </Grid>
    </StyledModal>
  );
};
