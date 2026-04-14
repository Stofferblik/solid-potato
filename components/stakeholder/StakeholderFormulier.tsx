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
  naam: z.string().min(1, "Naam is verplicht"),
  rol: z.string().optional(),
  organisatie: z.string().optional(),
  email: z.string().optional(),
  telefoon: z.string().optional(),
  invloed: z.coerce.number().min(1).max(5),
  belang: z.coerce.number().min(1).max(5),
  notities: z.string().optional(),
  categorie: z.enum(["sponsor", "gebruiker", "expert", "management"]),
});

type FormData = z.infer<typeof schema>;

type Stakeholder = {
  id: string;
  naam: string;
  rol?: string | null;
  organisatie?: string | null;
  email?: string | null;
  telefoon?: string | null;
  invloed: number;
  belang: number;
  notities?: string | null;
  categorie: string;
};

interface Props {
  open: boolean;
  onSluiten: () => void;
  onOpgeslagen: (stakeholder: Stakeholder) => void;
  stakeholder?: Stakeholder;
}

export function StakeholderFormulier({ open, onSluiten, onOpgeslagen, stakeholder }: Props) {
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
      invloed: 3,
      belang: 3,
      categorie: "gebruiker",
    },
  });

  useEffect(() => {
    if (stakeholder) {
      reset({
        naam: stakeholder.naam,
        rol: stakeholder.rol ?? "",
        organisatie: stakeholder.organisatie ?? "",
        email: stakeholder.email ?? "",
        telefoon: stakeholder.telefoon ?? "",
        invloed: stakeholder.invloed,
        belang: stakeholder.belang,
        notities: stakeholder.notities ?? "",
        categorie: stakeholder.categorie as "sponsor" | "gebruiker" | "expert" | "management",
      });
    } else {
      reset({ invloed: 3, belang: 3, categorie: "gebruiker" });
    }
  }, [stakeholder, reset]);

  async function onSubmit(data: FormData) {
    const url = stakeholder ? `/api/stakeholders/${stakeholder.id}` : "/api/stakeholders";
    const methode = stakeholder ? "PUT" : "POST";

    const res = await fetch(url, {
      method: methode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const opgeslagen = await res.json();
    onOpgeslagen(opgeslagen);
  }

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{stakeholder ? "Stakeholder bewerken" : "Stakeholder toevoegen"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Naam *</Label>
              <Input {...register("naam")} />
              {errors.naam && <p className="text-xs text-red-500">{errors.naam.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Rol / Functie</Label>
              <Input {...register("rol")} placeholder="Bijv. Product Sponsor" />
            </div>
            <div className="space-y-2">
              <Label>Organisatie</Label>
              <Input {...register("organisatie")} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label>Telefoon</Label>
              <Input {...register("telefoon")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Categorie</Label>
            <Select
              value={watch("categorie")}
              onValueChange={(v) => setValue("categorie", v as "sponsor" | "gebruiker" | "expert" | "management")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sponsor">Sponsor</SelectItem>
                <SelectItem value="gebruiker">Gebruiker</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Invloed (1-5)</Label>
              <Input type="number" {...register("invloed")} min={1} max={5} />
              <p className="text-xs text-gray-400">Hoeveel macht heeft deze persoon?</p>
            </div>
            <div className="space-y-2">
              <Label>Belang (1-5)</Label>
              <Input type="number" {...register("belang")} min={1} max={5} />
              <p className="text-xs text-gray-400">Hoe groot is zijn/haar interesse?</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notities</Label>
            <Textarea {...register("notities")} rows={3} placeholder="Communicatieaanpak, afspraken, bijzonderheden..." />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Opslaan..." : stakeholder ? "Bijwerken" : "Toevoegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
