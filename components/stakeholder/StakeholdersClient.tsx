"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StakeholderFormulier } from "./StakeholderFormulier";
import { PowerInterestGrid } from "./PowerInterestGrid";
import { CATEGORIE_LABELS } from "@/lib/utils";

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
  initialStakeholders: Stakeholder[];
}

const CATEGORIE_KLEUREN: Record<string, string> = {
  sponsor: "bg-purple-100 text-purple-800",
  gebruiker: "bg-blue-100 text-blue-800",
  expert: "bg-green-100 text-green-800",
  management: "bg-orange-100 text-orange-800",
};

export function StakeholdersClient({ initialStakeholders }: Props) {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(initialStakeholders);
  const [formulierOpen, setFormulierOpen] = useState(false);
  const [teBewerken, setTeBewerken] = useState<Stakeholder | undefined>();

  const handleOpgeslagen = (stakeholder: Stakeholder) => {
    setStakeholders((prev) => {
      const index = prev.findIndex((s) => s.id === stakeholder.id);
      if (index >= 0) {
        const nieuw = [...prev];
        nieuw[index] = stakeholder;
        return nieuw;
      }
      return [...prev, stakeholder].sort((a, b) => a.naam.localeCompare(b.naam));
    });
    setFormulierOpen(false);
    setTeBewerken(undefined);
  };

  const handleVerwijderen = async (id: string) => {
    if (!confirm("Stakeholder verwijderen?")) return;
    await fetch(`/api/stakeholders/${id}`, { method: "DELETE" });
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stakeholders</h1>
          <p className="text-sm text-gray-500 mt-1">{stakeholders.length} stakeholders</p>
        </div>
        <Button size="sm" onClick={() => { setTeBewerken(undefined); setFormulierOpen(true); }}>
          <Plus className="h-4 w-4" />
          Stakeholder toevoegen
        </Button>
      </div>

      <Tabs defaultValue="lijst">
        <TabsList className="mb-4">
          <TabsTrigger value="lijst">Lijst</TabsTrigger>
          <TabsTrigger value="matrix">Power-Interest Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="lijst">
          {stakeholders.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nog geen stakeholders</p>
              <p className="text-sm mt-1">Voeg je eerste stakeholder toe</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stakeholders.map((s) => (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-gray-900">{s.naam}</h3>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORIE_KLEUREN[s.categorie] ?? "bg-gray-100 text-gray-600"}`}>
                            {CATEGORIE_LABELS[s.categorie] ?? s.categorie}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                          {s.rol && <span>{s.rol}</span>}
                          {s.organisatie && <span>· {s.organisatie}</span>}
                          {s.email && (
                            <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-primary">
                              <Mail className="h-3.5 w-3.5" />
                              {s.email}
                            </a>
                          )}
                          {s.telefoon && (
                            <a href={`tel:${s.telefoon}`} className="flex items-center gap-1 hover:text-primary">
                              <Phone className="h-3.5 w-3.5" />
                              {s.telefoon}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>Invloed:</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-4 rounded-sm ${i < s.invloed ? "bg-primary" : "bg-gray-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span>Belang:</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={`h-2 w-4 rounded-sm ${i < s.belang ? "bg-green-500" : "bg-gray-200"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {s.notities && (
                          <p className="text-xs text-gray-400 mt-2 italic">{s.notities}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => { setTeBewerken(s); setFormulierOpen(true); }}
                          className="text-gray-400 hover:text-blue-600 p-1"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleVerwijderen(s.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix">
          <PowerInterestGrid stakeholders={stakeholders} />
        </TabsContent>
      </Tabs>

      <StakeholderFormulier
        open={formulierOpen}
        onSluiten={() => { setFormulierOpen(false); setTeBewerken(undefined); }}
        onOpgeslagen={handleOpgeslagen}
        stakeholder={teBewerken}
      />
    </div>
  );
}
