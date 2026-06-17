const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '..', 'frontend', 'src', 'app', '[locale]');

function processDirectory(dir) {
    fs.readdir(dir, (err, files) => {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                processDirectory(filePath);
            } else if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
                let content = fs.readFileSync(filePath, 'utf8');
                
                // Replace classes
                content = content.replace(/bg-\[#060b13\]/g, 'bg-gray-50');
                content = content.replace(/text-white/g, 'text-gray-900');
                content = content.replace(/text-slate-200/g, 'text-gray-700');
                content = content.replace(/text-slate-300/g, 'text-gray-600');
                content = content.replace(/text-slate-400/g, 'text-gray-500');
                content = content.replace(/border-white\/5/g, 'border-gray-200');
                content = content.replace(/border-white\/10/g, 'border-gray-200');
                content = content.replace(/bg-white\/5/g, 'bg-gray-100');
                content = content.replace(/hover:bg-white\/5/g, 'hover:bg-gray-100');
                content = content.replace(/bg-black\/20/g, 'bg-gray-100');
                
                // Replace glass with a crisp white card style
                content = content.replace(/\bglass\b/g, 'bg-white shadow-sm border border-gray-100');
                
                // Fix possible specific hardcoded dark gradients
                content = content.replace(/from-\[#060b13\]/g, 'from-gray-50');
                content = content.replace(/to-\[#060b13\]/g, 'to-gray-50');

                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated ${filePath}`);
            }
        });
    });
}

processDirectory(directoryPath);
