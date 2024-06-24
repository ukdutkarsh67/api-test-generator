import fs from 'fs';
import path from 'path';

(async () => {
  // Function to read and parse Postman collection JSON file
  const readCollection = (filePath) => {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  };

  // Function to parse the collection to extract requests
  const parseRequests = (collection) => {
    return collection.item.map(item => {
      const request = item.request || {};
      const url = request.url || {};
      return {
        name: item.name,
        method: request.method || 'GET',
        url: url.raw || '',
        headers: request.header ? request.header.reduce((acc, header) => {
          acc[header.key] = header.value;
          return acc;
        }, {}) : {},
        body: request.body ? request.body.raw : null
      };
    });
  };

  // Function to generate test cases
  const generateTestCases = (requests) => {
    const testCases = requests.map(request => `
      test('${request.name}', async ({ request: context }) => {
        const response = await context.${request.method.toLowerCase()}('${request.url}', {
          headers: ${JSON.stringify(request.headers)},
          data: ${request.body ? JSON.stringify(request.body) : null}
        });
        expect(response.status()).toBe(200);
      });
    `).join('\n');
    
    return `import { test, expect } from '@playwright/test';\n${testCases}`;
  };

  // Function to create test file from Postman collection
  const createTestFile = (collectionPath, outputPath) => {
    const collection = readCollection(collectionPath);
    const requests = parseRequests(collection);
    const testCases = generateTestCases(requests);
    fs.writeFileSync(outputPath, testCases);
    console.log(`Test cases generated successfully in ${outputPath}`);
  };

  // Example usage
  createTestFile('collections/ReqResUser.postman_collection.json', 'tests/ReqResUser.postman_collection.spec.js');
  createTestFile('collections/PetStore.postman_collection.json', 'tests/PetStore.postman_collection.spec.js');
})();
