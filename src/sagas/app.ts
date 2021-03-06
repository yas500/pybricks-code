// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

import { call, takeEvery } from 'typed-redux-saga/macro';
import { AppActionType } from '../actions/app';

function* reload(): Generator {
    // unregister the service worker so that when the page reloads, it uses
    // the new version
    const registrations = yield* call(() => navigator.serviceWorker.getRegistrations());

    for (const r of registrations) {
        yield* call(() => r.unregister());
    }

    location.reload();
}

export default function* app(): Generator {
    yield* takeEvery(AppActionType.Reload, reload);
}
