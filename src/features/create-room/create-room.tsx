import { Button, Grid } from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useGlobalContext } from "../../shared/contexts/globalContext";
import { useClientsContext } from "../../shared/contexts/clientsContext";
import { JazzClient, createSdkToken, getLocalDevices, handleEvent } from "@salutejs/jazz-sdk-web";

import { CreateConferenceForm, CreateConferenceModal } from "./Containers/create-conference-modal";
import { key } from "../../shared/constants/jazz";
import { useRoomContext } from "../../shared/contexts/roomContext";
import { JoinToConferenceModal } from "../client-card/Containers/JoinConferenceModal";

export type JoinToConferenceModalForm = {
    password: string;
    roomId: string;
};

export const CreateRoom = () => {
    const { sdk, eventBus } = useGlobalContext();
    const { addClient, removeClient, loginBySdkToken } = useClientsContext();
    const [client, setClient] = useState<JazzClient | null>(null);
    const [isOpenJoinToConferenceModal, setIsOpenJoinToConferenceModal] =
        useState(false);

    const [conferenceUrl, setConferenceUrl] = useState<string>('')

    const { setRoom } = useRoomContext();

    const [isOpenCreateConferenceModal, setIsOpenCreateConferenceModal] =
        useState(false);

    const localDevices = useMemo(() => {
        if (!sdk) return
        return getLocalDevices(sdk);
    }, [sdk]);


    useEffect(() => {
        if (!sdk) return;
        const unsubscribeAddClient = handleEvent(
            sdk.event$,
            'addClient',
            ({ payload: { client } }) => {
                setClient(client);
                addClient(client);
            },
        );

        const unsubscribeRemoveClient = handleEvent(
            sdk.event$,
            'removeClient',
            ({ payload: { client } }) => {
                setClient(null);
                removeClient(client);
            },
        );

        return () => {
            unsubscribeAddClient();
            unsubscribeRemoveClient();
        };
    }, [sdk, eventBus, removeClient, addClient]);


    useEffect(() => {
        if (!client) return
        handleLoginBySdkToken()
    }, [client])

    useEffect(() => {
        if (!client) return
        const unsubscribeAddRoom = handleEvent(
            client.event$,
            'addRoom',
            async ({ payload }) => {
                setRoom(payload.room);
            },
        );

        const unsubscribeRemoveRoom = handleEvent(
            client.event$,
            'removeRoom',
            () => {
                setRoom(null);
                setConferenceUrl('');
            },
        );

        return () => {
            unsubscribeAddRoom();
            unsubscribeRemoveRoom();
        };
    }, [client]);


    const handleCreate = useCallback(() => {
        if (!client?.auth.isAuthorised.get()) {
            eventBus({
                type: 'error',
                payload: {
                    title: 'To create the conference, you need to sign in',
                },
            });
            return;
        }
        setIsOpenCreateConferenceModal(true);
    }, [client, eventBus]);

    const handleCloseCreateConferenceModal = useCallback(() => {
        setIsOpenCreateConferenceModal(false);
    }, []);

    const handleConnectToConference = useCallback(
        async (form: JoinToConferenceModalForm) => {

            try {
                await client?.conferences.getDetails({
                    roomId: form.roomId,
                    password: form.password,
                });
            } catch (error) {
                eventBus({
                    type: 'error',
                    payload: {
                        title: 'Fail connect to conference',
                    },
                });
                return;
            }

            const room = client?.conferences.join({
                roomId: form.roomId,
                password: form.password,
            });


            const releaseMedia = () => {
                const displayStream = room?.displayStream.get();

                if (displayStream) {
                    console.log('Release display mediaStream');

                    localDevices?.releaseMediaStream(displayStream);
                }
            };
            if (!room) return
            handleEvent(room.event$, 'destroy', releaseMedia, true);

            try {
                const audioStream = await localDevices?.getSelectedAudioInputStream();

                console.log('Add audio mediaStream to room');

                if (!audioStream) return

                room.setUserAudioInput(audioStream);

                const releaseMedia = () => {
                    console.log('Release audio mediaStream');

                    localDevices?.releaseMediaStream(audioStream);
                };

                handleEvent(room.event$, 'destroy', releaseMedia, true);
            } catch (error) {
                console.log('Media permission for audio is denied');
            }

            try {
                const videoStream = await localDevices?.getSelectedVideoInputStream();
                if (!videoStream) return

                console.log('Add video mediaStream to room');

                room.setUserVideoInput(videoStream);

                const releaseMedia = () => {
                    console.log('Release video mediaStream');

                    localDevices?.releaseMediaStream(videoStream);
                };

                handleEvent(room.event$, 'destroy', releaseMedia, true);
            } catch (error) {
                console.log('Media permission for video is denied');
            }
        },
        [client, localDevices, eventBus],
    );

    const handleCreateConference = useCallback(
        (form: CreateConferenceForm) => {
            handleCloseCreateConferenceModal();

            client?.conferences
                .createRoom({
                    title: form.conferenceName,
                    isLobbyEnabled: form.isLobbyEnabled,
                    isGuestEnabled: form.isGuestEnabled,
                    jazzNextOnly: form.jazzNextOnly,
                })
                .then((data) => {
                    setConferenceUrl(data.url)
                    if (!form.connectToConference) {
                        return;
                    }

                    const { id, password } = data;

                    handleConnectToConference({
                        roomId: id,
                        password,
                    });
                })
                .catch((error) => {
                    console.error(error);
                    eventBus({
                        type: 'error',
                        payload: { title: 'Fail create conference' },
                    });
                });
        },
        [
            client,
            eventBus,
            handleConnectToConference,
            handleCloseCreateConferenceModal,
        ],
    );


    const handleLoginBySdkToken = useCallback(() => {
        const newUserName = 'MyUserName';
        const sub = newUserName.replace(' ', '_');
        const iss = 'JazzTestApp';
        if (!client) return

        createSdkToken(key, {
            iss,
            userName: newUserName,
            sub,
        })
            .then(async ({ sdkToken }) => {
                const success = await client.auth.loginBySdkToken(sdkToken);
                if (!success) {
                    eventBus({
                        type: 'error',
                        payload: { title: 'Error login by SDK Secret' },
                    });
                    return;
                }

                loginBySdkToken(client, { iss, sub, userName: newUserName, value: key });

                // sessionStorage.setItem(JAZZ_VALUE, value);

                // handleClose();
            })
            .catch((error) => {
                console.error(error);
                eventBus({
                    type: 'error',
                    payload: { title: 'Error login by SDK Secret' },
                });
            });
    }, [client, key, eventBus, loginBySdkToken]);

    const handleJoin = useCallback(() => {
        if (!client?.auth.isAuthorised.get()) {
            eventBus({
                type: 'error',
                payload: {
                    title: 'To join the conference, you need to sign in',
                },
            });
            return;
        }
        setIsOpenJoinToConferenceModal(true);
    }, [eventBus, client]);

    const handleCloseJoinToConferenceModal = useCallback(() => {
        setIsOpenJoinToConferenceModal(false);
    }, []);



    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(conferenceUrl)
    }, [conferenceUrl])

    return (<Grid display="flex">
        <Button disabled={!client} onClick={() => handleCreate()}>
            Create Room
        </Button>
        {conferenceUrl && <Button onClick={handleCopy}>Copy conferece url</Button>}
        {client && <Button onClick={handleJoin}>Join the meeting</Button>}

        {client && <CreateConferenceModal
            client={client}
            isOpen={isOpenCreateConferenceModal}
            onClose={handleCloseCreateConferenceModal}
            onCreate={handleCreateConference}
        />}

        {client && <JoinToConferenceModal
            isOpen={isOpenJoinToConferenceModal}
            client={client}
            onClose={handleCloseJoinToConferenceModal}
            onJoin={handleConnectToConference}
        />}
    </Grid>)
}