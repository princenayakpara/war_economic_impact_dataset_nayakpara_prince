const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) filelist.push(dirFile);
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'frontend/src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix SVG fill
  content = content.replace(/<text ([^>]*)className="([^"]*)"([^>]*)>/g, '<text $1className="$2" fill="currentColor"$3>');

  // Fix Light/Dark mode classes safely
  // Ensure we don't duplicate dark: prefix if it already exists.
  const replaceSafe = (find, replace) => {
    // Only replace if not already preceded by dark: or already followed by dark version
    const regex = new RegExp(`(?<!dark:)(?<!\\w-)${find}(?!\\w)`, 'g');
    content = content.replace(regex, replace);
  };

  replaceSafe('text-white', 'text-slate-900 dark:text-white');
  replaceSafe('text-slate-400', 'text-slate-500 dark:text-slate-400');
  replaceSafe('text-slate-300', 'text-slate-700 dark:text-slate-300');
  replaceSafe('text-slate-200', 'text-slate-800 dark:text-slate-200');
  
  replaceSafe('bg-slate-950', 'bg-slate-50 dark:bg-slate-950');
  replaceSafe('bg-slate-900', 'bg-white dark:bg-slate-900');
  replaceSafe('bg-slate-850', 'bg-slate-50 dark:bg-slate-850');
  replaceSafe('bg-slate-800', 'bg-slate-100 dark:bg-slate-800');
  
  replaceSafe('border-slate-800', 'border-slate-200 dark:border-slate-800');
  replaceSafe('border-slate-850', 'border-slate-200 dark:border-slate-850');

  // Specific background fixes
  content = content.replace(/bg-gradient-to-r from-slate-900 via-slate-850 to-purple-950/g, 'bg-gradient-to-r from-white via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-850 dark:to-purple-950');
  content = content.replace(/border border-purple-500\/20/g, 'border border-purple-500/10 dark:border-purple-500/20');

  fs.writeFileSync(file, content);
});

console.log("Replaced tailwind classes successfully.");
