# Studio control inventory

All controls use native links, buttons, inputs, selects, or TipTap keyboard editing. Focus rings are global to the studio shell.

| Location | Control | Action and state change | Keyboard | Automated coverage |
|---|---|---|---|---|
| Shell | Home, Write, Memory, Review, Timeline, Characters, Settings | Navigates to a real route and updates active state | Tab + Enter | navigation E2E |
| Shell | Project switcher | Explains the bounded one-project fixture | Tab + Enter | dead-control E2E |
| Shell | Search / Cmd+K | Opens filterable command palette | Cmd/Ctrl+K, arrows, Enter, Esc | command E2E |
| Shell | Sign out | Opens keep/reset/cancel dialog | Tab + Enter, Esc | journey E2E |
| Home | Six project cards | Opens the exact record or filtered workspace | Tab + Enter | journey/navigation E2E |
| Home | New scene / Review / Add event | Opens the relevant creation or review route | Tab + Enter | dead-link E2E |
| Write | Scene list | Selects and persists current scene | Tab + Enter | journey E2E |
| Write | Create / rename / reorder scene | Mutates the typed project state | Tab + Enter; text input | journey + persistence tests |
| Write | TipTap editor and toolbar | Edits rich text; bold, italic, strike, heading, undo, redo | Native editor shortcuts + Tab | journey E2E |
| Write | Focus / Inspector | Toggles focused layout and inspector drawer | Tab + Enter | dead-control E2E |
| Write | Purpose, location, characters, notes | Updates scene metadata and inspector | Native form keyboard | journey E2E |
| Write | Continuity review / warning | Reports a completed check or opens evidence | Tab + Enter | journey E2E |
| Memory | Workspace tabs | Changes the selected memory category | Tab + Enter | dead-control E2E |
| Memory | Original evidence / source scene | Reveals cited passage or opens the manuscript | Tab + Enter | journey E2E |
| Memory | Confirm transfer | Atomically updates owner, characters, timeline, issue, and review | Tab + Enter | journey E2E |
| Memory | Revise / intentional / dismiss / reminder / branch | Applies the chosen editorial decision | Tab + Enter | dead-control E2E |
| Memory | Undo resolution | Restores the prior application snapshot | Tab + Enter | journey E2E |
| Characters | Character selector | Opens the selected writer-facing record | Tab + Enter | navigation E2E |
| Characters | Goal / emotion / fact / secret / relationship | Updates the character and change history | Native form keyboard | journey E2E |
| Characters | Related scenes | Opens exact manuscript scene | Tab + Enter | dead-link E2E |
| Review | Category filters | Filters findings, including resolved items | Tab + Enter | navigation E2E |
| Review | Accept / edit / dismiss / intentional / plan | Updates status and global count | Tab + Enter | journey E2E |
| Review | Compare / open scene | Reveals alternatives or opens source | Tab + Enter | dead-control E2E |
| Timeline | Filters / order mode | Filters events or toggles chronology | Native form keyboard | navigation E2E |
| Timeline | Create / select / move / open source | Creates or reorders an event and runs conflict check | Tab + Enter | dead-control E2E |
| Settings | Writing goal | Updates goal feedback | Native form keyboard | dead-control E2E |
| Settings | Reset / restart / clear | Restores or removes the local versioned state | Tab + Enter | persistence + journey E2E |
| Settings | Google integration | Visibly disabled with a demo-mode explanation | Discoverable by keyboard | dead-control E2E |
| Mobile | Menu / bottom navigation / inspector sheet | Opens navigation, routes, and scene details without overflow | Tab + Enter | mobile E2E |
