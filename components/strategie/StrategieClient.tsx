"use client";

import { useState } from "react";
import { Plus, Target, Map, Pencil, Trash2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OKRFormulier } from "./OKRFormulier";
import { RoadmapFormulier } from "./RoadmapFormulier";
import { ProductVisieFormulier } from "./ProductVisieFormulier";
import { kwartaalNaam } from "@/lib/utils";

type KeyResult = {
  id: string;
  beschrijving: string;
  target: string;
  huidig: string;
  eenheid?: string | null;
};

type OKR = {
  id: string;
  objective: string;
  kwartaal: number;
  jaar: number;
  productId: string;
  keyResults: KeyResult[];
};

type RoadmapItem = {
  id: string;
  titel: string;
  beschrijving?: string | null;
  kwartaal: number;
  jaar: number;
  status: string;
  productId: string;
  epicId?: string | null;
  epic?: { id: string; titel: string; kleur: string } | null;
};

type Product = {
  id: string;
  naam: string;
  visie?: string | null;
  beschrijving?: string | null;
};

type Epic = {
  id: string;
  titel: string;
  kleur: string;
};

interface StrategieClientProps {
  product: Product | null;
  okrs: OKR[];
  roadmapItems: RoadmapItem[];
  epics: Epic[];
}

function voortgangPercentage(huidig: string, target: string): number {
  const h = parseFloat(huidig) || 0;
  const t = parseFloat(target) || 1;
  return Math.min(Math.round((h / t) * 100), 100);
}

function statusKleur(status: string) {
  if (status === "gereed") return "bg-green-100 text-green-800";
  if (status === "bezig") return "bg-blue-100 text-blue-800";
  return "bg-gray-100 text-gray-600";
}

function statusLabel(status: string) {
  if (status === "gereed") return "Gereed";
  if (status === "bezig") return "Bezig";
  return "Gepland";
}

export function StrategieClient({ product: initProduct, okrs: initOkrs, roadmapItems: initRoadmap, epics }: StrategieClientProps) {
  const [product, setProduct] = useState(initProduct);
  const [okrs, setOkrs] = useState<OKR[]>(initOkrs);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(initRoadmap);
  const [okrFormOpen, setOkrFormOpen] = useState(false);
  const [roadmapFormOpen, setRoadmapFormOpen] = useState(false);
  const [visieFormOpen, setVisieFormOpen] = useState(false);

  const productId = product?.id ?? "product-1";

  // Groepeer roadmap per kwartaal
  const kwartalen = Array.from(
    new Set(roadmap.map((r) => `${r.jaar}-Q${r.kwartaal}`))
  ).sort();

  async function handleKeyResultUpdate(okrId: string, krId: string, huidig: string) {
    await fetch(`/api/okrs/${okrId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyResultId: krId, huidig }),
    });
    setOkrs((prev) =>
      prev.map((okr) =>
        okr.id === okrId
          ? {
              ...okr,
              keyResults: okr.keyResults.map((kr) =>
                kr.id === krId ? { ...kr, huidig } : kr
              ),
            }
          : okr
      )
    );
  }

  async function handleOkrVerwijderen(id: string) {
    if (!confirm("OKR verwijderen?")) return;
    await fetch(`/api/okrs/${id}`, { method: "DELETE" });
    setOkrs((prev) => prev.filter((o) => o.id !== id));
  }

  async function handleRoadmapItemVerwijderen(id: string) {
    if (!confirm("Roadmap item verwijderen?")) return;
    await fetch(`/api/roadmap?id=${id}`, { method: "DELETE" });
    setRoadmap((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Strategie</h1>
          <p className="text-sm text-gray-500 mt-1">Product visie, OKRs en roadmap</p>
        </div>
      </div>

      <Tabs defaultValue="visie">
        <TabsList className="mb-6">
          <TabsTrigger value="visie">Product Visie</TabsTrigger>
          <TabsTrigger value="okrs">OKRs ({okrs.length})</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap ({roadmap.length})</TabsTrigger>
        </TabsList>

        {/* Product Visie tab */}
        <TabsContent value="visie">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {product?.naam ?? "Mijn Product"}
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setVisieFormOpen(true)}>
                  <Pencil className="h-4 w-4" />
                  Bewerken
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">Product Visie</p>
                {product?.visie ? (
                  <p className="text-gray-700 leading-relaxed">{product.visie}</p>
                ) : (
                  <p className="text-gray-400 italic">Nog geen visie ingesteld. Klik op bewerken om je product visie toe te voegen.</p>
                )}
              </div>
              {product?.beschrijving && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-2">Beschrijving</p>
                  <p className="text-gray-700 leading-relaxed">{product.beschrijving}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* OKRs tab */}
        <TabsContent value="okrs">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{okrs.length} OKRs</p>
            <Button size="sm" onClick={() => setOkrFormOpen(true)}>
              <Plus className="h-4 w-4" />
              OKR toevoegen
            </Button>
          </div>

          {okrs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nog geen OKRs</p>
              <p className="text-sm mt-1">Maak je eerste Objective en Key Results aan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {okrs.map((okr) => (
                <Card key={okr.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                          {kwartaalNaam(okr.kwartaal, okr.jaar)}
                        </p>
                        <CardTitle className="text-base">{okr.objective}</CardTitle>
                      </div>
                      <button
                        onClick={() => handleOkrVerwijderen(okr.id)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {okr.keyResults.map((kr) => {
                      const pct = voortgangPercentage(kr.huidig, kr.target);
                      return (
                        <div key={kr.id} className="space-y-1.5">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{kr.beschrijving}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={kr.huidig}
                                onChange={(e) => handleKeyResultUpdate(okr.id, kr.id, e.target.value)}
                                className="w-16 text-right text-sm border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-gray-400 text-xs">/ {kr.target} {kr.eenheid}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-green-500" : pct >= 70 ? "bg-blue-500" : "bg-orange-400"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 text-right">{pct}%</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Roadmap tab */}
        <TabsContent value="roadmap">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{roadmap.length} items</p>
            <Button size="sm" onClick={() => setRoadmapFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Item toevoegen
            </Button>
          </div>

          {kwartalen.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Map className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nog geen roadmap items</p>
              <p className="text-sm mt-1">Plan je eerste feature of milestone</p>
            </div>
          ) : (
            <div className="space-y-6">
              {kwartalen.map((kwartaalKey) => {
                const [jaar, q] = kwartaalKey.split("-Q");
                const items = roadmap.filter(
                  (r) => r.jaar === parseInt(jaar) && r.kwartaal === parseInt(q)
                );
                return (
                  <div key={kwartaalKey}>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="inline-flex items-center bg-primary/10 text-primary rounded-md px-2 py-0.5 text-sm font-medium">
                        Q{q} {jaar}
                      </span>
                      <span className="text-sm text-gray-400">{items.length} items</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {items.map((item) => (
                        <div key={item.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusKleur(item.status)}`}>
                                {statusLabel(item.status)}
                              </span>
                              {item.epic && (
                                <span
                                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs text-white"
                                  style={{ backgroundColor: item.epic.kleur }}
                                >
                                  {item.epic.titel}
                                </span>
                              )}
                            </div>
                            <p className="font-medium text-sm text-gray-900">{item.titel}</p>
                            {item.beschrijving && (
                              <p className="text-xs text-gray-500 mt-1">{item.beschrijving}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRoadmapItemVerwijderen(item.id)}
                            className="text-gray-300 hover:text-red-500 ml-2 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Formulieren */}
      <OKRFormulier
        open={okrFormOpen}
        onSluiten={() => setOkrFormOpen(false)}
        onOpgeslagen={(okr) => { setOkrs((prev) => [okr as OKR, ...prev]); setOkrFormOpen(false); }}
        productId={productId}
      />
      <RoadmapFormulier
        open={roadmapFormOpen}
        onSluiten={() => setRoadmapFormOpen(false)}
        onOpgeslagen={(item) => { setRoadmap((prev) => [...prev, item as RoadmapItem].sort((a, b) => a.jaar - b.jaar || a.kwartaal - b.kwartaal)); setRoadmapFormOpen(false); }}
        productId={productId}
        epics={epics}
      />
      <ProductVisieFormulier
        open={visieFormOpen}
        onSluiten={() => setVisieFormOpen(false)}
        product={product}
        onOpgeslagen={(p) => { setProduct(p as Product); setVisieFormOpen(false); }}
      />
    </div>
  );
}
