import React, { useCallback, useState } from "react";
import { Button } from "@mui/material"
import { useGlobalContext } from "../../shared/contexts/globalContext";
import { createJazzClient, createSdkToken } from "@salutejs/jazz-sdk-web";
import { firstValueFrom, map } from "rxjs";
import { useClientsContext } from "../../shared/contexts/clientsContext";


//  TODO: move to hook and create client on init, get rid of this component
export const CreateClient = ({ host }: { host: string }) => {
    const { clients$ } = useClientsContext();
    const [hostError, setHostError] = useState('');
    const { sdk } = useGlobalContext();

    const [status, setStatus] = useState<
        'idle' | 'failure' | 'success' | 'pending'
    >('idle');

    const createClient = useCallback(
        async (host: string) => {
            if (!sdk) return;
            setStatus('pending');
            try {
                const jazzClient = await createJazzClient(sdk, {
                    serverUrl: host,
                    authProvider: {
                        handleUnauthorizedError: async ({ loginBySdkToken }) => {
                            const state = await firstValueFrom(
                                clients$.pipe(map((clients) => clients.get(jazzClient))),
                            );
                            if (!state || !state.sdkTokenState) {
                                return 'fail';
                            }

                            const { iss, value, sub, userName } = state.sdkTokenState;
                            try {
                                const { sdkToken } = await createSdkToken(value, {
                                    iss,
                                    userName,
                                    sub,
                                });

                                await loginBySdkToken(sdkToken);

                                return 'retry';
                            } catch (error) {
                                console.log(
                                    'Failed to refresh authenticate by sdk token',
                                    error,
                                );
                                return 'fail';
                            }
                        },
                    },
                });
                console.log('Created JazzClient');
                setStatus('success');
            } catch (error) {
                setStatus('failure');
            }
        },
        [sdk, clients$],
    );


    const handleCreateClient = useCallback(async () => {
        if (!host) {
            setHostError('host is empty');
            return;
        }

        await createClient(host);
    }, [host, createClient]);

    const handleSubmit = useCallback(
        (event: any) => {
            handleCreateClient();
        },
        [handleCreateClient],
    );

    return (
        <Button onClick={(e) => handleSubmit(e)}>
            Create Client
        </Button>
    )
}