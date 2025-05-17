import { useState } from "react";

import { API_BASE_URL } from "@/app/api_base_url";

export default function useSubmitOrderBatch() {
  const [batchIsSubmitting, setBatchIsSubmitting] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);
  const [batchData, setBatchData] = useState<any>(null);

  async function handleBatchSubmit(paymentMethodID: string) {
    setBatchIsSubmitting(true);
    setBatchMessage(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/create_goody_order_batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_method_id: paymentMethodID,
          }),
        }
      );

      if (!response.ok) {
        try {
          const data = await response.json();
          setBatchMessage(data.error || `HTTP error! Status: ${response.status}`);
        } catch {
          setBatchMessage(`HTTP error! Status: ${response.status}`);
        }

        return;
      }

      const data = await response.json();
      setBatchMessage(data.message);
      setBatchData(data.data);
    } catch (e: any) {
      setBatchMessage(`Failed to create order batch: ${e.message}`);
    } finally {
      setBatchIsSubmitting(false);
    }
  }

  return {
    batchIsSubmitting,
    setBatchIsSubmitting,
    batchMessage,
    setBatchMessage,
    handleBatchSubmit,
    batchData,
  };
}