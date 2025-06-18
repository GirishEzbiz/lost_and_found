// ✅ 1. Logger Utility Wrapper
// utils/withMonitorLogger.js

export function withMonitorLogger(handler) {
    return async (req, res) => {
      const start = Date.now();
      let error = null;
  
      try {
        await handler(req, res);
      } catch (err) {
        error = err.message;
        res.status(500).json({ error: 'Internal Server Error' });
      } finally {
        const duration = Date.now() - start;
  
        const log = {
          method: req.method,
          url: req.url,
          status: res.statusCode || 500,
          type: error ? 'error' : duration > 3000 ? 'slow' : 'normal',
          duration,
          error,
          timestamp: new Date().toISOString(),
        };
  
        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/admin/monitorLogger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log),
          });
        } catch (err) {
          console.error('Failed to log:', err);
        }
      }
    };
  }
  