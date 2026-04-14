"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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

const schema = z.object({
  objective: z.string().min(1, "Objective is verplicht"),
  kwartaal: z.coerce.number().min(1).max(4),
  jaar: z.coerce.number().min(2020).max(2100),
});

type FormData = z.infer<typeof schema>;
type KeyResult = { beschrijving: string; target: string; eenheid: string };

interface OKRFormulierProps {
  open: boolean;
  onSluiten: () => void;
  onOpgeslagen: (okr: unknown) => void;
  productId: string;
}

export function OKRFormulier({ open, onSluiten, onOpgeslagen, productId }: OKRFormulierProps) {
  const huidigJaar = new Date().getFullYear();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      kwartaal: Math.ceil((new Date().getMonth() + 1) / 3),
      jaar: huidigJaar,
    },
  });

  const [keyResults, setKeyResults] = useState<KeyResult[]>([
    { beschrijving: "", target: "", eenheid: "" },
  ]);

  function voegKrToe() {
    setKeyResults((prev) => [...prev, { beschrijving: "", target: "", eenheid: "" }]);
  }

  function verwijderKr(index: number) {
    setKeyResults((prev) => prev.filter((_, i) => i !== index));
  }

  function updateKr(index: number, veld: keyof KeyResult, waarde: string) {
    setKeyResults((prev) => {
      const nieuw = [...prev];
      nieuw[index] = { ...nieuw[index], [veld]: waarde };
      return nieuw;
    });
  }

  async function onSubmit(data: FormData) {
    const geldigeKrs = keyResults.filter((kr) => kr.beschrijving && kr.target);
    const res = await fetch("/api/okrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, productId, keyResults: geldigeKrs }),
    });
    const okr = await res.json();
    onOpgeslagen(okr);
    reset();
    setKeyResults([{ beschrijving: "", target: "", eenheid: "" }]);
  }

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe OKR toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Objective *</Label>
            <Input {...register("objective")} placeholder="Bijv. Verhoog klanttevredenheid significant" />
            {errors.objective && <p className="text-xs text-red-500">{errors.objective.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kwartaal</Label>
              <Input type="number" {...register("kwartaal")} min={1} max={4} />
            </div>
            <div className="space-y-2">
              <Label>Jaar</Label>
              <Input type="number" {...register("jaar")} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Results</Label>
              <Button type="button" variant="ghost" size="sm" onClick={voegKrToe}>
                <Plus className="h-3.5 w-3.5" />
                Toevoegen
              </Button>
            </div>
            {keyResults.map((kr, i) => (
              <div key={i} className="border rounded-lg p-3 space-y-2 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 w-4">KR{i + 1}</span>
                  <Input
                    value={kr.beschrijving}
                    onChange={(e) => updateKr(i, "beschrijving", e.target.value)}
                    placeholder="Beschrijving van key result"
                    className="flex-1"
                  />
                  {keyResults.length > 1 && (
                    <button type="button" onClick={() => verwijderKr(i)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 pl-6">
                  <Input
                    value={kr.target}
                    onChange={(e) => updateKr(i, "target", e.target.value)}
                    placeholder="Target (bijv. 100)"
                  />
                  <Input
                    value={kr.eenheid}
                    onChange={(e) => updateKr(i, "eenheid", e.target.value)}
                    placeholder="Eenheid (bijv. %)"
                  />
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Opslaan..." : "OKR aanmaken"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
