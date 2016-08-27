# SnoozeMe

A simple way to snooze chrome tabs for later enjoyment.

To build for local dev:
`npm install`
`npm run dev` This will build everything in `dev/`
Navigate to `chrome://extensions`, click `Load unpacked extension...`, select the `dev/` folder and you should be all set.

To build for prod:
`npm run build`
`Pack extension...` in `chrome://extensions` choosing the `build/` directory
