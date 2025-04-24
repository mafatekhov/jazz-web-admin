import { Grid, styled } from "@mui/material";
import React from "react";
import { useRoomContext } from "../../shared/contexts/roomContext";
import { MainContent } from "./main-content";
import { RoomActions } from "../../shared/containers/Actions";
import { Participants } from "./Containers/Participants";
import { Header } from "./Containers/Header/Header";
import { LobbyModalController } from "./Containers/LobbyModalController";

const Wrapper = styled(Grid)`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`


const HeaderContent = styled(Grid)`
    border: 1px solid black;
    height: 50px;
    margin-bottom: auto;
`

const Left = styled(Grid)`
    border-left: 1px solid black;
    min-width: 280px;
`

const Main = styled(Grid)`
    background-color: grey;
    flex-grow: 1;
`

const Footer = styled(Grid)`
    align-items: center;
    border: 1px solid black;
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
    background-color: gray;
    height: 50px;
    margin-top: auto;
`

export const RoomDetails = () => {
    const { room, eventBus } = useRoomContext();
    if (!room) return <></>

    return (<Wrapper container>
        <HeaderContent>
            {room && <Header room={room} roomEventBus={eventBus} />}
        </HeaderContent>
        <Grid display={"flex"} flexDirection={"row"} flexGrow={1}>
            <Left>
                <Participants room={room} />
            </Left>
            <Main>
                <MainContent room={room} />
            </Main>
        </Grid>
        <Footer>
            <RoomActions room={room} />
        </Footer>
        {room && <LobbyModalController room={room}/>}
    </Wrapper>)
}