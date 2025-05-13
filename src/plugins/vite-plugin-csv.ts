
import { Plugin } from 'vite';

export function csvPlugin(): Plugin {
  return {
    name: 'vite-plugin-csv',
    transform(code, id) {
      if (!id.endsWith('.csv')) {
        return null;
      }

      // Split CSV into lines and parse
      const lines = code.trim().split('\n');
      const headers = lines[0].split(',');
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header.trim()] = values[index]?.trim() || '';
        });
        return row;
      });

      // Convert to ES module
      return {
        code: `export default ${JSON.stringify(rows)};`,
        map: { mappings: '' }
      };
    }
  };
}
