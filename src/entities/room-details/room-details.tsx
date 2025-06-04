import { Grid, styled } from "@mui/material";
import React, { useCallback } from "react";
import { useRoomContext } from "../../shared/contexts/roomContext";
import { MainContent } from "./main-content";
import { RoomActions } from "../../shared/containers/Actions";
import { Participants } from "./Containers/Participants";
import { Header } from "./Containers/Header/Header";
import { LobbyModalController } from "./Containers/LobbyModalController";
import { ChatBox } from "./Containers/Chat/Chat";
import { Button } from "@salutejs/plasma-b2c";
import { white } from "@salutejs/plasma-tokens";
import { IconDisplay } from "@salutejs/plasma-icons";
import { RoomInfoModal } from "../../features/room-info/RoomInfoModal";
import { useGlobalContext } from "../../shared/contexts/globalContext";
import { JazzRoom } from "@salutejs/jazz-sdk-web";

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
    justify-content: space-between;
    gap: 10px;
    background-color: gray;
    height: 50px;
    margin-top: auto;
`

const ViewButton = styled(Button)`
  width: 100%;
  height: 100%;
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  color: ${white};
`;

const StyledIconDisplay = styled(IconDisplay)`
  margin-right: 8px;
`;

export const RoomDetails = () => {
    const { room, eventBus, isChatActive } = useRoomContext();
    const { eventBus: globalEventBus } = useGlobalContext()

    const handleViewRoomInfo = useCallback(() => {
        globalEventBus({
            type: 'roomInfoModalOpen',
            payload: {
                room: room as JazzRoom,
            },
        });
    }, [room, eventBus]);


    if (!room) return <></>



    return (<Wrapper container>
        <HeaderContent>
            {room && <Header room={room} roomEventBus={eventBus} />}
        </HeaderContent>
        <Grid display={"flex"} flexDirection={"row"} flexGrow={1}>
            <Left>
                {isChatActive ? <ChatBox /> : <Participants room={room} />}
            </Left>
            <Main>
                <MainContent room={room} />
            </Main>
        </Grid>
        <Footer>
            <Grid>
                <ViewButton view="clear" onClick={handleViewRoomInfo} color={white}>
                    <StyledIconDisplay color={white} />
                    View Room
                </ViewButton>
            </Grid>
            <Grid display={"flex"} gap={2} justifyContent={"space-between"} alignItems={"center"}>
                <RoomActions room={room} />
            </Grid>

        </Footer>
        {room && <LobbyModalController room={room} />}
        <RoomInfoModal room={room} />
    </Wrapper>)
}