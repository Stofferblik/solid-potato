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
  titel: z.string().min(1, "Titel is verplicht"),
  beschrijving: z.string().optional(),
  kleur: z.string().default("#6366f1"),
});

type FormData = z.infer<typeof schema>;

const KLEUREN = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#ec4899",
];

type OpgeslagenEpic = {
  id: string;
  titel: string;
  beschrijving?: string | null;
  status: string;
  kleur: string;
  volgorde: number;
};

interface EpicFormulierProps {
  open: boolean;
  onSluiten: () => void;
  onOpgeslagen: (epic: OpgeslagenEpic) => void;
  productId: string;
}

export function EpicFormulier({ open, onSluiten, onOpgeslagen, productId }: EpicFormulierProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { kleur: "#6366f1" },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/epics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, productId }),
    });
    const epic: OpgeslagenEpic = await res.json();
    onOpgeslagen(epic);
    reset();
  }

  const geselecteerdeKleur = watch("kleur");

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuwe epic aanmaken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Naam *</Label>
            <Input {...register("titel")} placeholder="Bijv. Gebruikersbeheer" />
            {errors.titel && <p className="text-xs text-red-500">{errors.titel.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Beschrijving</Label>
            <Textarea {...register("beschrijving")} placeholder="Wat omvat deze epic?" rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Kleur</Label>
            <div className="flex gap-2 flex-wrap">
              {KLEUREN.map((kleur) => (
                <button
                  key={kleur}
                  type="button"
                  onClick={() => setValue("kleur", kleur)}
                  className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: kleur,
                    borderColor: geselecteerdeKleur === kleur ? "#1f2937" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Aanmaken..." : "Epic aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
