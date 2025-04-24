import React, { useEffect, useState } from 'react';
import './App.css';
import { AdminPanel } from './pages/admin-panel/admin-panel';
import { useGlobalContext } from './shared/contexts/globalContext';
import {
  createJazzWebSdk,
  JazzSdk,
  SDK_VERSION,
} from '@salutejs/jazz-sdk-web';
import {
  audioOutputMixerPlugin,
  logsPlugin,
  videoElementPoolPlugin,
} from '@salutejs/jazz-sdk-web-plugins';
import { InitSDKStatus, SdkInfo } from './widgets/sdk-info/sdk-info';
import { Grid } from '@mui/material';

function App() {

  const { setSdk, sdk, devices, eventBus } = useGlobalContext();

  const [status, setStatus] = useState<InitSDKStatus>('process');


  useEffect(() => {
    let jazzSdk: JazzSdk | undefined;
    let isDestroyed = false;
    // create sdk
    createJazzWebSdk({
      userAgent: 'Jazz Test App',
      plugins: [
        videoElementPoolPlugin(),
        audioOutputMixerPlugin(),
        logsPlugin({
          logLevel: 'debug',
          isEnableStdout: true,
        }),
      ],
      audioInputDeviceId: devices.getAudioInput(),
      audioOutputDeviceId: devices.getAudioOutput(),
      videoInputDeviceId: devices.getVideoInput(),
    })
      .then((sdk) => {
        if (isDestroyed) {
          sdk.destroy();
          return;
        }
        jazzSdk = sdk;
        setSdk(sdk);
        setStatus('success');
      })
      .catch((error) => {
        if (isDestroyed) {
          return;
        }
        console.error('Fail create sdk', error);
        setStatus('fail');
        eventBus({ type: 'error', payload: { title: 'fail create sdk' } });
      });

    return () => {
      setSdk(undefined);
      jazzSdk?.destroy();
      isDestroyed = true;
    };
  }, [setSdk, devices]);

  return (
    <div className="App">
      <Grid display={"flex"} flexDirection={"column"} p={2} sx={{ minHeight: "100vh" }}>
        {sdk && <>
          <AdminPanel />
          <SdkInfo sdkVersion={SDK_VERSION} sdkStatus={status} />
        </>}
      </Grid>
    </div>
  );
}
export default App;