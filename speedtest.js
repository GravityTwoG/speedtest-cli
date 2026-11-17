'use strict';

const http = require('node:http');
const https = require('node:https');
const { performance } = require('node:perf_hooks');

const REQUEST_COUNT = 10;
const MAX_REDIRECTS = 5;
const BYTES_PER_MB = 1_000_000;

function download(url, redirectsLeft = MAX_REDIRECTS) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;

    const request = client.get(url, (response) => {
      const { statusCode, headers } = response;

      if (statusCode >= 300 && statusCode < 400 && headers.location) {
        response.resume();
        if (redirectsLeft === 0) {
          reject(new Error('Too many redirects'));
          return;
        }
        const nextUrl = new URL(headers.location, url).toString();
        resolve(download(nextUrl, redirectsLeft - 1));
        return;
      }

      if (statusCode < 200 || statusCode >= 300) {
        response.resume();
        reject(new Error(`Unexpected status code: ${statusCode}`));
        return;
      }

      let bytes = 0;
      response.on('data', (chunk) => {
        bytes += chunk.length;
      });
      response.on('end', () => resolve(bytes));
      response.on('error', reject);
    });

    request.on('error', reject);
  });
}

function formatBytes(bytes) {
  return `${(bytes / BYTES_PER_MB).toFixed(2)} MB`;
}

function measure(url, count) {
  const timings = [];
  let totalBytes = 0;

  return (async () => {
    for (let i = 0; i < count; i++) {
      const startedAt = performance.now();
      const bytes = await download(url);
      const elapsedMs = performance.now() - startedAt;

      timings.push(elapsedMs);
      totalBytes += bytes;
      console.log(`Request ${i + 1}/${count}: ${formatBytes(bytes)} in ${(elapsedMs / 1000).toFixed(2)} s`);
    }

    return { timings, totalBytes };
  })();
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

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
