import fs from 'fs';


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

      // Extract assertions from test script
      let expectedStatusCode = 200; // default to 200
      let assertions = [];
      let schema = null;
      if (item.event) {
        item.event.forEach(event => {
          if (event.listen === 'test' && event.script && event.script.exec) {
            const testScript = event.script.exec.join('\n');
            const statusMatch = testScript.match(/pm\.response\.to\.have\.status\((\d+)\)/);
            if (statusMatch) {
              expectedStatusCode = parseInt(statusMatch[1], 10);
            }
            const assertMatches = testScript.match(/pm\.test\("(.*?)",\s*function\s*\(\)\s*{([^}]*)}\);/g);
            if (assertMatches) {
              assertions = assertMatches.map(assertion => {
                // Convert Postman pm.test assertions to Playwright expect assertions
                const matches = assertion.match(/pm\.test\("(.*?)",\s*function\s*\(\)\s*{([^}]*)}\);/);
                const title = matches[1];
                const body = matches[2]
                .replace(/pm\.expect\((.*?)\)\.to\.eql\((.*?)\)/g, 'await expect($1).toBe($2);')
                .replace(/pm\.expect\((.*?)\)\.to\.equal\((.*?)\)/g, 'await expect($1).toBe($2);')
                .replace(/pm\.expect\((.*?)\)\.to\.have\.property\((.*?)\)/g, 'await expect($1).toHaveProperty($2);')
                .replace(/pm\.expect\((.*?)\)\.to\.be\.a\((.*?)\)/g, 'await expect(typeof $1).toBe($2);')
                .replace(/pm\.expect\((.*?)\)\.to\.be\.true/g, 'await expect($1).toBe(true);')
                .replace(/pm\.expect\((.*?)\)\.to\.be\.false/g, 'await expect($1).toBe(false);')
                .replace(/pm\.expect\((.*?)\)\.to\.be\.above\((.*?)\)/g, 'await expect($1 > $2).toBe(true);')
                .replace(/pm\.expect\((.*?)\)\.to\.be\.below\((.*?)\)/g, 'await expect($1 < $2).toBe(true);')
                .replace(/pm\.expect\((.*?)\)\.to\.match\((.*?)\)/g, 'await expect($1).toMatch($2);')
                .replace(/pm\.expect\((.*?)\)\.to\.include\((.*?)\)/g, 'await expect($1).toContain($2);')
                .replace(/pm\.response\.to\.have\.status\((\d+)\)/g, 'await expect(response.status()).toBe($1);')
                .replace(/pm\.response\.to\.have\.header\("(.*?)"\)/g, 'await expect(response.headers()).toHaveProperty("$1");')
                .replace(/pm\.response\.to\.have\.body\("(.*?)"\)/g, 'await expect(await response.text()).toContain("$1");')
                .replace(/pm\.response\.json\(\)\.(.*?)\(\)\)\.to\.eql\((.*?)\)/g, 'await expect((await response.json()).$1).toBe($2);')
                .replace(/pm\.response\.text\(\)\.to\.include\("(.*?)"\)/g, 'await expect(await response.text()).toContain("$1");')
                // Handling nested pm.response inside expect
                .replace(/expect\(pm\.response\.([^)]*)\)/g, 'expect(await response.$1)')
                .replace(/expect\((await response.text\(\)).text\(\)\.toContain\((.*?)\)\)/g, 'await expect($1).toContain($2);')
                .replace(/expect\(await response.json\(\)\.([^)]*)\)/g, 'await expect((await response.json()).$1)');
              return body;
              });
            }

            // Extract JSON schema if defined in the test script
            const schemaMatch = testScript.match(/pm\.response\.json\(\).should\.be\.jsonSchema\(([^)]+)\)/);
            if (schemaMatch) {
              schema = JSON.parse(schemaMatch[1]);
            }
          }
        });
      }

      return {
        name: item.name,
        method: request.method || 'GET',
        url: url.raw || '',
        headers: request.header ? request.header.reduce((acc, header) => {
          acc[header.key] = header.value;
          return acc;
        }, {}) : null,
        body: request.body ? request.body.raw : null,
        expectedStatusCode,
        assertions,
        schema
      };
    });
  };


  // Function to generate test cases
  const generateTestCases = (requests) => {
    const testCases= requests.map(request => {
      const method = request.method.toLowerCase();
      let options = '';

      if (method !== 'get' && method !== 'delete' && (request.headers || request.body)) {
        options = '{';
        if (request.headers) {
          options += `headers: ${JSON.stringify(request.headers)}`;
        }
        if (request.headers && request.body) {
          options += ', ';
        }
        if (request.body) {
          options += `data: \`${request.body.replace(/`/g, '\\`')}\``;
        }
        options += '}';
      }

      const assertions = request.assertions.length > 0 ? request.assertions.join('\n') : `expect(response.status()).toBe(${request.expectedStatusCode});`;

      const schemaValidation = request.schema ? `
        const ajv = new Ajv();
        const validate = ajv.compile(${JSON.stringify(request.schema)});
        const data = await response.json();
        const valid = validate(data);
        expect(valid).toBe(true);
        if (!valid) console.log(validate.errors);
      ` : '';

      return `
        test('${request.name}', async ({ request: context }) => {
          const response = await context.${method}('${request.url}'${options ? `, ${options}` : ''});
          ${assertions}
          ${schemaValidation}
        });
      `;
    }).join('\n');
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
  createTestFile('collections/FakeStore.postman_collection.json', 'tests/FakeStore.postman_collection.spec.js');
})();
