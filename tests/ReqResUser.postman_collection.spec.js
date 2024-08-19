import { test, expect } from '@playwright/test';

        test('create_user', async ({ request: context }) => {
          const response = await context.post('https://reqres.in/api/users', {headers: {}, data: `{
    "name": "morpheus",
    "job": "leader"
}`});
          
 pm.expect(await response.code).to.be.oneOf([200, 201]);


    await expect(response.status()).toBe(201);;


    await expect(response.headers()).toHaveProperty("content-type","application/json; charset=utf-8");

          
        });
      

        test('get_user', async ({ request: context }) => {
          const response = await context.get('https://reqres.in/api/users/2');
          
    await expect(await response.text()).toContain("name");;


    await expect(await response.text()).toContain("first_name");;


    await expect(response.headers()).toHaveProperty("content-type","application/json; charset=utf-8");

          
        });
      

        test('update_userData', async ({ request: context }) => {
          const response = await context.put('https://reqres.in/api/users/2', {headers: {}, data: `{
    "name": "morpheuss",
    "job": "zion res"
}`});
          
    await expect(response.status()).toBe(200);;


    await expect(response.headers()).toHaveProperty("content-type","application/json; charset=utf-8");

          
        });
      

        test('Delete Request', async ({ request: context }) => {
          const response = await context.delete('https://reqres.in/api/users/2');
          
    await expect(response.status()).toBe(204);;

          
        });
      