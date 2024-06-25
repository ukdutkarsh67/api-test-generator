# Auto-generation of API Test Cases using Playwright

## Table of Contents

1. [Introduction](#introduction)
2. [Project Overview](#project-overview)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [Learning and Benefits](#learning-and-benefits)
7. [Conclusion](#conclusion)

## Introduction

The "Auto-generation of API Test Cases using Playwright" project aims to streamline the API testing process by automating the generation of test scripts from existing Postman collections. This approach leverages Playwright, an advanced end-to-end testing framework, to execute the tests, ensuring comprehensive and efficient validation of APIs.

## Project Overview

This project provides a solution for automatically converting Postman collections into executable Playwright test scripts. By doing so, it significantly reduces the manual effort involved in writing test cases and ensures consistency in API testing. The generated test scripts can be executed using Playwright, taking advantage of its robust testing capabilities to perform detailed validations.

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```bash
    cd api-test-generator-playwright
    ```
3. Install the required dependencies:
    ```bash
    npm install
    ```

## Usage

1. Ensure your Postman collection files (in JSON format) are placed in the `collections` directory.
2. Run the script to generate Playwright test cases:
    ```bash
    node generateTestCases.js
    ```
3. Run the generated Playwright test cases:
    ```bash
    npx playwright test
    ```

## Project Structure

<img width="509" alt="image" src="https://github.com/ukdutkarsh67/api-test-generator/assets/60280993/bcb0734c-b0de-43e5-9279-c29768ce687c">



### generateTestCases.js

This script is the core of the project, responsible for converting Postman collections into Playwright test scripts.

Key Functions:
- **Read Postman Collections:** Reads JSON files from the `collections` directory.
- **Parse Collection Files:** Extracts API request details, including name, method, URL, headers, and body.
- **Generate Test Scripts:** Creates Playwright test scripts based on the extracted details.
- **Save Test Scripts:** Writes the generated scripts to the `tests` directory with a `.spec.js` extension.

```javascript
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
  createTestFile('ReqResUser.postman_collection.json', 'test/ReqResUser.postman_collection.spec.js');
  createTestFile('PetStore.postman_collection.json', 'test/PetStore.postman_collection.spec.js');
})();


