// SPDX-License-Identifier: MIT
// Copyright (c) 2020-2021 The Pybricks Authors

import {
    ContextMenuTarget,
    Menu,
    MenuDivider,
    MenuItem,
    ResizeSensor,
} from '@blueprintjs/core';
import { WithI18nProps, withI18n } from '@shopify/react-i18n';
import React from 'react';
import { connect } from 'react-redux';
import { Observable, Unsubscribe } from 'redux';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { Dispatch } from '../actions';
import { receiveData } from '../actions/terminal';
import { RootState } from '../reducers';
import { isMacOS } from '../utils/os';
import { TerminalStringId } from './terminal-i18n';
import en from './terminal-i18n.en.json';

import 'xterm/css/xterm.css';

interface StateProps {
    dataSource: Observable<string> | null;
    darkMode: boolean;
}

interface DispatchProps {
    onData: (data: string) => void;
}

type TerminalProps = StateProps & DispatchProps & WithI18nProps;

@ContextMenuTarget
class Terminal extends React.Component<TerminalProps> {
    private xterm: XTerm;
    private fitAddon: FitAddon;
    private terminalRef: React.RefObject<HTMLDivElement>;
    private subscription?: { unsubscribe: Unsubscribe };

    constructor(props: TerminalProps) {
        super(props);
        this.xterm = new XTerm({
            cursorBlink: true,
            cursorStyle: 'underline',
            fontSize: 18,
        });
        this.fitAddon = new FitAddon();
        this.xterm.loadAddon(this.fitAddon);
        this.xterm.onData((d) => this.props.onData(d));
        this.xterm.attachCustomKeyEventHandler(this.handleKeyEvent);
        this.terminalRef = React.createRef();
    }

    private handleKeyEvent = (e: KeyboardEvent): boolean => {
        if (e.key === 'v' && e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey) {
            // this allows CTRL+V to be handled by the browser instead of sending
            // a control character to the terminal.
            return false;
        }
        if (e.key === 'F5' || e.key === 'F6') {
            // allow global handler for these keys
            return false;
        }
        return true;
    };

    private handleKeyDownEvent = (e: KeyboardEvent): void => {
        // implement CTRL+SHIFT+C keyboard shortcut for copying text from terminal
        if (e.key === 'C' && e.ctrlKey && e.shiftKey && !e.altKey && !e.metaKey) {
            // this would otherwise open up debug console in web browser
            e.preventDefault();

            if (
                document.hasFocus() &&
                document.activeElement ===
                    this.terminalRef.current?.getElementsByClassName(
                        'xterm-helper-textarea',
                    )[0] &&
                this.xterm.hasSelection()
            ) {
                navigator.clipboard.writeText(this.xterm.getSelection());
            }
        }
    };

    componentDidMount(): void {
        if (!this.terminalRef.current) {
            console.error('Missing terminal reference');
            return;
        }
        this.xterm.open(this.terminalRef.current);
        this.fitAddon.fit();
        this.subscription = this.props.dataSource?.subscribe({
            next: (d) => this.xterm.write(d),
        });
        window.addEventListener('keydown', this.handleKeyDownEvent);
    }

    componentWillUnmount(): void {
        window.removeEventListener('keydown', this.handleKeyDownEvent);
        this.subscription?.unsubscribe();
        this.xterm.dispose();
    }

    render(): JSX.Element {
        this.xterm.setOption('theme', {
            background: this.props.darkMode ? 'black' : 'white',
            foreground: this.props.darkMode ? 'white' : 'black',
            cursor: this.props.darkMode ? 'white' : 'black',
            // transparency is needed to work around https://github.com/xtermjs/xterm.js/issues/2808
            selection: this.props.darkMode
                ? 'rgb(81,81,81,0.5)'
                : 'rgba(181,213,255,0.5)', // this should match AceEditor theme
        });
        return (
            <div className="h-100">
                <ResizeSensor onResize={(): void => this.fitAddon.fit()}>
                    <div ref={this.terminalRef} className="h-100" />
                </ResizeSensor>
            </div>
        );
    }

    renderContextMenu(): JSX.Element {
        const { i18n } = this.props;
        return (
            <Menu>
                <MenuItem
                    onClick={(): void => {
                        const selected = this.xterm.getSelection();
                        if (selected) {
                            navigator.clipboard.writeText(selected);
                        }
                    }}
                    text={i18n.translate(TerminalStringId.Copy)}
                    icon="duplicate"
                    label={isMacOS() ? 'Cmd-C' : 'Ctrl-Shift-C'}
                    disabled={!this.xterm.hasSelection()}
                />
                <MenuItem
                    onClick={async (): Promise<void> => {
                        this.xterm.paste(await navigator.clipboard.readText());
                    }}
                    text={i18n.translate(TerminalStringId.Paste)}
                    icon="clipboard"
                    label={isMacOS() ? 'Cmd-V' : 'Ctrl-V'}
                />
                <MenuItem
                    onClick={() => this.xterm.selectAll()}
                    text={i18n.translate(TerminalStringId.SelectAll)}
                    icon="blank"
                />
                <MenuDivider />
                <MenuItem
                    onClick={(): void => this.xterm.clear()}
                    text={i18n.translate(TerminalStringId.Clear)}
                    icon="trash"
                />
            </Menu>
        );
    }

    onContextMenuClose = () => {
        // without this, the terminal looses focus
        this.xterm.focus();
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    dataSource: state.terminal.dataSource,
    darkMode: state.settings.darkMode,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onData: (d): void => {
        dispatch(receiveData(d));
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n({ id: 'terminal', fallback: en, translations: { en } })(Terminal));
