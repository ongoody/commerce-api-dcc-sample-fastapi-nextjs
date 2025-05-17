"use client";

import React, { useState } from "react";

export default function SampleCards() {
  const [copiedCardKey, setCopiedCardKey] = useState<string | null>(null);

  const cards = [
    { key: "success", label: "Success", number: "5555 5555 5555 4444" },
    {
      key: "immediate-decline",
      label: "Immediate decline",
      number: "4000 0000 0000 0002",
    },
    { key: "cvc-decline", label: "CVC decline", number: "4000 0000 0000 0127" },
    {
      key: "decline-at-charge",
      label: "Decline at charge",
      number: "4000 0000 0000 0341",
    },
  ];

  const handleCopy = (textToCopy: string, cardKey: string) => {
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setCopiedCardKey(cardKey);
        setTimeout(() => {
          setCopiedCardKey(null);
        }, 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="text-gray-500 text-sm mb-8 grid grid-cols-[150px_1fr_auto] gap-x-2 gap-y-1 p-6 py-4 border border-gray-300 rounded-lg items-center">
      <div className="col-span-3 mb-2">
        Sample cards. Use any future expiration (e.g. 12/34), any CVC.
      </div>
      {cards.map((card) => (
        <React.Fragment key={card.key}>
          <div className="font-medium">{card.label}</div>
          <div
            className="tabular-nums cursor-pointer hover:text-gray-700"
            onClick={() => handleCopy(card.number, card.key)}
          >
            {card.number}
          </div>
          <div className="text-xs text-green-500 w-16">
            {copiedCardKey === card.key && "(Copied!)"}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
