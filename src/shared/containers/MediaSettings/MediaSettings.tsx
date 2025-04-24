import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import {
  getLocalDevices,
  handleEvent,
  LOCAL_MEDIA_DEVICE_KIND,
  LocalMediaDevice,
  USER_MEDIA_TYPE,
} from '@salutejs/jazz-sdk-web';

import { useGlobalContext } from '../../contexts/globalContext';
import { Button, FormControl, Grid, InputLabel, MenuItem } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type SelectItem = {
  label: string;
  value: string;
};

function getSelectItems(items: ReadonlyArray<LocalMediaDevice>): SelectItem[] {
  return items.map((item) => ({
    value: item.deviceId,
    label: item.label || 'unknown',
  }));
}

export const MediaSettings: FC = () => {
  const { sdk, eventBus } = useGlobalContext();

  const [audioInputDevices, setAudioInputDevices] = useState<SelectItem[]>([]);
  const [audioInputDeviceId, setAudioInputDeviceId] = useState<
    string | undefined
  >(undefined);

  const [audioOutputDevices, setAudioOutputDevices] = useState<SelectItem[]>(
    [],
  );
  const [audioOutputDeviceId, setAudioOutputDeviceId] = useState<
    string | undefined
  >(undefined);

  const [videoInputDevices, setVideoInputDevices] = useState<SelectItem[]>([]);
  const [videoInputDeviceId, setVideoInputDeviceId] = useState<
    string | undefined
  >(undefined);

  const localDevices = useMemo(() => {
    if (!sdk) return undefined;

    return getLocalDevices(sdk);
  }, [sdk]);

  useEffect(() => {
    if (!localDevices) return;


    setAudioInputDevices(getSelectItems(localDevices.audioInputDevices.get()));
    setAudioOutputDevices(getSelectItems(localDevices.audioOutputDevices.get()));
    setVideoInputDevices(getSelectItems(localDevices.videoInputDevices.get()));

    setAudioInputDeviceId(localDevices.audioInput.get()?.deviceId);
    setAudioOutputDeviceId(localDevices.audioOutput.get()?.deviceId);
    setVideoInputDeviceId(localDevices.videoInput.get()?.deviceId);

    const unsubscribeDevicesChanged = handleEvent(
      localDevices.event$,
      'mediaDevicesChanged',
      ({ payload: { groupedDevices } }) => {
        setAudioInputDevices(
          getSelectItems(groupedDevices[LOCAL_MEDIA_DEVICE_KIND.AUDIO_INPUT]),
        );
        setAudioOutputDevices(
          getSelectItems(groupedDevices[LOCAL_MEDIA_DEVICE_KIND.AUDIO_OUTPUT]),
        );
        setVideoInputDevices(
          getSelectItems(groupedDevices[LOCAL_MEDIA_DEVICE_KIND.VIDEO_INPUT]),
        );
      },
    );

    const unsubscribeAudioInputChanged = handleEvent(
      localDevices.event$,
      'audioInputChanged',
      ({ payload: { device } }) => {
        setAudioInputDeviceId(device.deviceId);
      },
    );

    const unsubscribeAudioOutputChanged = handleEvent(
      localDevices.event$,
      'audioOutputChanged',
      ({ payload: { device } }) => {
        setAudioOutputDeviceId(device.deviceId);
      },
    );

    const unsubscribeVideoInputChanged = handleEvent(
      localDevices.event$,
      'videoInputChanged',
      ({ payload: { device } }) => {
        setVideoInputDeviceId(device.deviceId);
      },
    );

    return () => {
      unsubscribeDevicesChanged();

      unsubscribeAudioInputChanged();
      unsubscribeAudioOutputChanged();
      unsubscribeVideoInputChanged();
    };
  }, [localDevices]);

  const handleChangeAudioInput = useCallback(
    (event: SelectChangeEvent) => {
      if (!localDevices) return;
      const id = event.target.value

      const audioInputDevices = localDevices.audioInputDevices.get();
      const audioInputDevice = audioInputDevices.find(
        ({ deviceId }) => deviceId === id,
      );

      if (!audioInputDevice) return;

      localDevices.selectAudioInput(audioInputDevice);
    },
    [localDevices],
  );

  const handleChangeAudioOutput = useCallback(
    (event: SelectChangeEvent) => {
      if (!localDevices) return;
      const id = event.target.value
      const audioOutputDevices = localDevices.audioOutputDevices.get();
      const audioOutputDevice = audioOutputDevices.find(
        ({ deviceId }) => deviceId === id,
      );

      if (!audioOutputDevice) return;

      localDevices.selectAudioOutput(audioOutputDevice);
    },
    [localDevices],
  );

  const handleChangeVideoInput = useCallback(
    (event: SelectChangeEvent) => {
      if (!localDevices) return;
      const id = event.target.value
      const videoInputDevices = localDevices.videoInputDevices.get();
      const videoInputDevice = videoInputDevices.find(
        ({ deviceId }) => deviceId === id,
      );

      if (!videoInputDevice) return;

      localDevices.selectVideoInput(videoInputDevice);
    },
    [localDevices],
  );

  const handleRequestPermissions = useCallback(() => {
    localDevices
      ?.requestUserMediaPermissions(
        USER_MEDIA_TYPE.AUDIO,
        USER_MEDIA_TYPE.VIDEO,
      )
      .catch(() => {
        eventBus({
          type: 'error',
          payload: {
            title: 'User denied permission to use device(s): audio, video',
          },
        });
      });
  }, [localDevices, eventBus]);

  if (
    !audioInputDevices.length &&
    !audioOutputDevices.length &&
    !videoInputDevices.length
  ) {
    return (
      <div>
        <Button onClick={handleRequestPermissions}>
          Request permissions
        </Button>
      </div>
    );
  }

  return (
    <Grid display="flex" flexDirection="row">
      {/* Input audio */}
      {audioInputDevices.length ? (
        <FormControl variant="filled" sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="select-audio-label">Audio Input</InputLabel>
          <Select
            labelId="select-audio-label"
            id="select-audio"
            value={audioInputDeviceId}
            onChange={handleChangeAudioInput}
          >
            {
              audioInputDevices?.map(({ value, label }) => {
                return (<MenuItem key={value} value={value}>{label}</MenuItem>)
              })
            }
          </Select>
        </FormControl>
      ) : null}


      {/* Output audio */}
      {audioInputDevices.length ? (
        <FormControl variant="filled" sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="select-audio-output-label">Audio Output</InputLabel>
          <Select
            labelId="select-audio-output-label"
            id="select-audio-output"
            value={audioOutputDeviceId}
            onChange={handleChangeAudioOutput}
          >
            {
              audioOutputDevices?.map(({ value, label }) => {
                return (<MenuItem key={value} value={value}>{label}</MenuItem>)
              })
            }
          </Select>
        </FormControl>
      ) : null}

      {/* video */}
      {videoInputDevices.length ? (
        <FormControl variant="filled" sx={{ m: 1, minWidth: 150 }}>
          <InputLabel id="select-video-label">Video</InputLabel>
          <Select
            labelId="select-video-label"
            id="select-video"
            value={videoInputDeviceId}
            onChange={handleChangeVideoInput}
          >
            {
              videoInputDevices?.map(({ value, label }) => {
                return (<MenuItem key={value} value={value}>{label}</MenuItem>)
              })
            }
          </Select>
        </FormControl>
      ) : null}
    </Grid>
  );
};
