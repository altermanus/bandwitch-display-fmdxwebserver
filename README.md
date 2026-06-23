# Bandwidth Display Plugin for FM-DX Webserver

A simple, clean widget plugin for [FM-DX Webserver](https://github.com/NoobishSVK/fm-dx-webserver) that displays the actual IF bandwidth currently applied by the tuner in real time.

Works correctly in both **Auto** and **manual** bandwidth modes — always shows the real bandwidth value in kHz (e.g. 56, 114, 236), not just "Auto".

## Screenshot

<img width="155" height="95" alt="image" src="https://github.com/user-attachments/assets/a9061556-7f89-4d46-bec3-67a2a849ef14" />


## Requirements

- FM-DX Webserver **v1.2.0 or newer**
- A TEF668x-based receiver (tested with PE5PVB / Konrad firmware)

## Installation

1. Download `bw-display.js` from this repository.
2. Copy `bw-display.js` into the `plugins/` folder of your FM-DX Webserver installation.
3. Restart FM-DX Webserver.
4. Log in to the **Administrator Panel** and enable the plugin.

That's it — the widget will appear in the bottom-right corner of the web interface.

## Usage

- The widget displays the current IF bandwidth in **kHz**.
- In **Auto mode**, it still shows the actual bandwidth selected by the tuner (e.g. `236 kHz`), not a generic "Auto" label.
- The widget is **draggable** — click and drag it anywhere on the screen. Its position is remembered until the page is refreshed.

## How it works

The plugin reads the `sigRaw` field from the `window.parsedData` object, which is updated by the webserver in real time via WebSocket. The last comma-separated value in `sigRaw` contains the actual IF bandwidth applied by the tuner.

Example: `"Ss33.3,4,4,236"` → **236 kHz**

## Supported bandwidth values

The TEF tuner supports the following IF bandwidth steps (in kHz):

`56, 64, 72, 84, 97, 114, 133, 151, 168, 184, 200, 217, 236, 254, 287, 311`

## License

MIT License — free to use, modify and share.

## Author

Created by altermanus, with assistance from Claude (Anthropic).
