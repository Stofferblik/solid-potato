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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  titel: z.string().min(1, "Titel is verplicht"),
  beschrijving: z.string().optional(),
  kwartaal: z.coerce.number().min(1).max(4),
  jaar: z.coerce.number().min(2020),
  status: z.enum(["gepland", "bezig", "gereed"]),
  epicId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface RoadmapFormulierProps {
  open: boolean;
  onSluiten: () => void;
  onOpgeslagen: (item: unknown) => void;
  productId: string;
  epics: { id: string; titel: string; kleur: string }[];
}

export function RoadmapFormulier({ open, onSluiten, onOpgeslagen, productId, epics }: RoadmapFormulierProps) {
  const huidigJaar = new Date().getFullYear();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      kwartaal: Math.ceil((new Date().getMonth() + 1) / 3),
      jaar: huidigJaar,
      status: "gepland",
    },
  });

  async function onSubmit(data: FormData) {
    const res = await fetch("/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        productId,
        epicId: data.epicId || null,
      }),
    });
    const item = await res.json();
    onOpgeslagen(item);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Roadmap item toevoegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Titel *</Label>
            <Input {...register("titel")} placeholder="Bijv. Mobiele app lancering" />
            {errors.titel && <p className="text-xs text-red-500">{errors.titel.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Beschrijving</Label>
            <Textarea {...register("beschrijving")} rows={2} />
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={watch("status")} onValueChange={(v) => setValue("status", v as "gepland" | "bezig" | "gereed")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gepland">Gepland</SelectItem>
                  <SelectItem value="bezig">Bezig</SelectItem>
                  <SelectItem value="gereed">Gereed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Epic (optioneel)</Label>
              <Select
                value={watch("epicId") ?? "geen"}
                onValueChange={(v) => setValue("epicId", v === "geen" ? undefined : v)}
              >
                <SelectTrigger><SelectValue placeholder="Geen" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="geen">Geen</SelectItem>
                  {epics.map((epic) => (
                    <SelectItem key={epic.id} value={epic.id}>{epic.titel}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Opslaan..." : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
