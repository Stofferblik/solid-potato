"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CalendarDays, ChevronRight, CheckCircle2, Circle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SprintFormulier } from "./SprintFormulier";
import { formatDatum } from "@/lib/utils";

type SprintItem = {
  story: { punten?: number | null; status: string };
};

type Sprint = {
  id: string;
  naam: string;
  doel?: string | null;
  startDatum: Date | string;
  eindDatum: Date | string;
  status: string;
  items: SprintItem[];
};

interface SprintsClientProps {
  initialSprints: Sprint[];
}

function statusBadge(status: string) {
  if (status === "actief") return <Badge className="bg-green-100 text-green-800 border-green-200 border">Actief</Badge>;
  if (status === "voltooid") return <Badge className="bg-gray-100 text-gray-600 border-gray-200 border">Voltooid</Badge>;
  return <Badge className="bg-blue-100 text-blue-800 border-blue-200 border">Gepland</Badge>;
}

export function SprintsClient({ initialSprints }: SprintsClientProps) {
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
  const [formulierOpen, setFormulierOpen] = useState(false);

  const handleSprintOpgeslagen = (sprint: { id: string; naam: string; doel?: string | null; startDatum: Date | string; eindDatum: Date | string; status: string; items: SprintItem[] }) => {
    setSprints((prev) => {
      const index = prev.findIndex((s) => s.id === sprint.id);
      if (index >= 0) {
        const nieuw = [...prev];
        nieuw[index] = sprint;
        return nieuw;
      }
      return [sprint, ...prev];
    });
    setFormulierOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sprints</h1>
          <p className="text-sm text-gray-500 mt-1">{sprints.length} sprints</p>
        </div>
        <Button size="sm" onClick={() => setFormulierOpen(true)}>
          <Plus className="h-4 w-4" />
          Nieuwe sprint
        </Button>
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nog geen sprints</p>
          <p className="text-sm mt-1">Maak je eerste sprint aan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const totalePunten = sprint.items.reduce((sum, item) => sum + (item.story.punten ?? 0), 0);
            const klaarItems = sprint.items.filter((i) => i.story.status === "gereed").length;
            const totalItems = sprint.items.length;
            const voortgang = totalItems > 0 ? Math.round((klaarItems / totalItems) * 100) : 0;

            return (
              <Card key={sprint.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base">{sprint.naam}</CardTitle>
                        {statusBadge(sprint.status)}
                      </div>
                      {sprint.doel && (
                        <p className="text-sm text-gray-500 mt-1">{sprint.doel}</p>
                      )}
                    </div>
                    <Link href={`/sprints/${sprint.id}`}>
                      <Button variant="ghost" size="sm">
                        Board <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDatum(sprint.startDatum)} – {formatDatum(sprint.eindDatum)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Circle className="h-4 w-4" />
                      <span>{totalItems} stories · {totalePunten} punten</span>
                    </div>
                    {totalItems > 0 && (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{voortgang}% klaar</span>
                      </div>
                    )}
                  </div>
                  {totalItems > 0 && (
                    <div className="mt-3">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${voortgang}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SprintFormulier
        open={formulierOpen}
        onSluiten={() => setFormulierOpen(false)}
        onOpgeslagen={handleSprintOpgeslagen}
      />
    </div>
  );
}
