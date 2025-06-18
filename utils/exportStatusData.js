export function exportStatusData(statusCode) {
    const statusMap = {
      0: 'Allocated',
      1: 'Printed and Published',
      2: 'Brand Activated',
      3: 'User Activated',
      4: 'Lost',
      5: 'Found',
      6: 'Disposed'
    };
  
    const status = statusMap[statusCode] || 'Unknown Status';
   return status
  }
  