"use client";

import { useEffect } from "react";
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
  acceptatiecriteria: z.string().optional(),
  prioriteit: z.enum(["must", "should", "could", "wont"]),
  punten: z.coerce.number().optional().nullable(),
  epicId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type OpgeslagenStory = {
  id: string;
  titel: string;
  beschrijving?: string | null;
  acceptatiecriteria?: string | null;
  prioriteit: string;
  punten?: number | null;
  status: string;
  volgorde: number;
  epicId?: string | null;
  epic?: { id: string; titel: string; kleur: string } | null;
};

interface StoryFormulierProps {
  open: boolean;
  onSluiten: () => void;
  onOpgeslagen: (story: OpgeslagenStory) => void;
  story?: {
    id: string;
    titel: string;
    beschrijving?: string | null;
    acceptatiecriteria?: string | null;
    prioriteit: string;
    punten?: number | null;
    epicId?: string | null;
  };
  epics: { id: string; titel: string; kleur: string }[];
}

export function StoryFormulier({ open, onSluiten, onOpgeslagen, story, epics }: StoryFormulierProps) {
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
      prioriteit: "should",
    },
  });

  useEffect(() => {
    if (story) {
      reset({
        titel: story.titel,
        beschrijving: story.beschrijving ?? "",
        acceptatiecriteria: story.acceptatiecriteria ?? "",
        prioriteit: story.prioriteit as "must" | "should" | "could" | "wont",
        punten: story.punten ?? undefined,
        epicId: story.epicId ?? undefined,
      });
    } else {
      reset({ prioriteit: "should", titel: "", beschrijving: "", acceptatiecriteria: "" });
    }
  }, [story, reset]);

  async function onSubmit(data: FormData) {
    const url = story ? `/api/stories/${story.id}` : "/api/stories";
    const methode = story ? "PUT" : "POST";

    const payload = {
      ...data,
      epicId: data.epicId || null,
      punten: data.punten || null,
    };

    const res = await fetch(url, {
      method: methode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const opgeslagen: OpgeslagenStory = await res.json();
    onOpgeslagen(opgeslagen);
  }

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{story ? "Story bewerken" : "Nieuwe user story"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Titel *</Label>
            <Input {...register("titel")} placeholder="Als [gebruiker] wil ik [actie]..." />
            {errors.titel && <p className="text-xs text-red-500">{errors.titel.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Prioriteit (MoSCoW)</Label>
              <Select
                value={watch("prioriteit")}
                onValueChange={(val) => setValue("prioriteit", val as "must" | "should" | "could" | "wont")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="must">Must Have</SelectItem>
                  <SelectItem value="should">Should Have</SelectItem>
                  <SelectItem value="could">Could Have</SelectItem>
                  <SelectItem value="wont">Won&apos;t Have</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Story Points</Label>
              <Input
                type="number"
                {...register("punten")}
                placeholder="1, 2, 3, 5, 8..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Epic (optioneel)</Label>
            <Select
              value={watch("epicId") ?? "geen"}
              onValueChange={(val) => setValue("epicId", val === "geen" ? undefined : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Geen epic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geen">Geen epic</SelectItem>
                {epics.map((epic) => (
                  <SelectItem key={epic.id} value={epic.id}>
                    {epic.titel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Beschrijving</Label>
            <Textarea {...register("beschrijving")} placeholder="Meer context over deze story..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Acceptatiecriteria</Label>
            <Textarea
              {...register("acceptatiecriteria")}
              placeholder="- Criterion 1&#10;- Criterion 2"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Opslaan..." : story ? "Bijwerken" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
