"use client";

import { ChangeEvent, FormEvent } from "react";
import { Dispatch, SetStateAction } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// We need this CSS file to set the width of the iframe.
// It just sets any iframe within this component to 100% width.
// You can do some other approach to target this iframe.
import styles from "./credit-card-form.module.css";
import { usStates } from "./us-states";

const secureFieldClasses =
  "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm h-14 overflow-hidden";

export interface CreditCardFormValues {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CreditCardFormProps {
  formValues: CreditCardFormValues;
  isSubmitting: boolean;
  setFormValues: Dispatch<SetStateAction<CreditCardFormValues>>;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  cardError: string | null;
}

// Presentation component for the credit card form.
// The important part are the secure fields identified by ids #card-number,
// #card-expiration, #card-cvc.
// These will be replaced with the VGS iframe.
export default function CreditCardForm({
  formValues,
  isSubmitting,
  setFormValues,
  handleSubmit,
  cardError,
}: CreditCardFormProps) {
  function onValueChange(name: string, value: string) {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (name === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    }

    onValueChange(name, formattedValue);
  }

  function handleSelectChange(name: string, value: string) {
    onValueChange(name, value);
  }

  function formatCardNumber(value: string) {
    return value
      .replace(/\s/g, "")
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  }

  function formatExpiryDate(value: string) {
    return value.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1/$2");
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-10 p-6">
        <div>
          <div
            className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${styles.cardContainer}`}
          >
            {/* Secure fields here. iframe height 48px (h-12), total height with 4px vertical padding is 56px (h-14) */}

            <div className="md:col-span-6">
              <div id="card-number" className={secureFieldClasses} />
            </div>

            <div className="md:col-span-3">
              <div
                id="card-expiration"
                className={cn(secureFieldClasses, "px-4")}
              />
            </div>

            <div className="md:col-span-3">
              <div id="card-cvc" className={cn(secureFieldClasses, "px-4")} />
            </div>
          </div>

          {cardError && (
            <div className="px-4 py-2 bg-red-100 mt-2 text-red-500 text-sm whitespace-pre-line rounded-md">
              {cardError}
            </div>
          )}
        </div>

        <div>
          <div className="space-y-4">
            <Input
              placeholder="Cardholder Name"
              name="cardholderName"
              value={formValues.cardholderName}
              className="h-10"
              onChange={handleChange}
            />
            <Input
              placeholder="Address Line 1"
              name="addressLine1"
              value={formValues.addressLine1}
              className="h-10"
              onChange={handleChange}
            />

            <Input
              placeholder="Address Line 2 (Optional)"
              name="addressLine2"
              value={formValues.addressLine2}
              className="h-10"
              onChange={handleChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <Input
                  placeholder="City"
                  name="city"
                  value={formValues.city}
                  className="h-10"
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                {formValues.country === "US" ? (
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("state", value)
                    }
                    value={formValues.state}
                    name="state"
                  >
                    <SelectTrigger className="h-10! w-full">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      {usStates.map((state) => (
                        <SelectItem key={state.value} value={state.value}>
                          {state.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="State"
                    name="state"
                    value={formValues.state}
                    className="h-10"
                    onChange={handleChange}
                  />
                )}
              </div>

              <div className="md:col-span-3">
                <Input
                  placeholder="Postal Code"
                  name="postalCode"
                  value={formValues.postalCode}
                  className="h-10"
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-3 h-full w-full">
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("country", value)
                  }
                  value={formValues.country}
                  name="country"
                >
                  <SelectTrigger className="h-10! w-full">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            type="submit"
            className={cn(
              "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white h-10 px-6",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Save Payment Information"}
          </Button>
        </div>
      </form>
    </div>
  );
}
