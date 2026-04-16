"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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

type Product = {
  id: string;
  naam: string;
  visie?: string | null;
  beschrijving?: string | null;
};

interface Props {
  open: boolean;
  onSluiten: () => void;
  product: Product | null;
  onOpgeslagen: (product: unknown) => void;
}

export function ProductVisieFormulier({ open, onSluiten, product, onOpgeslagen }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      naam: product?.naam ?? "",
      visie: product?.visie ?? "",
      beschrijving: product?.beschrijving ?? "",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        naam: product.naam,
        visie: product.visie ?? "",
        beschrijving: product.beschrijving ?? "",
      });
    }
  }, [product, reset]);

  async function onSubmit(data: { naam: string; visie: string; beschrijving: string }) {
    const res = await fetch("/api/product", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const bijgewerkt = await res.json();
    onOpgeslagen(bijgewerkt);
  }

  return (
    <Dialog open={open} onOpenChange={onSluiten}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Product visie bewerken</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Productnaam</Label>
            <Input {...register("naam")} />
          </div>
          <div className="space-y-2">
            <Label>Visie</Label>
            <Textarea
              {...register("visie")}
              rows={4}
              placeholder="Onze visie is om..."
            />
          </div>
          <div className="space-y-2">
            <Label>Beschrijving</Label>
            <Textarea
              {...register("beschrijving")}
              rows={3}
              placeholder="Meer details over het product..."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onSluiten}>Annuleren</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Opslaan..." : "Opslaan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
