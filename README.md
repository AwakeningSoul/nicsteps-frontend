# NICSTEPS frontend replacement

## Files
- `index.html`: new homepage with the two seasonal featured products.
- `collection.html`: permanent collection page, including the existing cap range and the new products.
- `products.js`: product names, selling prices, image paths and Printful variant IDs for the storefront.
- `script.js`: shared basket, product selection, tip and Stripe checkout logic.
- `style.css`: responsive storefront styling.

## Local preview
Run the backend separately, then serve this folder with a local static server. For example:
```bash
npx serve .
```
Use the URL printed by the server. Set `FRONTEND_BASE_URL` in the backend `.env` to that URL and add it to `ALLOWED_ORIGINS`.

The storefront currently expects the new image files in `images/`. Their filenames are listed in `products.js` and in the project handover notes. The ZIP you supplied contained the original cap photos but not the new product photos, so those new images need to be copied into `images/`.

The frontend sends only Printful variant IDs and quantities to the backend. Prices are re-validated and set server-side.
