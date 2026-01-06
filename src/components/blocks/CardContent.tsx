"use client";

import type { CardContentData } from "@/types/content-blocks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent as CardBody,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CardContentProps {
  data: CardContentData;
}

export function CardContent({ data }: CardContentProps) {
  const handleAction = (action: string, label: string) => {
    toast.info(`Action triggered: ${label}`);
    console.log("Card action:", action);
  };

  const contentSection = (
    <>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && (
          <CardDescription>{data.description}</CardDescription>
        )}
      </CardHeader>

      {data.content && (
        <CardBody>
          <p className="text-sm text-foreground">{data.content}</p>
        </CardBody>
      )}

      {data.actions && data.actions.length > 0 && (
        <CardFooter className="flex flex-wrap gap-2">
          {data.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "default"}
              onClick={() => handleAction(action.action, action.label)}
            >
              {action.label}
            </Button>
          ))}
        </CardFooter>
      )}
    </>
  );

  // Horizontal layout when media exists
  if (data.media) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col md:flex-row">
          {/* Media - left half on desktop */}
          <div className="relative w-full h-48 md:w-1/2 md:h-auto md:min-h-[200px] flex-shrink-0 overflow-hidden bg-muted">
            {data.media.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.media.url}
                alt={data.media.alt || data.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={data.media.url}
                controls
                className="w-full h-full object-cover"
              >
                <track kind="captions" />
              </video>
            )}
          </div>

          {/* Content - right half on desktop */}
          <div className="flex flex-col justify-center gap-4 md:w-1/2 py-6">{contentSection}</div>
        </div>
      </Card>
    );
  }

  // Vertical layout when no media
  return <Card className="overflow-hidden">{contentSection}</Card>;
}
