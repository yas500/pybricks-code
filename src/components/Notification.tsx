// SPDX-License-Identifier: MIT
// Copyright (c) 2021 The Pybricks Authors

// provides translation for notification text

import { Replacements, useI18n } from '@shopify/react-i18n';
import React from 'react';
import { MessageId } from './notification-i18n';
import en from './notification-i18n.en.json';

type OwnProps = {
    messageId: MessageId;
    replacements?: Replacements;
};

export default function Notification(props: OwnProps): JSX.Element {
    const [i18n] = useI18n({
        id: 'notification',
        translations: { en },
        fallback: en,
    });
    const { messageId, replacements } = props;
    return <>{i18n.translate(messageId, replacements)}</>;
}
