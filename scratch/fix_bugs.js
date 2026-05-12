const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function fixFile(filename, replacements) {
    const filepath = path.join(root, filename);
    if (!fs.existsSync(filepath)) {
        console.log(`File not found: ${filename}`);
        return;
    }
    let content = fs.readFileSync(filepath, 'utf8');
    replacements.forEach(rep => {
        content = content.split(rep.target).join(rep.replacement);
    });
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Fixed ${filename}`);
}

// Fix membership.html
fixFile('membership.html', [
    {
        target: 'class="auth-form active ajax-form" class="ajax-form"',
        replacement: 'class="auth-form active ajax-form"'
    }
]);

// Fix dashboard.html
fixFile('dashboard.html', [
    {
        target: 'style="background: var(--yellow);"" color: black;"',
        replacement: 'style="background: var(--yellow); color: black;"'
    }
]);

// Fix chatbot.js variable naming (optional but cleaner)
fixFile('js/chatbot.js', [
    {
        target: 'const window = document.getElementById(\'chatbotWindow\');',
        replacement: 'const chatWindow = document.getElementById(\'chatbotWindow\');'
    },
    {
        target: 'window.classList.toggle(\'active\');',
        replacement: 'chatWindow.classList.toggle(\'active\');'
    },
    {
        target: 'window.classList.contains(\'active\');',
        replacement: 'chatWindow.classList.contains(\'active\');'
    },
    {
        target: 'window.classList.remove(\'active\');',
        replacement: 'chatWindow.classList.remove(\'active\');'
    }
]);
