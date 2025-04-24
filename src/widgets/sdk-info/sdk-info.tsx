import { Grid } from "@mui/material";
import React from "react";


export type InitSDKStatus = 'fail' | 'success' | 'process';


const STATUS: Record<InitSDKStatus, string> = {
  fail: '🔴',
  process: '🟠',
  success: '🟢',
};

export const SdkInfo = ({ sdkVersion, sdkStatus }: {sdkVersion: string, sdkStatus: InitSDKStatus}) => {
    return (
        <Grid container gap={2} sx={{marginTop: "auto", alignItems: 'center', justifyItems: 'center'}}>
            <Grid>
                SDK_VERSION: {sdkVersion}
            </Grid>
            <Grid>
                SDK status: {STATUS[sdkStatus]}
            </Grid>
        </Grid>
    )
}