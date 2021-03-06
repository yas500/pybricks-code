// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors
// File: actions/app.ts
// Actions for the app in general.

import { Action } from 'redux';

/** App action types. */
export enum AppActionType {
    /** Reload the app. */
    Reload = 'app.action.reload',
    /** The app has just ben started. */
    DidStart = 'app.action.didStart',
    /** Open settings dialog. */
    OpenSettings = 'app.action.openSettings',
    /** Close settings dialog. */
    CloseSettings = 'app.action.closeSettings',
    /** Open about dialog. */
    OpenAboutDialog = 'app.action.openAboutDialog',
    /** Close about dialog. */
    CloseAboutDialog = 'app.action.closeAboutDialog',
    /** Open license dialog. */
    OpenLicenseDialog = 'app.action.openLicenseDialog',
    /** Close license dialog. */
    CloseLicenseDialog = 'app.action.closeLicenseDialog',
}

/** Action that requests the app to reload. */
export type AppReloadAction = Action<AppActionType.Reload>;

/** Creates an action that requests the app to reload. */
export function reload(): AppReloadAction {
    return { type: AppActionType.Reload };
}

/** Action that indicates the app has just started. */
export type AppDidStartAction = Action<AppActionType.DidStart>;

/** Creates an action that indicates the app has just started. */
export function didStart(): AppDidStartAction {
    return { type: AppActionType.DidStart };
}

/** Action to open the settings dialog. */
export type AppOpenSettingsAction = Action<AppActionType.OpenSettings>;

/** Creates an action to open the settings dialog. */
export function openSettings(): AppOpenSettingsAction {
    return { type: AppActionType.OpenSettings };
}

/** Action to close the settings dialog. */
export type AppCloseSettingsAction = Action<AppActionType.CloseSettings>;

/** Creates an action to close the settings dialog. */
export function closeSettings(): AppCloseSettingsAction {
    return { type: AppActionType.CloseSettings };
}

/** Action to open the about dialog. */
export type AppOpenAboutDialogAction = Action<AppActionType.OpenAboutDialog>;

/** Creates an action to open the about dialog. */
export function openAboutDialog(): AppOpenAboutDialogAction {
    return { type: AppActionType.OpenAboutDialog };
}

/** Action to close the about dialog. */
export type AppCloseAboutDialogAction = Action<AppActionType.CloseAboutDialog>;

/** Creates an action to close the about dialog. */
export function closeAboutDialog(): AppCloseAboutDialogAction {
    return { type: AppActionType.CloseAboutDialog };
}

/** Action to open the license dialog. */
export type AppOpenLicenseDialogAction = Action<AppActionType.OpenLicenseDialog>;

/** Creates an action to open the license dialog. */
export function openLicenseDialog(): AppOpenLicenseDialogAction {
    return { type: AppActionType.OpenLicenseDialog };
}

/** Action to close the license dialog. */
export type AppCloseLicenseDialogAction = Action<AppActionType.CloseLicenseDialog>;

/** Creates an action to close the license dialog. */
export function closeLicenseDialog(): AppCloseLicenseDialogAction {
    return { type: AppActionType.CloseLicenseDialog };
}

/** common type for all app actions. */
export type AppAction =
    | AppReloadAction
    | AppDidStartAction
    | AppOpenSettingsAction
    | AppCloseSettingsAction
    | AppOpenAboutDialogAction
    | AppCloseAboutDialogAction
    | AppOpenLicenseDialogAction
    | AppCloseLicenseDialogAction;
