import fs from 'fs';

const indexHtmlPath = './index.html';

const content = fs.readFileSync(indexHtmlPath, 'utf8');

const newContent = content.replace(/<script>.+?<\/script>/gsm, `<script>
      const server = "localhost";
      const port = 8090;
      const protocol = window.location.protocol;
      const wsProtocol = protocol === 'https' ? 'wss' : 'ws';
      window.expertMatcherConfig = {
        websocketUrl: \`\${wsProtocol}://\${server}:\${port}\`,
        reportUrl: \`\${protocol}//\${server}:\${port}\`,
      };
    </script>
`);

fs.writeFileSync(indexHtmlPath, newContent);