import { test, expect } from '@playwright/test';

      test('creating a user', async ({ request: context }) => {
        const response = await context.post('https://petstore.swagger.io/v2/user', {
          headers: {},
          data: "{\r\n  \"id\": {{$randomInt}},\r\n  \"username\": \"{{$randomUserName}}\",\r\n  \"firstName\": \"{{$randomFirstName}}\",\r\n  \"lastName\": \"{{$randomLastName}}\",\r\n  \"email\": \"{{$randomEmail}}\",\r\n  \"password\": \"{{$randomPassword}}\",\r\n  \"phone\": \"{{$randomPhoneNumber}}\",\r\n  \"userStatus\": 1\r\n}"
        });
        expect(response.status()).toBe(200);
      });
    

      test('get user data by username', async ({ request: context }) => {
        const response = await context.get('https://petstore.swagger.io/v2/user/{{username}}', {
          headers: {"Content-Type":"application/xml"},
          data: null
        });
        expect(response.status()).toBe(200);
      });
    

      test('update user data', async ({ request: context }) => {
        const response = await context.put('https://petstore.swagger.io/v2/user/raj', {
          headers: {},
          data: "{\r\n  \"id\": 101,\r\n  \"username\": \"raj\",\r\n  \"firstName\": \"rajat\",\r\n  \"lastName\": \"dubey\",\r\n  \"email\": \"raj@gmail.com\",\r\n  \"password\": \"raj123\",\r\n  \"phone\": \"1234567890\",\r\n  \"userStatus\": 1\r\n}"
        });
        expect(response.status()).toBe(200);
      });
    

      test('get user', async ({ request: context }) => {
        const response = await context.get('https://petstore.swagger.io/v2/user/raj', {
          headers: {},
          data: null
        });
        expect(response.status()).toBe(200);
      });
    

      test('delete user', async ({ request: context }) => {
        const response = await context.delete('https://petstore.swagger.io/v2/user/raj', {
          headers: {},
          data: null
        });
        expect(response.status()).toBe(200);
      });
    