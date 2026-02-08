import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function DemoAlert() {
  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
      <TriangleAlert className="size-4" />
      <AlertDescription>
        This website is not connected to notify the rancher. This is just a
        demo.
      </AlertDescription>
    </Alert>
  );
}
