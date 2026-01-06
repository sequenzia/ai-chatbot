"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import type { FormContentData, FormField } from "@/types/content-blocks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formFieldContainer, formField } from "@/lib/motion/variants";

interface FormContentProps {
  data: FormContentData;
  messageId: string;
}

type FormValues = Record<string, string | number | boolean>;

export function FormContent({ data, messageId }: FormContentProps) {
  const [values, setValues] = useState<FormValues>(() => {
    const initial: FormValues = {};
    data.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initial[field.id] = field.defaultValue;
      } else if (field.type === "checkbox") {
        initial[field.id] = false;
      } else if (field.type === "slider") {
        initial[field.id] = field.min ?? 0;
      } else {
        initial[field.id] = "";
      }
    });
    return initial;
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = useCallback((fieldId: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check required fields
    const missingRequired = data.fields
      .filter((f) => f.required && !values[f.id])
      .map((f) => f.label);

    if (missingRequired.length > 0) {
      toast.error(`Please fill in: ${missingRequired.join(", ")}`);
      return;
    }

    setSubmitted(true);
    toast.success("Form submitted successfully!");
    console.log("Form submitted:", { messageId, values });
  };

  const renderField = (field: FormField) => {
    const value = values[field.id];

    switch (field.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={field.type}
            id={field.id}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            disabled={submitted}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value as string}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            disabled={submitted}
            className="min-h-[100px]"
          />
        );

      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(v) => handleChange(field.id, v)}
            disabled={submitted}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value as boolean}
              onCheckedChange={(checked) => handleChange(field.id, !!checked)}
              disabled={submitted}
            />
            <Label htmlFor={field.id} className="text-sm font-normal cursor-pointer">
              {field.placeholder || field.label}
            </Label>
          </div>
        );

      case "radio":
        return (
          <RadioGroup
            value={value as string}
            onValueChange={(v) => handleChange(field.id, v)}
            disabled={submitted}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                <Label
                  htmlFor={`${field.id}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[value as number]}
              onValueChange={([v]) => handleChange(field.id, v)}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              disabled={submitted}
            />
            <div className="text-sm text-muted-foreground text-center">
              {value}
            </div>
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            id={field.id}
            value={value as string}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            disabled={submitted}
          />
        );

      case "file":
        return (
          <Input
            type="file"
            id={field.id}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleChange(field.id, file.name);
              }
            }}
            disabled={submitted}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
        {data.description && (
          <CardDescription>{data.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={formFieldContainer}
            className="space-y-4"
          >
            {data.fields.map((field) => (
              <motion.div key={field.id} variants={formField}>
                {field.type !== "checkbox" && (
                  <Label htmlFor={field.id} className="mb-2 block">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}
                {renderField(field)}
              </motion.div>
            ))}

            <motion.div variants={formField} className="pt-2">
              <Button
                type="submit"
                disabled={submitted}
                className="w-full"
              >
                {submitted ? "Submitted" : data.submitLabel || "Submit"}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </CardContent>
    </Card>
  );
}
