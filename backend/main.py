import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import httpx

load_dotenv()

class PaymentMethodRequest(BaseModel):
    interim_card_key: str
    cardholder_name: str
    billing_address: dict

class OrderBatchRequest(BaseModel):
    payment_method_id: str

app = FastAPI()

goody_commerce_api_key = os.getenv("GOODY_COMMERCE_API_KEY")
goody_commerce_api_base_url = os.getenv("GOODY_COMMERCE_API_BASE_URL", "https://api.sandbox.ongoody.com")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:4001")
end_user_id = "123" # for testing

# CORS configuration
origins = [
    frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Goody API responses will typically return a 400 for errors, and an error is provided
def _handle_goody_api_error(response: httpx.Response) -> JSONResponse:
    if response.status_code == 400:
        try:
            response_data = response.json()
            error_message = response_data.get("error")
        except:
            error_message = "Unknown error"
        return JSONResponse(
            status_code=400,
            content={"error": error_message},
        )
    else:
        return JSONResponse(
            status_code=400,
            content={
                "error": f"Got status code: {response.status_code} with body: {response.text}",
            },
        )


@app.post("/create_goody_payment_method")
async def create_goody_payment_method(request: PaymentMethodRequest):
    async with httpx.AsyncClient(timeout=30.0) as client:
        headers = {
            "Authorization": f"Bearer {goody_commerce_api_key}",
            "Content-Type": "application/json",
        }
        response = await client.post(
            f"{goody_commerce_api_base_url}/v1/commerce_user_payment_methods",
            json={
                "interim_card_key": request.interim_card_key,
                "cardholder_name": request.cardholder_name,
                "billing_address": request.billing_address,
                "payment_method_type": "card",
                "commerce_end_user_id": end_user_id
            },
            headers=headers,
        )

        if response.status_code == 201:
            response_data = response.json()
            payment_method_id = response_data.get("id")
            if not payment_method_id:
                raise HTTPException(status_code=500, detail="No payment method ID returned from Goody API")

            return {
                "message": f"Payment method created: {payment_method_id}",
                "payment_method_id": payment_method_id,
            }

        return _handle_goody_api_error(response)


@app.post("/create_goody_order_batch")
async def create_goody_order_batch(request: OrderBatchRequest):
    async with httpx.AsyncClient(timeout=30.0) as client:
        headers = {
            "Authorization": f"Bearer {goody_commerce_api_key}",
            "Content-Type": "application/json",
        }
        response = await client.post(
            f"{goody_commerce_api_base_url}/v1/order_batches",
            json={
                "from_name": "Monaco User",
                "message": "Thanks!",
                "send_method": "direct_send",
                "commerce_end_user_id": end_user_id,
                "payment_method_id": request.payment_method_id,
                "recipients": [
                    {
                        "first_name": "Alena",
                        "last_name": "Kenter",
                        "mailing_address": {
                            "address_1": "185 Berry St",
                            "address_2": "",
                            "city": "San Francisco",
                            "state": "CA",
                            "postal_code": "94107",
                            "country": "US"
                        }
                    }
                ],
                "cart": {
                    "items": [
                        {
                            "product_id": "bc25af6b-bf71-4da3-a8ef-5f873e03b7d4",
                            "quantity": 1
                        }
                    ]
                }
            },
            headers=headers,
        )

        if response.status_code == 201:
            response_data = response.json()
            order_batch_id = response_data.get("id")
            
            if not order_batch_id:
                raise HTTPException(status_code=500, detail="No order batch ID returned from Goody API")
                
            return {
                "message": f"Order batch created: {order_batch_id}",
                "order_batch_id": order_batch_id,
                "data": response_data,
            }

        return _handle_goody_api_error(response)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 4000)))
