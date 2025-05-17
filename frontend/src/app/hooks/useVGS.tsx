import cardIcons from "@/app/hooks/cardIcons";
import { loadVGSCollect } from "@vgs/collect-js";
import { useEffect, useRef } from "react";
import { useState } from "react";

const GOODY_VGS_VAULT_ID =
  process.env.NEXT_PUBLIC_GOODY_VGS_VAULT_ID ?? "tntfizwd8io";
const GOODY_VGS_ENVIRONMENT =
  process.env.NEXT_PUBLIC_GOODY_VGS_ENVIRONMENT ?? "sandbox";
const GOODY_VGS_CNAME =
  process.env.NEXT_PUBLIC_GOODY_VGS_CNAME ?? "vgs-sandbox.ongoody.com";

export default function useVGS() {
  const [vgsReady, setVGSReady] = useState(false);

  // VGS annoyingly doesn't provide types
  const vgsFormRef = useRef<any | null>(null);

  // Load VGS Collect and attach to vgsFormRef
  async function loadVGS() {
    if (vgsReady) return;

    const collect = (await loadVGSCollect({
      vaultId: GOODY_VGS_VAULT_ID,
      environment: GOODY_VGS_ENVIRONMENT,
      version: "2.12.0",
    })) as any;

    const vgsForm = collect.init();
    vgsForm.useCname(GOODY_VGS_CNAME);

    // Use VGS Satellite in development.
    if (process.env.NEXT_PUBLIC_GOODY_VGS_LOCAL === "true") {
      vgsForm.connectSatellite(9098);
    }

    vgsFormRef.current = vgsForm;

    // Check if all fields are present
    const requiredFields = ["#card-number", "#card-expiration", "#card-cvc"];
    const missingFields = requiredFields.filter(
      (selector) => !document.querySelector(selector)
    );

    if (missingFields.length > 0) {
      alert(`Credit card form fields are missing: ${missingFields.join(", ")}`);
      return;
    }

    // Generate VGS Collect.js secure fields
    vgsForm.field("#card-number", cardNumberConfig);
    vgsForm.field("#card-expiration", cardExpConfig);
    vgsForm.field("#card-cvc", cardCvcConfig);

    setVGSReady(true);
  }

  // This pre-submit handler is meant to be called in the handleSubmit form
  // submission handler of the component that includes this hook. This calls
  // our backend through the VGS inbound route to create an interim card that
  // stores the tokenized card number, tokenized CVC, and expiration date,
  // returning a key that is then returned to the caller.
  //
  // When it fails, the promise rejects with an error message. This could be due
  // to the form not being ready, or a validation error that is caught by the
  // VGS form submit function.
  const getInterimCardKey = () => {
    return new Promise<string | null>((resolve, reject) => {
      const vgsForm = vgsFormRef.current;

      if (!vgsForm) {
        reject("Credit card form not ready");
        return;
      }

      const endpoint = "/vgs/inbound/create_interim_card";

      // First submit the form via VGS to the VGS create interim card endpoint
      // to store the tokenized card details server-side. Since VGS doesn't
      // support GraphQL well, nor does it retain session cookies easily, we use
      // this endpoint as a way to store the tokenized card details on the
      // server which will then be consumed by GraphQL.
      vgsForm.submit(
        endpoint,
        {},
        async function (status: any, data: any) {
          // An interim card token should be returned
          const interimCardKey = data.interim_card_token;

          if (interimCardKey) {
            resolve(interimCardKey);
          } else {
            reject("An error occurred.");
          }
        },
        (error: any) => {
          const error_output = [];

          // Collect errors in the weird format that they're returned
          for (const el in error) {
            error_output.push(
              `${getFieldName(el)} ${error[el].errorMessages[0]}`
            );
          }

          // Join them with newlines
          reject(error_output.join("\n"));
        }
      );
    });
  };

  useEffect(() => {
    loadVGS();
  }, []);

  return {
    getInterimCardKey,
  };
}

const classes = {
  focused: "SecureField--focused",
  valid: "SecureField--valid",
};

const css = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica',
  boxSizing: "border-box",
  lineHeight: "1.5em",
  fontSize: "16px",
  border: "none",
  color: "#31325F",
  width: "100%",
  height: "48px",
  "&::placeholder": {
    color: "#94a3b8",
  },
  "&.invalid.touched": {
    color: "rgb(201, 31, 36)",
  },
};

function getFieldName(str: string) {
  switch (str) {
    case "card_cvc":
      return "CVC";
    case "card_number":
      return "Card number";
    case "card_expiration":
      return "Card expiration date";
    default:
      return str;
  }
}

const cardNumberConfig = {
  type: "card-number",
  name: "card_number",
  validations: ["required", "validCardNumber"],
  placeholder: "Card Number",
  showCardIcon: {
    left: "10px",
  },
  icons: cardIcons,
  css: { ...css, paddingLeft: "50px" },
  classes: classes,
  autoComplete: "cc-card",
};

const cardExpConfig = {
  type: "card-expiration-date",
  name: "card_expiration",
  placeholder: "MM/YY",
  yearLength: "2",
  classes: classes,
  css: css,
  validations: ["validCardExpirationDate"],
  autoComplete: "cc-exp",
};

const cardCvcConfig = {
  type: "card-security-code",
  name: "card_cvc",
  placeholder: "CVC",
  validations: ["required", "validCardSecurityCode"],
  autoComplete: "cc-csc",
  classes: classes,
  css: css,
};
