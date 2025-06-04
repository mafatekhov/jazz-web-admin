import {
    ChangeEvent,
    FC,
    FormEventHandler,
    useCallback,
    useState,
} from 'react';

import { JazzClient } from '@salutejs/jazz-sdk-web';
import { Button, Headline3, Modal, TextField } from '@salutejs/plasma-b2c';
import styled from 'styled-components/macro';

import { useQuery } from '../../../shared/hooks/useQuery';
import {
    validateConferenceForm,
    ValidateReport,
} from '../../../shared/utils/conferenceValidations';

const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
  `;

const ConferenceInfoWrapper = styled.div`
    display: flex;
    gap: 16px;
  `;

export type JoinToConferenceModalForm = {
    password: string;
    roomId: string;
    url?: string;
};

export type JoinToConferenceModalProps = {
    isOpen: boolean;
    client: JazzClient;
    onJoin: (form: JoinToConferenceModalForm) => void;
    onClose: () => void;
};

function getInitialState(): JoinToConferenceModalForm {
    return {
        password: '',
        roomId: '',
        url: '',
    };
}

export const JoinToConferenceModal: FC<JoinToConferenceModalProps> = ({
    isOpen,
    onClose,
    client,
    onJoin,
}) => {
    const [form, setForm] = useState<JoinToConferenceModalForm>(
        getInitialState(),
    );

    const userInfo = useQuery(client.auth.userInfo);

    const [errors, setErrors] = useState<ValidateReport>({});

    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    const handleChangeField = useCallback(
        (
            event: ChangeEvent<HTMLInputElement>,
            field: keyof JoinToConferenceModalForm,
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

            if (field === 'url' && value) {
                try {
                    const urlParsed = new URL(value);
                    const id = urlParsed.pathname.slice(1);
                    const password = urlParsed.searchParams.get('psw') || '';
                    setForm((form) => ({
                        ...form,
                        roomId: id,
                        password,
                    }));
                } catch (error) {
                    setErrors((errors) => ({
                        ...errors,
                        [field]: 'Invalid URL',
                    }));

                }

            }
        },
        [],
    );

    const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
        (event) => {
            event.preventDefault();

            const errors = validateConferenceForm(form);

            if (Object.keys(errors).length) {
                setErrors(errors);
                return;
            }

            onJoin(form);

            handleClose();
        },
        [handleClose, form, onJoin],
    );

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Headline3>Join the meeting</Headline3>

            <StyledForm onSubmit={handleSubmit}>
                <TextField
                    value={userInfo?.name}
                    label="User name"
                    readOnly
                    helperText={errors.userName}
                    status={errors.userName ? 'error' : undefined}
                />
                <ConferenceInfoWrapper>
                    <TextField
                        name="conferenceId"
                        value={form.roomId}
                        label="Conference id"
                        onChange={(event) => handleChangeField(event, 'roomId')}
                        helperText={errors.roomId}
                        status={errors.roomId ? 'error' : undefined}
                    />
                    <TextField
                        value={form.password}
                        name="password"
                        label="Password"
                        onChange={(event) => handleChangeField(event, 'password')}
                        helperText={errors.password}
                        status={errors.password ? 'error' : undefined}
                    />



                </ConferenceInfoWrapper>

                <div style={{ textAlign: 'center' }}>
                    OR
                </div>

                <TextField
                    value={form.url}
                    name="url"
                    label="Link"
                    onChange={(event) => handleChangeField(event, 'url')}
                    helperText={errors.url}
                    status={errors.url ? 'error' : undefined}
                    width={'100%'}
                />


                <Button type="submit" view="primary">
                    Join the meeting
                </Button>
            </StyledForm>
        </Modal>
    );
};
