"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  naam: z.string().min(1, "Naam is verplicht"),
  doel: z.string().optional(),
  startDatum: z.string().min(1, "Startdatum is verplicht"),
  eindDatum: z.string().min(1, "Einddatum is verplicht"),
});

type FormData = z.infer<typeof schema>;

type OpgeslagenSprint = {
  id: string;
  naam: string;
  doel?: string | null;
  startDatum: Date | string;
  eindDatum: Date | string;
  status: string;
  items: [];
};

interface SprintFormulierProps {
  open: boolean;
  onSluiten: () => void;
  onOpgeslagen: (sprint: OpgeslagenSprint) => void;
}

export function SprintFormulier({ open, onSluiten, onOpgeslagen }: SprintFormulierProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const sprint: OpgeslagenSprint = await res.json();
    onOpgeslagen(sprint);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe sprint aanmaken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Naam *</Label>
            <Input {...register("naam")} placeholder="Bijv. Sprint 1" />
            {errors.naam && <p className="text-xs text-red-500">{errors.naam.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Sprint doel</Label>
            <Textarea {...register("doel")} placeholder="Wat willen we bereiken in deze sprint?" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Startdatum *</Label>
              <Input type="date" {...register("startDatum")} />
              {errors.startDatum && <p className="text-xs text-red-500">{errors.startDatum.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Einddatum *</Label>
              <Input type="date" {...register("eindDatum")} />
              {errors.eindDatum && <p className="text-xs text-red-500">{errors.eindDatum.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Aanmaken..." : "Sprint aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
