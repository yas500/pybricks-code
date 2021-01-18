// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

// Saga for managing notifications (toasts)

import {
    IActionProps,
    ILinkProps,
    IToaster,
    IconName,
    Intent,
} from '@blueprintjs/core';
import { Replacements } from '@shopify/react-i18n';
import React from 'react';
import { channel } from 'redux-saga';
import { delay, getContext, put, take, takeEvery } from 'redux-saga/effects';
import {
    BleDeviceActionType,
    BleDeviceDidFailToConnectAction,
    BleDeviceFailToConnectReasonType,
} from '../actions/ble';
import { EditorActionType, reloadProgram } from '../actions/editor';
import {
    BootloaderConnectionActionType,
    BootloaderConnectionDidFailToConnectAction,
    BootloaderConnectionFailureReason,
} from '../actions/lwp3-bootloader';
import { MpyActionType, MpyDidFailToCompileAction } from '../actions/mpy';
import { NotificationActionType, NotificationAddAction } from '../actions/notification';
import { ServiceWorkerActionType } from '../actions/service-worker';
import Notification from '../components/Notification';
import { MessageId } from '../components/notification-i18n';

type NotificationContext = {
    toaster: IToaster;
};

/** Severity level of notification. */
enum Level {
    /** This is an error (requires user action to resolve). */
    Error = 'error',
    /** This is a warning (user could take action or ignore). */
    Warning = 'warning',
    /** This is just FYI (no user action required). */
    Info = 'info',
}

function mapIntent(level: Level): Intent {
    switch (level) {
        case Level.Error:
            return Intent.DANGER;
        case Level.Warning:
            return Intent.WARNING;
        case Level.Info:
            return Intent.PRIMARY;
        default:
            return Intent.NONE;
    }
}

function mapIcon(level: Level): IconName | undefined {
    switch (level) {
        case Level.Error:
            return 'error';
        case Level.Warning:
            return 'warning-sign';
        case Level.Info:
            return 'info-sign';
        default:
            return undefined;
    }
}

/**
 * Converts a URL to an action that can be passed to `IToaster.show()`.
 * @param helpUrl A URL.
 */
function helpAction(helpUrl: string): IActionProps & ILinkProps {
    return {
        icon: 'help',
        href: helpUrl,
        target: '_blank',
    };
}

function dispatchAction(
    messageId: MessageId,
    onClick: (event: React.MouseEvent<HTMLElement>) => void,
    icon?: IconName,
): IActionProps {
    return {
        icon: icon,
        text: React.createElement(Notification, { messageId }),
        onClick,
    };
}

/**
 * Shows a message. If a message with the same `messageId` is already
 * showing, it will be closed before showing the new message.
 * @param level The severity level.
 * @param messageId The translation lookup ID.
 * @param replacements Replacements for the translation string.
 * @param action Optional action to add to the notification.
 * @param onDismiss Optional hook for when notification is dismissed.
 */
function* showSingleton(
    level: Level,
    messageId: MessageId,
    replacements?: Replacements,
    action?: IActionProps & ILinkProps,
    onDismiss?: (didTimeoutExpire: boolean) => void,
): Generator {
    const { toaster } = (yield getContext('notification')) as NotificationContext;

    // if the message is already showing, close it and wait some time so that
    // users can see that something triggered the message again
    if (
        toaster
            .getToasts()
            .map((x) => x.key)
            .includes(messageId)
    ) {
        toaster.dismiss(messageId);
        yield delay(500);
    }

    toaster.show(
        {
            intent: mapIntent(level),
            icon: mapIcon(level),
            message: React.createElement(Notification, { messageId, replacements }),
            timeout: 0,
            action,
            onDismiss,
        },
        messageId,
    );
}

function* showBleDeviceDidFailToConnectError(
    action: BleDeviceDidFailToConnectAction,
): Generator {
    switch (action.reason) {
        case BleDeviceFailToConnectReasonType.NoGatt:
            yield* showSingleton(Level.Error, MessageId.BleGattPermission);
            break;

        case BleDeviceFailToConnectReasonType.NoService:
            yield* showSingleton(Level.Error, MessageId.BleGattServiceNotFound, {
                serviceName: 'Pybricks',
                hubName: 'Pybricks Hub',
            });
            break;
        case BleDeviceFailToConnectReasonType.NoWebBluetooth:
            yield* showSingleton(
                Level.Error,
                MessageId.BleNoWebBluetooth,
                undefined,
                helpAction(
                    'https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md',
                ),
            );
            break;
        case BleDeviceFailToConnectReasonType.Unknown:
            yield* showSingleton(Level.Error, MessageId.BleConnectFailed);
            break;
    }
}

function* showBootloaderDidFailToConnectError(
    action: BootloaderConnectionDidFailToConnectAction,
): Generator {
    switch (action.reason) {
        case BootloaderConnectionFailureReason.GattServiceNotFound:
            yield* showSingleton(Level.Error, MessageId.BleGattServiceNotFound, {
                serviceName: 'LEGO Bootloader',
                hubName: 'LEGO Bootloader',
            });
            break;
        case BootloaderConnectionFailureReason.NoWebBluetooth:
            yield* showSingleton(
                Level.Error,
                MessageId.BleNoWebBluetooth,
                undefined,
                helpAction(
                    'https://github.com/WebBluetoothCG/web-bluetooth/blob/master/implementation-status.md',
                ),
            );
            break;
        case BootloaderConnectionFailureReason.Unknown:
            yield* showSingleton(Level.Error, MessageId.BleConnectFailed);
            break;
    }
}

function* showEditorStorageChanged(): Generator {
    const ch = channel<React.MouseEvent<HTMLElement>>();

    yield* showSingleton(
        Level.Info,
        MessageId.ProgramChanged,
        undefined,
        dispatchAction(MessageId.YesReloadProgram, ch.put, 'tick'),
        ch.close,
    );

    // if the notification is dismissed without clicking on the action, the
    // saga will be cancelled here
    yield take(ch);

    yield put(reloadProgram());
}

function* showCompilerError(action: MpyDidFailToCompileAction): Generator {
    yield* showSingleton(Level.Error, MessageId.MpyError, { errorMessage: action.err });
}

function* addNotification(action: NotificationAddAction): Generator {
    const { toaster } = (yield getContext('notification')) as NotificationContext;

    toaster.show({
        intent: mapIntent(action.level as Level),
        icon: mapIcon(action.level as Level),
        message: action.message,
        timeout: 0,
        action: action.helpUrl ? helpAction(action.helpUrl) : undefined,
    });
}

function* showServiceWorkerUpdate(): Generator {
    yield* showSingleton(
        Level.Info,
        MessageId.ServiceWorkerUpdate,
        undefined,
        helpAction('https://github.com/pybricks/pybricks-code/issues/102'),
    );
}

function* showServiceWorkerSuccess(): Generator {
    yield* showSingleton(Level.Info, MessageId.ServiceWorkerSuccess);
}

export default function* (): Generator {
    yield takeEvery(
        BleDeviceActionType.DidFailToConnect,
        showBleDeviceDidFailToConnectError,
    );
    yield takeEvery(
        BootloaderConnectionActionType.DidFailToConnect,
        showBootloaderDidFailToConnectError,
    );
    yield takeEvery(EditorActionType.StorageChanged, showEditorStorageChanged);
    yield takeEvery(MpyActionType.DidFailToCompile, showCompilerError);
    yield takeEvery(NotificationActionType.Add, addNotification);
    yield takeEvery(ServiceWorkerActionType.DidUpdate, showServiceWorkerUpdate);
    yield takeEvery(ServiceWorkerActionType.DidSucceed, showServiceWorkerSuccess);
}
