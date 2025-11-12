const fs = require('fs');
const path = require('path');

// Components to update
const components = [
  'PdfCompressor.tsx',
  'PdfRotation.tsx',
  'PdfToImages.tsx',
  'ImagesToPdf.tsx',
  'PdfPageNumbers.tsx',
  'PdfWatermark.tsx',
  'PdfResize.tsx',
  'PdfReorder.tsx'
];

// Color mapping replacements
const replacements = [
  // Container backgrounds
  { from: /className="min-h-screen bg-gradient-to-br from-\w+-\d+ to-\w+-\d+ p-8"/g, to: 'className="min-h-screen bg-transparent p-4 sm:p-6 lg:p-8"' },
  
  // Main card
  { from: /className="bg-white rounded-lg shadow-xl p-8"/g, to: 'className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl border border-green-500/20 p-6 sm:p-8"' },
  
  // Titles
  { from: /className="text-3xl font-bold text-gray-800 mb-6"/g, to: 'className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2"' },
  { from: /className="text-2xl font-bold text-gray-800/g, to: 'className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent' },
  
  // Text colors
  { from: /text-gray-800/g, to: 'text-gray-100' },
  { from: /text-gray-700/g, to: 'text-green-400' },
  { from: /text-gray-600/g, to: 'text-gray-300' },
  { from: /text-gray-500/g, to: 'text-gray-400' },
  
  // Backgrounds
  { from: /bg-gray-50\b/g, to: 'bg-gradient-to-r from-gray-800 to-gray-900' },
  { from: /bg-gray-100\b/g, to: 'bg-gray-800/50' },
  
  // Borders
  { from: /border-gray-200/g, to: 'border-green-500/20' },
  { from: /hover:border-\w+-300/g, to: 'hover:border-green-500/40' },
  
  // Buttons - various colors to green
  { from: /bg-indigo-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-indigo-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-purple-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-purple-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-green-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-green-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-orange-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-orange-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-blue-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-blue-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-cyan-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-cyan-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-teal-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-teal-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-pink-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-pink-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  { from: /bg-violet-600/g, to: 'bg-gradient-to-r from-green-500 to-emerald-600' },
  { from: /hover:bg-violet-700/g, to: 'hover:from-green-400 hover:to-emerald-500' },
  
  // Button text
  { from: /(\bfrom-green-500 to-emerald-600[^"]*)">\s*{isMerging/g, to: '$1 text-black font-bold shadow-lg shadow-green-500/30">\n              {isMerging' },
  { from: /text-white font-semibold/g, to: 'text-black font-bold' },
  { from: /text-white font-medium/g, to: 'text-black font-semibold' },
  
  // File inputs
  { from: /file:bg-\w+-50 file:text-\w+-700/g, to: 'file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 file:text-black file:shadow-lg file:shadow-green-500/30' },
  { from: /hover:file:bg-\w+-100/g, to: 'hover:file:from-green-400 hover:file:to-emerald-500' },
  
  // Info boxes
  { from: /bg-blue-50 rounded-lg border border-blue-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-purple-50 rounded-lg border border-purple-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-green-50 rounded-lg border border-green-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-orange-50 rounded-lg border border-orange-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-cyan-50 rounded-lg border border-cyan-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-pink-50 rounded-lg border border-pink-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-teal-50 rounded-lg border border-teal-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-violet-50 rounded-lg border border-violet-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  { from: /bg-indigo-50 rounded-lg border border-indigo-200/g, to: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30' },
  
  // Info text
  { from: /text-blue-800/g, to: 'text-green-400' },
  { from: /text-purple-800/g, to: 'text-green-400' },
  { from: /text-orange-800/g, to: 'text-green-400' },
  { from: /text-cyan-800/g, to: 'text-green-400' },
  { from: /text-teal-800/g, to: 'text-green-400' },
  { from: /text-pink-800/g, to: 'text-green-400' },
  { from: /text-violet-800/g, to: 'text-green-400' },
  { from: /text-indigo-800/g, to: 'text-green-400' },
  
  { from: /text-blue-700/g, to: 'text-gray-300' },
  { from: /text-purple-700/g, to: 'text-gray-300' },
  { from: /text-orange-700/g, to: 'text-gray-300' },
  { from: /text-cyan-700/g, to: 'text-gray-300' },
  { from: /text-teal-700/g, to: 'text-gray-300' },
  { from: /text-pink-700/g, to: 'text-gray-300' },
  { from: /text-violet-700/g, to: 'text-gray-300' },
  { from: /text-indigo-700/g, to: 'text-gray-300' },
  
  // Disabled states
  { from: /disabled:bg-gray-300/g, to: 'disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500' },
  
  // Rounded corners
  { from: /\brounded-lg\b/g, to: 'rounded-xl' },
  { from: /\brounded-md\b/g, to: 'rounded-lg' },
];

function updateComponent(componentPath) {
  try {
    let content = fs.readFileSync(componentPath, 'utf8');
    let changesMade = 0;
    
    replacements.forEach(({from, to}) => {
      const before = content;
      content = content.replace(from, to);
      if (content !== before) changesMade++;
    });
    
    if (changesMade > 0) {
      fs.writeFileSync(componentPath, content, 'utf8');
      console.log(`✅ Updated ${path.basename(componentPath)} (${changesMade} replacements)`);
      return true;
    } else {
      console.log(`⏭️  Skipped ${path.basename(componentPath)} (no changes needed)`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${path.basename(componentPath)}:`, error.message);
    return false;
  }
}

console.log('🎨 Starting PDFMatrix Theme Update...\n');

const componentsDir = path.join(__dirname, 'frontend', 'src', 'components');
let updated = 0;

components.forEach(component => {
  const componentPath = path.join(componentsDir, component);
  if (fs.existsSync(componentPath)) {
    if (updateComponent(componentPath)) updated++;
  } else {
    console.log(`⚠️  File not found: ${component}`);
  }
});

console.log(`\n🎉 Theme update complete! Updated ${updated}/${components.length} components`);
console.log('\n📝 Note: You may need to manually adjust some spacing and add component descriptions.');
console.log('💡 Run the dev server to see the new black & green theme!');
