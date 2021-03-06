// SPDX-License-Identifier: MIT
// Copyright (c) 2020 The Pybricks Authors

import { Button, Intent, Position, Tooltip } from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { tooltipDelay } from '../settings/ui';
import { TooltipId } from './button-i18n';
import en from './button-i18n.en.json';

export interface LinkButtonProps {
    /** A unique id for each instance. */
    readonly id: string;
    /** The URL to open. */
    readonly url: string;
    /** Tooltip text that appears when hovering over the button. */
    readonly tooltip: TooltipId;
    /** Icon shown on the button. */
    readonly icon: string;
    /** When true or undefined, the button is enabled. */
    readonly enabled?: boolean;
}

type Props = LinkButtonProps & WithI18nProps;

class LinkButton extends React.Component<Props> {
    render(): JSX.Element {
        return (
            <Tooltip
                content={this.props.i18n.translate(this.props.tooltip)}
                position={Position.BOTTOM}
                hoverOpenDelay={tooltipDelay}
            >
                <Button
                    intent={Intent.PRIMARY}
                    disabled={this.props.enabled === false}
                    className="no-box-shadow"
                    style={
                        this.props.enabled === false
                            ? { pointerEvents: 'none' }
                            : undefined
                    }
                >
                    <a href={this.props.url} target="_blank" rel="noopener noreferrer">
                        <img src={this.props.icon} alt={this.props.id} />
                    </a>
                </Button>
            </Tooltip>
        );
    }
}

export default withI18n({ id: 'linkButton', fallback: en, translations: { en } })(
    LinkButton,
);
