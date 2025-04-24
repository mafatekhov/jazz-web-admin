import { FC, useCallback, useEffect, useState } from 'react';

import { JazzRoom, ScreenShareUserCanceledError } from '@salutejs/jazz-sdk-web';
import { Button } from '@salutejs/plasma-b2c';
import {
  IconCallEnd,
  IconCameraVideo,
  IconDevice,
  IconDisplay,
  IconMic,
  IconMicOff,
  IconVideoOff,
} from '@salutejs/plasma-icons';
import { critical } from '@salutejs/plasma-tokens';
import styled from 'styled-components/macro';

import { useGlobalContext } from '../../contexts/globalContext';
import { useParticipantMediaMuted } from '../../hooks/useParticipantMediaMuted';
import { useQuery } from '../../hooks/useQuery';

const IconCallEndCustom = styled(IconCallEnd)`
  color: ${critical};
`;

const RequestPermissionPopoverContent = styled.div`
  display: none;
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translate(-50%, -100%);
  padding: 8px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0px 4px 10px rgb(0 0 0 / 22%);
`;

const RequestPermissionPopover = styled.div`
  position: relative;

  &:hover {
    ${RequestPermissionPopoverContent} {
      display: block;
    }
  }
`;

export const RoomActions: FC<{ room: JazzRoom; isShowRaiseHand?: boolean }> = ({
  room,
}) => {
  const localParticipant = useQuery(room.localParticipant);

  const { isAudioMuted, isDisplayMuted, isVideoMuted } =
    useParticipantMediaMuted(room, localParticipant);

  const handleLeave = useCallback(() => {
    room.leave();
  }, [room]);

  return (
    <>
      <RequestPermissionVideo isVideoMuted={isVideoMuted} room={room} />
      <Button
        contentLeft={<IconCallEndCustom color="inherit" />}
        view="critical"
        pin="circle-circle"
        aria-label="leave"
        title="leave"
        onClick={handleLeave}
      />
      <RequestPermissionAudio isAudioMuted={isAudioMuted} room={room} />
      <RequestPermissionDisplay isDisplayMuted={isDisplayMuted} room={room} />
    </>
  );
};

const RequestPermissionDisplay: FC<{
  isDisplayMuted: boolean;
  room: JazzRoom;
}> = ({ room, isDisplayMuted }) => {
  const { eventBus } = useGlobalContext();
  const permissions = useQuery(room.userPermissions);
  const [isLoading, setLoading] = useState(false);
  const handleToggleShare = useCallback(async () => {
    try {
      setLoading(true);
      await room.muteDisplayVideoInput(!isDisplayMuted);
    } catch (error) {
      if (!(error instanceof ScreenShareUserCanceledError)) {
        console.error(error);
        eventBus({
          type: 'error',
          payload: { title: 'Fail toggle screen capture' },
        });
      }
    } finally {
      setLoading(false);
    }
  }, [room, eventBus, isDisplayMuted]);

  const isDisabled = isDisplayMuted && !permissions?.canShareMedia;

  return (
    <RequestPermissionPopover>
      <Button
        contentLeft={isDisplayMuted ? <IconDisplay /> : <IconDevice />}
        pin="circle-circle"
        disabled={isDisabled}
        isLoading={isLoading}
        aria-label="Toggle screen capture"
        title="Toggle screen capture"
        onClick={handleToggleShare}
      />
    </RequestPermissionPopover>
  );
};

const RequestPermissionAudio: FC<{
  isAudioMuted: boolean;
  room: JazzRoom;
}> = ({ room, isAudioMuted }) => {
  const requests = useQuery(room.userPermissionRequests);
  const { eventBus } = useGlobalContext();
  const permissions = useQuery(room.userPermissions);

  const [isLoading, setLoading] = useState(false);

  const handleToggleShare = useCallback(async () => {
    try {
      setLoading(true);
      await room.muteAudioInput(!isAudioMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'Fail toggle mic' } });
    } finally {
      setLoading(false);
    }
  }, [room, eventBus, isAudioMuted]);

  const isDisabled = isAudioMuted && !permissions?.canShareAudio;

  return (
    <RequestPermissionPopover>
      <Button
        contentLeft={isAudioMuted ? <IconMicOff /> : <IconMic />}
        pin="circle-circle"
        aria-label="Toggle mic"
        disabled={isDisabled}
        isLoading={isLoading}
        title="Toggle mic"
        onClick={handleToggleShare}
      />
    </RequestPermissionPopover>
  );
};

const RequestPermissionVideo: FC<{
  isVideoMuted: boolean;
  room: JazzRoom;
}> = ({ room, isVideoMuted }) => {
  const requests = useQuery(room.userPermissionRequests);
  const { eventBus } = useGlobalContext();
  const permissions = useQuery(room.userPermissions);
  const [isLoading, setLoading] = useState(false);

  const handleToggleShare = useCallback(async () => {
    try {
      setLoading(true);
      await room.muteVideoInput(!isVideoMuted);
    } catch (error) {
      console.error(error);
      eventBus({ type: 'error', payload: { title: 'Fail toggle camera' } });
    } finally {
      setLoading(false);
    }
  }, [room, eventBus, isVideoMuted]);

  const isDisabled = isVideoMuted && !permissions?.canShareCamera;

  return (
    <RequestPermissionPopover>
      <Button
        contentLeft={isVideoMuted ? <IconVideoOff /> : <IconCameraVideo />}
        pin="circle-circle"
        aria-label="Toggle camera"
        disabled={isDisabled}
        isLoading={isLoading}
        title="Toggle camera"
        onClick={handleToggleShare}
      />
    </RequestPermissionPopover>
  );
};
