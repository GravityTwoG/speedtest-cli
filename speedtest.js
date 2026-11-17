'use strict';

const { performance } = require('node:perf_hooks');

const REQUEST_COUNT = 10;
const BYTES_PER_MB = 1_000_000;

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

async function main() {
  const url = parseArguments(process.argv);

  console.log(`Testing ${url} with ${REQUEST_COUNT} sequential requests\n`);

  const { timings, totalBytes } = await measure(url, REQUEST_COUNT);
  const totalSeconds = timings.reduce((sum, ms) => sum + ms, 0) / 1000;
  const averageSeconds = totalSeconds / timings.length;
  const bytesPerSecond = totalBytes / totalSeconds;

  console.log('\n--- Results ---');
  console.log(`Requests:         ${timings.length}`);
  console.log(`Total downloaded: ${formatBytes(totalBytes)}`);
  console.log(`Total time:       ${totalSeconds.toFixed(2)} s`);
  console.log(`Average time:     ${averageSeconds.toFixed(2)} s`);
  console.log(`Download speed:   ${(bytesPerSecond / BYTES_PER_MB).toFixed(2)} MB/s`);
  console.log(`                  ${((bytesPerSecond * 8) / BYTES_PER_MB).toFixed(2)} Mbps`);
}

function parseArguments(argv) {
  const url = argv[2];
  if (!url) {
    throw new Error('Missing URL. Usage: npm start -- <url>');
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only http and https URLs are supported');
  }

  return url;
}

async function measure(url, count) {
  const timings = [];
  let totalBytes = 0;

  for (let i = 0; i < count; i++) {
    const startedAt = performance.now();
    const bytes = await download(url);
    const elapsedMs = performance.now() - startedAt;

    timings.push(elapsedMs);
    totalBytes += bytes;
    console.log(`Request ${i + 1}/${count}: ${formatBytes(bytes)} in ${(elapsedMs / 1000).toFixed(2)} s`);
  }

  return { timings, totalBytes };
}

async function download(url) {
  const response = await fetch(url);

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Unexpected status code: ${response.status}`);
  }

  let bytes = 0;
  if (response.body) {
    for await (const chunk of response.body) {
      bytes += chunk.length;
    }
  }

  return bytes;
}

function formatBytes(bytes) {
  return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`;
}
