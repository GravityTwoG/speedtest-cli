# Speedtest CLI

A small Node.js console script that measures download speed by requesting a URL
ten times sequentially, waiting for each response to finish before starting the
next one.

It reports the average time per request, the total number of downloaded bytes,
and the resulting download speed.

## Requirements

- Node.js 18 or newer

No third-party dependencies are required.

## Run

```bash
npm start -- <url>
```

Example:

```bash
npm start -- https://example.com/large-image.jpg
```

You can also call the script directly:

```bash
node speedtest.js https://example.com/large-image.jpg
```

## Output

Per request, the script prints the amount of data received and how long the
request took. After all ten requests it prints a summary with the average
request time and the download speed.

## Units

- Downloaded data: **MB**, decimal megabytes (1 MB = 1,000,000 bytes).
- Average request time: **seconds (s)**.
- Download speed: **MB/s**, decimal megabytes per second (bytes per second
  divided by 1,000,000). A megabit-per-second value ("Mbps", 1 Mbit = 1,000,000
  bits) is shown next to it for convenience.
