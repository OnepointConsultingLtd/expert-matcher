import fs from 'fs';

const indexHtmlPath = './index.html';

const content = fs.readFileSync(indexHtmlPath, 'utf8');

const newContent = content.replace(/<script>.+?<\/script>/gsm, `<script>
      const server = "expertmatcher.onepointltd.ai";
      const port = 443;
      const protocol = 'https'
      const wsProtocol = protocol === 'https:' ? 'wss' : 'ws';
      window.expertMatcherConfig = {
        websocketUrl: \`\${wsProtocol}://\${server}:\${port}\`,
        reportUrl: \`\${protocol}//\${server}:\${port}\`,
      };
    </script>
`);

fs.writeFileSync(indexHtmlPath, newContent);