# Speedtest CLI

A small Node.js console script that measures download speed by requesting a URL
ten times sequentially, waiting for each response to finish before starting the
next one.

## Requirements

- Node.js 18 or newer

No third-party dependencies are required.

## Run

```bash
npm start -- <url>
```

Example:

```bash
npm start -- 'https://speed.cloudflare.com/__down?bytes=10000000'
```

You can also call the script directly:

```bash
node speedtest.js 'https://speed.cloudflare.com/__down?bytes=10000000'
```

## Output

Per request, the script prints the amount of data received and how long the
request took. After all ten requests it prints a summary with the average
request time and the download speed.

## Units

- Data: **MB** — decimal megabytes (1 MB = 1,000,000 bytes).
- Time: **s** — seconds.
- Speed: **MB/s** — megabytes per second, with **Mbps** (megabits per second)
  shown alongside for convenience.
