"use client";

import { motion } from "motion/react";
import type { ContentBlock as ContentBlockType } from "@/types/content-blocks";
import { FormContent } from "./FormContent";
import { ChartContent } from "./ChartContent";
import { CodeContent } from "./CodeContent";
import { CardContent } from "./CardContent";
import { fadeInUp } from "@/lib/motion/variants";

interface ContentBlockProps {
  content: ContentBlockType;
  messageId: string;
}

export function ContentBlock({ content, messageId }: ContentBlockProps) {
  const renderContent = () => {
    switch (content.type) {
      case "form":
        return <FormContent data={content} messageId={messageId} />;
      case "chart":
        return <ChartContent data={content} />;
      case "code":
        return <CodeContent data={content} />;
      case "card":
        return <CardContent data={content} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="my-3 w-full"
    >
      {renderContent()}
    </motion.div>
  );
}
