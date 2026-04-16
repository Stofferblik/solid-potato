"use client";

import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOSCOW_LABELS } from "@/lib/utils";

type Epic = { id: string; titel: string; kleur: string };

type Story = {
  id: string;
  titel: string;
  beschrijving?: string | null;
  prioriteit: string;
  punten?: number | null;
  status: string;
  epic?: Epic | null;
};

type SprintItem = {
  id: string;
  status: string;
  storyId: string;
  story: Story;
};

type Sprint = {
  id: string;
  naam: string;
  doel?: string | null;
  status: string;
  startDatum: Date | string;
  eindDatum: Date | string;
  items: SprintItem[];
};

interface SprintBoardClientProps {
  sprint: Sprint;
  backlogStories: Story[];
}

const KOLOMMEN = [
  { id: "todo", label: "Te doen", kleur: "border-gray-200 bg-gray-50" },
  { id: "bezig", label: "Bezig", kleur: "border-blue-200 bg-blue-50" },
  { id: "klaar", label: "Klaar", kleur: "border-green-200 bg-green-50" },
];

function StoryKaart({
  item,
  onStatusWijzigen,
  onVerwijderen,
}: {
  item: SprintItem;
  onStatusWijzigen: (storyId: string, status: string) => void;
  onVerwijderen: (storyId: string) => void;
}) {
  const prioriteitVariant = item.story.prioriteit as "must" | "should" | "could" | "wont";

  const volgendeStatus = item.status === "todo" ? "bezig" : item.status === "bezig" ? "klaar" : null;
  const vorigeStatus = item.status === "klaar" ? "bezig" : item.status === "bezig" ? "todo" : null;

  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm group">
      <div className="flex items-start justify-between gap-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <Badge variant={prioriteitVariant} className="text-xs">
              {MOSCOW_LABELS[item.story.prioriteit]}
            </Badge>
            {item.story.punten && (
              <span className="text-xs bg-gray-100 text-gray-600 rounded-full px-1.5 py-0.5">
                {item.story.punten}pt
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900">{item.story.titel}</p>
          {item.story.epic && (
            <span
              className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs text-white mt-1"
              style={{ backgroundColor: item.story.epic.kleur }}
            >
              {item.story.epic.titel}
            </span>
          )}
        </div>
        <button
          onClick={() => onVerwijderen(item.storyId)}
          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-1 mt-2">
        {vorigeStatus && (
          <button
            onClick={() => onStatusWijzigen(item.storyId, vorigeStatus)}
            className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-100"
          >
            ← Terug
          </button>
        )}
        {volgendeStatus && (
          <button
            onClick={() => onStatusWijzigen(item.storyId, volgendeStatus)}
            className="text-xs text-blue-500 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 ml-auto"
          >
            Volgende →
          </button>
        )}
      </div>
    </div>
  );
}

export function SprintBoardClient({ sprint: initiSprint, backlogStories: initieleBacklog }: SprintBoardClientProps) {
  const [sprint, setSprint] = useState<Sprint>(initiSprint);
  const [backlog, setBacklog] = useState<Story[]>(initieleBacklog);
  const [backlogZichtbaar, setBacklogZichtbaar] = useState(false);

  const itemsPerKolom = (status: string) =>
    sprint.items.filter((item) => item.status === status);

  const totalePunten = sprint.items.reduce((sum, item) => sum + (item.story.punten ?? 0), 0);
  const klaarPunten = sprint.items
    .filter((i) => i.status === "klaar")
    .reduce((sum, item) => sum + (item.story.punten ?? 0), 0);

  async function handleStatusWijzigen(storyId: string, status: string) {
    await fetch(`/api/sprints/${sprint.id}/items`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, status }),
    });
    setSprint((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.storyId === storyId ? { ...item, status } : item
      ),
    }));
  }

  async function handleStoryToevoegen(story: Story) {
    const res = await fetch(`/api/sprints/${sprint.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: story.id }),
    });
    const item = await res.json();
    setSprint((prev) => ({
      ...prev,
      items: [...prev.items, { ...item, story }],
    }));
    setBacklog((prev) => prev.filter((s) => s.id !== story.id));
  }

  async function handleStoryVerwijderen(storyId: string) {
    await fetch(`/api/sprints/${sprint.id}/items?storyId=${storyId}`, {
      method: "DELETE",
    });
    const verwijderd = sprint.items.find((i) => i.storyId === storyId);
    if (verwijderd) {
      setBacklog((prev) => [...prev, verwijderd.story]);
    }
    setSprint((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.storyId !== storyId),
    }));
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/sprints" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-4 w-4" />
          Terug naar sprints
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sprint.naam}</h1>
            {sprint.doel && <p className="text-sm text-gray-500 mt-1">{sprint.doel}</p>}
            <p className="text-sm text-gray-500 mt-1">
              {totalePunten > 0 ? `${klaarPunten} / ${totalePunten} punten klaar` : `${sprint.items.length} stories`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBacklogZichtbaar(!backlogZichtbaar)}
          >
            <Plus className="h-4 w-4" />
            Story toevoegen
          </Button>
        </div>
      </div>

      {/* Backlog picker */}
      {backlogZichtbaar && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-3">Stories uit backlog toevoegen</h3>
            {backlog.length === 0 ? (
              <p className="text-sm text-gray-400">Geen stories beschikbaar in de backlog</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {backlog.map((story) => (
                  <div
                    key={story.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={story.prioriteit as "must" | "should" | "could" | "wont"} className="text-xs">
                        {MOSCOW_LABELS[story.prioriteit]}
                      </Badge>
                      <span className="text-sm">{story.titel}</span>
                      {story.punten && (
                        <span className="text-xs text-gray-400">{story.punten}pt</span>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleStoryToevoegen(story)}>
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban board */}
      <div className="grid grid-cols-3 gap-4">
        {KOLOMMEN.map((kolom) => {
          const items = itemsPerKolom(kolom.id);
          return (
            <div key={kolom.id} className={`rounded-lg border-2 p-4 min-h-64 ${kolom.kleur}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-700">{kolom.label}</h3>
                <span className="text-xs bg-white border rounded-full px-2 py-0.5 text-gray-500">
                  {items.length}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <StoryKaart
                    key={item.id}
                    item={item}
                    onStatusWijzigen={handleStatusWijzigen}
                    onVerwijderen={handleStoryVerwijderen}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
