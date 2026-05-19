/**
 * react-native-svg 15.15.x uses yoga::StyleSizeLength; RN 0.76 Yoga only has StyleLength.
 */
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-svg',
  'common',
  'cpp',
  'react',
  'renderer',
  'components',
  'rnsvg',
  'RNSVGLayoutableShadowNode.cpp',
);

if (!fs.existsSync(file)) {
  process.exit(0);
}

const src = fs.readFileSync(file, 'utf8');
if (!src.includes('StyleSizeLength')) {
  process.exit(0);
}

fs.writeFileSync(
  file,
  src.replace(/yoga::StyleSizeLength/g, 'yoga::StyleLength'),
);
