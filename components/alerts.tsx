import { Alert, AlertDescription } from "@/components/ui/alert";
import { TriangleAlert } from "lucide-react";

export function DemoAlert() {
  return (
    <Alert className="border-accent bg-accent/50 text-muted-foreground dark:border-accent dark:bg-accent/30 dark:text-muted-foreground">
      <TriangleAlert className="size-4" />
      <AlertDescription>
        This website is not connected to notify the rancher. This is just a
        demo.
      </AlertDescription>
    </Alert>
  );
}
