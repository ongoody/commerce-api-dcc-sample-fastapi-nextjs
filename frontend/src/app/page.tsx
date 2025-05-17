"use client";

import { useState, FormEvent } from "react";
import CreditCardForm, {
  CreditCardFormValues,
} from "./components/credit-card-form";
import useVGS from "@/app/hooks/useVGS";
import SampleCards from "@/app/components/sample-cards";
import useSubmitOrderBatch from "@/app/hooks/useSubmitOrderBatch";
import MessageView from "@/app/components/message-view";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/app/api_base_url";

export default function Page() {
  const [cardIsSubmitting, setCardIsSubmitting] = useState(false);
  const [formValues, setFormValues] =
    useState<CreditCardFormValues>(initialFormValues);
  const [message, setMessage] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [paymentMethodID, setPaymentMethodID] = useState<string | null>(null);

  const { getInterimCardKey } = useVGS();

  async function handleCardSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCardIsSubmitting(true);
    setCardError(null);
    setMessage(null);
    setPaymentMethodID(null);

    let interimCardKey;
    try {
      interimCardKey = await getInterimCardKey();
    } catch (error: any) {
      setCardError(
        typeof error === "string" ? error : "Failed to get interim card key."
      );
      setCardIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/create_goody_payment_method`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            interim_card_key: interimCardKey,
            cardholder_name: formValues.cardholderName,
            billing_address: {
              address_1: formValues.addressLine1,
              address_2: formValues.addressLine2,
              city: formValues.city,
              state: formValues.state,
              postal_code: formValues.postalCode,
              country: formValues.country,
            },
          }),
        }
      );

      if (!response.ok) {
        try {
          const data = await response.json();
          setMessage(data.error || `HTTP error! Status: ${response.status}`);
        } catch {
          setMessage(`HTTP error! Status: ${response.status}`);
        }

        return;
      }

      const data = await response.json();
      setMessage(data.message);
      setPaymentMethodID(data.payment_method_id);
    } catch (e: any) {
      setMessage(`Failed to create payment method: ${e.message}`);
    } finally {
      setCardIsSubmitting(false);
    }
  }

  const { batchIsSubmitting, batchMessage, handleBatchSubmit, batchData } =
    useSubmitOrderBatch();

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-gray-100">
      <div className="w-full max-w-2xl">
        <SampleCards />
        <CreditCardForm
          formValues={formValues}
          isSubmitting={cardIsSubmitting}
          setFormValues={setFormValues}
          handleSubmit={handleCardSubmit}
          cardError={cardError}
        />
        <MessageView
          message={message}
          fallbackMessage="Credit card form not submitted yet"
          showAccessory={!!paymentMethodID}
          accessory={
            <Button
              className={cn(
                "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-10 px-6",
                (batchIsSubmitting || !paymentMethodID) &&
                  "opacity-70 cursor-not-allowed"
              )}
              disabled={batchIsSubmitting || !paymentMethodID}
              onClick={() => handleBatchSubmit(paymentMethodID!)}
            >
              {batchIsSubmitting ? "Processing..." : "Create Order Batch"}
            </Button>
          }
        />
        <MessageView
          message={batchMessage}
          fallbackMessage="Order batch not submitted yet"
          showAccessory={!!batchData}
          accessory={
            batchData && (
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(batchData, null, 2)}
              </pre>
            )
          }
        />
      </div>
    </main>
  );
}

const initialFormValues: CreditCardFormValues = {
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  cardholderName: "John Cena",
  addressLine1: "185 Berry St",
  addressLine2: "",
  city: "San Francisco",
  state: "CA",
  postalCode: "94107",
  country: "US",
};
