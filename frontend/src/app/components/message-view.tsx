import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  message: string | null;
  fallbackMessage: string;
  showAccessory?: boolean;
  accessory?: React.ReactNode;
}

export default function MessageView({
  message,
  fallbackMessage,
  showAccessory,
  accessory,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mt-8">
      <div className="p-6 text-base flex flex-col gap-4 items-start">
        {message ?? <div className="text-gray-500">{fallbackMessage}</div>}
        {showAccessory && accessory}
      </div>
    </div>
  );
}
