# Goody Commerce API — Direct Card Capture Sample (FastAPI + Next.js)

Demonstrates adding a credit card with VGS Collect.js to Goody's Commerce API.

Requires Node.js (built on 22.x), [pnpm](https://pnpm.io/installation) (npm
works fine also), Python (built on 3.13.x), and [uv](https://github.com/astral-sh/uv).

## Backend

Runs at http://localhost:4000

```bash
# Install dependencies
uv sync

# Run server (automatically starts venv)
uv run python main.py
```

In `.env`, set `GOODY_COMMERCE_API_KEY` to your Goody Commerce sandbox API key.

## Frontend

TypeScript / Tailwind CSS / App Router

Runs at http://localhost:4001

```bash
# Install dependencies
pnpm install # or: npm install

# Run server
pnpm dev # or: npm run dev
```

## How it works

1. **Page rendering:** On the frontend, we render [page.tsx](https://github.com/ongoody/commerce-api-dcc-sample-fastapi-nextjs/blob/main/frontend/src/app/page.tsx), which contains a credit card form and
   fields for output. The credit card form
   ([credit-card-form.tsx](https://github.com/ongoody/commerce-api-dcc-sample-fastapi-nextjs/blob/main/frontend/src/app/components/credit-card-form.tsx))
   contains divs with IDs `#card-number`, `#card-expiration`, and `#card-cvc`.
2. **VGS initialization and div replacement for card data:** The
   [`useVGS()`](https://github.com/ongoody/commerce-api-dcc-sample-fastapi-nextjs/blob/main/frontend/src/app/hooks/useVGS.tsx)
   hook (included on page.tsx) initializes VGS Collect.js and replaces the divs
   with VGS's iframes.

3. **Tokenization and interim card key:** When the form is submitted, the
   `handleSubmit` function is called. This runs the
   [`getInterimCardKey()`](https://github.com/ongoody/commerce-api-dcc-sample-fastapi-nextjs/blob/main/frontend/src/app/hooks/useVGS.tsx#L67)
   function in `useVGS()`. VGS first runs validation on the card number,
   expiration, and CVC, to check the values are valid. If they're not valid, an
   error message is rendered, but if valid, VGS tokenizes the card data and calls
   Goody's API to store the tokenized data, which returns an `interim_card_key`.

4. **Payment method creation:** This key is then passed back to the
   `handleSubmit` function in `page.tsx`, which calls the Goody Commerce API to
   [create a payment method using the interim card key](https://github.com/ongoody/commerce-api-dcc-sample-fastapi-nextjs/blob/main/frontend/src/app/page.tsx#L44), along with the cardholder
   name, billing address, and the end user ID (this should be the user ID of _your_
   user to attach it to).

   The backend receives the request and creates a payment method with the Goody
   Commerce API using the interim card key, sets up a user to attach that payment
   method to, and stores the card details in Stripe, returning the payment
   method ID.

   If the card is declined, the backend will return an error for the frontend to render.

5. **Order batch creation:** The frontend then receives the payment method ID and
   renders it. It enables a button to create an order batch for the given
   payment method ID. When clicked, it uses the payment method ID and the end
   user ID to [create an order batch](https://github.com/ongoody/commerce-api-dcc-sample-fastapi-nextjs/blob/main/frontend/src/app/hooks/useSubmitOrderBatch.ts#L5).

6. **Order batch processing:** The backend receives the request and creates an
   order batch. It pre-authorizes the card. If pre-authorization fails, an error
   is returned. Otherwise, it queues the order batch for processing (which is
   done asynchronously).

7. **Order batch object returned:** If the order batch is created successfully, the backend
   returns an order batch ID and a payload, which is rendered on the frontend.
