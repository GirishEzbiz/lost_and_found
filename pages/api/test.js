import fs from 'fs';
import path from 'path';
import { withMonitorLogger } from 'utils/withMonitorLogger';

 function handler(req, res) {
  const logFilePath = path.join(process.cwd(), 'logs', 'error.log');

  try {
    const fileContent = fs.readFileSync(logFilePath, 'utf-8');
    const lines = fileContent.split('\n').filter(Boolean);

    // Process and structure logs
    const logs = lines.map((line, index) => {
      // Handle JSON-style logs
      if (line.trim().startsWith('{')) {
        try {
          const obj = JSON.parse(line);
          return {
            id: index + 1,
            level: obj.level === 50 ? 'error' : 'info',
            message: obj.message,
            stack: obj.stack,
            function_name: obj.function,
            indate: new Date(obj.time).toISOString(),
          };
        } catch {
          return null;
        }
      }

      // Handle text-style logs
      const match = line.match(/^(.+?) - (\w+) - (.+?) - Stack: (.+?) - Function: (.+)$/);
      if (match) {
        const [, indate, level, message, stack, func] = match;
        return {
          id: index + 1,
          level: level.toLowerCase(),
          message,
          stack,
          function_name: func,
          indate,
        };
      }

      return null;
    }).filter(Boolean);

    res.status(200).json({ data: logs });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ error: 'Unable to read log file' });
    throw error
  }
}
export default withMonitorLogger(handler)