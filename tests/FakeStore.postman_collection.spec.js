import { test, expect } from '@playwright/test';

        test('Get all products', async ({ request: context }) => {
          const response = await context.get('https://fakestoreapi.com/products');
          
    await expect(response.status()).toBe(200);;

          
        });
      

        test('Get a single product', async ({ request: context }) => {
          const response = await context.get('https://fakestoreapi.com/products/1');
          
    await expect(response.status()).toBe(200);;

          
        });
      

        test('Add new product', async ({ request: context }) => {
          const response = await context.post('https://fakestoreapi.com/products', {headers: {}, data: `{"title": "test product",
                    "price": 13.5,
                    "description": "lorem ipsum set",
                    "image": "https://i.pravatar.cc",
                    "category": "electronic"}`});
          
    await expect(response.status()).toBe(200);;


    
    await await expect((await response.json()).id).toBe(21);;


    await expect(response.headers()).toHaveProperty("content-type");;

          
        });
      

        test('Update a product', async ({ request: context }) => {
          const response = await context.put('https://fakestoreapi.com/products/7', {headers: {}, data: `{"title": "test product",
                    "price": 13.5,
                    "description": "lorem ipsum set",
                    "image": "https://i.pravatar.cc",
                    "category": "electronic"}`});
          
    await expect(response.status()).toBe(200);;

          
        });
      

        test('Update specific product', async ({ request: context }) => {
          const response = await context.patch('https://fakestoreapi.com/products/7', {headers: {}, data: `{"title": "test product",
                    "price": 13.5,
                    "description": "lorem ipsum set",
                    "image": "https://i.pravatar.cc",
                    "category": "electronic"}`});
          
    await expect(response.status()).toBe(200);;

          
        });
      

        test('Delete a product', async ({ request: context }) => {
          const response = await context.delete('https://fakestoreapi.com/products/6');
          
    await expect(response.status()).toBe(200);;

          
        });
      