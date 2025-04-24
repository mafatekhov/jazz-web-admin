import { JazzClient } from "@salutejs/jazz-sdk-web";
import React, { ChangeEvent, FC, FormEventHandler, useCallback, useState } from "react";

import styled from 'styled-components/macro';
import { useQuery } from "../../../shared/hooks/useQuery";
import { Button, Checkbox, FormControlLabel, Grid, Modal, TextField, Typography } from "@mui/material";


const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
`;

const ModalContent = styled(Grid)`
    width: 500px; 
    height: 500px;
    background-color: white;
    padding: 10px;
`

export type CreateConferenceForm = {
    conferenceName: string;
    connectToConference: boolean;
    isLobbyEnabled: boolean;
    isGuestEnabled: boolean;
    jazzNextOnly: boolean;
};

type CreateConferenceModalProps = {
    isOpen: boolean;
    client: JazzClient;
    onClose: () => void;
    onCreate: (form: CreateConferenceForm) => void;
};


export type ErrorReport = string | undefined;
export type ValidateReport = Record<string, ErrorReport>;


function getInitialFormState(): CreateConferenceForm {
    return {
        conferenceName: 'Video meeting',
        connectToConference: true,
        isLobbyEnabled: false,
        isGuestEnabled: true,
        jazzNextOnly: false,
    };
}

export const CreateConferenceModal: FC<CreateConferenceModalProps> = ({
    client,
    isOpen,
    onClose,
    onCreate,
}) => {
    return (
        <Modal open={isOpen} onClose={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Content client={client} onCreate={onCreate} />
        </Modal>
    );
};


const Content: FC<{
    client: JazzClient;
    onCreate: (form: CreateConferenceForm) => void;
}> = ({ client, onCreate }) => {
    const [form, setForm] = useState<CreateConferenceForm>(getInitialFormState());

    const [errors, setErrors] = useState<ValidateReport>({});

    const userInfo = useQuery(client.auth.userInfo);

    const handleChangeField = useCallback(
        (
            event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            field: keyof CreateConferenceForm,
        ) => {
            setErrors((errors) => ({
                ...errors,
                [field]: undefined,
            }));

            const value = event.target.value;

            setForm((form) => ({
                ...form,
                [field]: value,
            }));
        },
        [],
    );

    const handleChangeConnectToConference = useCallback(() => {
        setForm((form) => ({
            ...form,
            connectToConference: !form.connectToConference,
        }));
    }, []);

    const handleEnableLobby = useCallback(() => {
        setForm((form) => ({
            ...form,
            isLobbyEnabled: !form.isLobbyEnabled,
        }));
    }, []);

    const handleEnableGuest = useCallback(() => {
        setForm((form) => ({
            ...form,
            isGuestEnabled: !form.isGuestEnabled,
        }));
    }, []);

    const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
        (event) => {
            event.preventDefault();
            onCreate(form);
        },
        [form, onCreate],
    );

    return (
        <ModalContent>
            <Typography>Create conference</Typography>
            <StyledForm onSubmit={handleSubmit}>
                <TextField
                    value={form.conferenceName}
                    label="Conference name"
                    onChange={(event) => handleChangeField(event, 'conferenceName')}
                    helperText={errors.conferenceName}
                />
                {form.connectToConference && (
                    <TextField
                        value={userInfo?.name}
                        disabled
                        label="User name"
                    />
                )}

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form.connectToConference}
                            onChange={handleChangeConnectToConference}
                        />}
                    label="Connect to conference"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form.isGuestEnabled}
                            onChange={handleEnableGuest}
                        />}
                    label="Enable guest"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={form.isLobbyEnabled}
                            onChange={handleEnableLobby}
                        />}
                    label="Enable lobby"
                />
                <Button type="submit">
                    Create conference
                </Button>
            </StyledForm>
        </ModalContent>
    );
};

