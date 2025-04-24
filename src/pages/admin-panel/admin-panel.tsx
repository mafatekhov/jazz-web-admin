import React from "react";
import { CreateClient } from "../../features/create-client/create-client";
import { host } from "../../shared/constants/jazz";
import { CreateRoom } from "../../features/create-room/create-room";
import { Grid } from "@mui/material";
import { RoomDetails } from "../../entities/room-details/room-details";
import { MediaSettings } from "../../shared/containers/MediaSettings";

export const AdminPanel = () => {
    return (
        <Grid display={"flex"} flexDirection={"column"} flexGrow={1}>
            <Grid display={"flex"} flexDirection={"row"}>
                <CreateClient host={host} />
                <CreateRoom />
                <MediaSettings />
            </Grid>
            <RoomDetails />
        </Grid>
    )
}