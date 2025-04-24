import { JazzRoom, MediaType } from "@salutejs/jazz-sdk-web";
import React from "react";
import { useQuery } from "../../shared/hooks/useQuery";
import { useParticipants } from "../../shared/hooks/useParticipants";
import { VideoContainer } from "../../shared/components/VideoContainer";
import { useVideoElement } from "../../shared/hooks/useVideoElement";
import { useVideoSources } from "../../shared/hooks/useActiveVideoSource";
import { booleanAttribute } from "../../shared/utils/dataAttributes";
import { Grid } from "@mui/material";
import styled from "styled-components";

interface MainContentProps {
    room: JazzRoom
}

const VideoWrapper = styled(Grid)`
    position: relative;
    height: 100%;
`

export const MainContent: React.FC<MainContentProps> = ({ room }) => {
    const localParticipant = useQuery(room.localParticipant);

    const participants = useParticipants(room);

    const visibleParticipantId = participants[0]?.id;


    const { primary, secondary } = useVideoSources(visibleParticipantId);

    const primarySource: MediaType =
        primary === 'display' ? 'displayScreen' : 'video';

    const primaryVideoElement = useVideoElement<HTMLDivElement>({
        participantId: visibleParticipantId,
        room,
        source: primarySource,
    });


    const visibleParticipant = participants.find(
        ({ id }) => visibleParticipantId === id,
    );
    const isLocalParticipant = localParticipant
        ? localParticipant.id === visibleParticipant?.id
        : false;

    return (
        <VideoWrapper>
            <VideoContainer
                ref={primaryVideoElement.videoRootRef}
                data-paused={booleanAttribute(primaryVideoElement.isVideoPaused)}
                data-is-invert={booleanAttribute(
                    primaryVideoElement.source === 'displayScreen'
                        ? false
                        : isLocalParticipant,
                )}
                data-is-shading={booleanAttribute(
                    primaryVideoElement.source === 'displayScreen' && isLocalParticipant,
                )}
                data-fit="cover"
            />

        </VideoWrapper>
    )
}