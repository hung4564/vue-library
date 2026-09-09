const fs = require('fs');
const path = 'libs/map-core/map-dataset/src/public-api.spec.ts';
let s = fs.readFileSync(path, 'utf8');
// Normalize weird \r\r\n to \n
s = s.replace(/\r\r\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

if (!s.includes('buildCreateControlLoadedSource')) {
  s = s.replace(
    "'assertCreateControlFileSize',\n  'detectGisFormat',",
    "'assertCreateControlFileSize',\n  'buildCreateControlLoadedSource',\n  'detectGisFormat',",
  );
}
if (!s.includes('shortenCreateControlUrl')) {
  s = s.replace(
    "'reportCreateLayerError',\n  'sniffGisText',",
    "'reportCreateLayerError',\n  'shortenCreateControlUrl',\n  'sniffGisText',",
  );
}
if (!s.includes('summarizeCreateControlGeojson')) {
  s = s.replace(
    "'suggestLayerName',\n  ],",
    "'suggestLayerName',\n  'summarizeCreateControlGeojson',\n  ],",
  );
}

fs.writeFileSync(path, s);
console.log({
  build: s.includes('buildCreateControlLoadedSource'),
  short: s.includes('shortenCreateControlUrl'),
  sum: s.includes('summarizeCreateControlGeojson'),
  lines: s.split('\n').length,
});
