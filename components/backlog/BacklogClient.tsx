"use client";

import { useState, useCallback } from "react";
import { Plus, GripVertical, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StoryFormulier } from "./StoryFormulier";
import { EpicFormulier } from "./EpicFormulier";
import { MOSCOW_LABELS } from "@/lib/utils";

type Epic = {
  id: string;
  titel: string;
  kleur: string;
  beschrijving?: string | null;
  status: string;
};

type OpgeslagenEpic = Epic & { volgorde: number };

type Story = {
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

interface BacklogClientProps {
  initialStories: Story[];
  epics: Epic[];
  productId: string;
}

function SortableStoryKaart({
  story,
  onBewerken,
  onVerwijderen,
}: {
  story: Story;
  onBewerken: (story: Story) => void;
  onVerwijderen: (id: string) => void;
}) {
  const [uitgevouwen, setUitgevouwen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: story.id });

  const stijl = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const prioriteitVariant = story.prioriteit as "must" | "should" | "could" | "wont";

  return (
    <div
      ref={setNodeRef}
      style={stijl}
      className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={prioriteitVariant}>
                  {MOSCOW_LABELS[story.prioriteit]}
                </Badge>
                {story.epic && (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{ backgroundColor: story.epic.kleur }}
                  >
                    {story.epic.titel}
                  </span>
                )}
                {story.punten && (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {story.punten} pt
                  </span>
                )}
              </div>
              <p className="mt-1 font-medium text-gray-900 text-sm">{story.titel}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {(story.beschrijving || story.acceptatiecriteria) && (
                <button
                  onClick={() => setUitgevouwen(!uitgevouwen)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {uitgevouwen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
              <button
                onClick={() => onBewerken(story)}
                className="text-gray-400 hover:text-blue-600 p-1"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onVerwijderen(story.id)}
                className="text-gray-400 hover:text-red-600 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {uitgevouwen && (
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {story.beschrijving && (
                <div>
                  <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Beschrijving</p>
                  <p>{story.beschrijving}</p>
                </div>
              )}
              {story.acceptatiecriteria && (
                <div>
                  <p className="font-medium text-gray-700 text-xs uppercase tracking-wide mb-1">Acceptatiecriteria</p>
                  <pre className="whitespace-pre-wrap font-sans">{story.acceptatiecriteria}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BacklogClient({ initialStories, epics: initieleEpics, productId }: BacklogClientProps) {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [epics, setEpics] = useState<Epic[]>(initieleEpics);
  const [actieveTab, setActieveTab] = useState("alle");
  const [storyFormulierOpen, setStoryFormulierOpen] = useState(false);
  const [epicFormulierOpen, setEpicFormulierOpen] = useState(false);
  const [teBewerkenStory, setTeBewerkenStory] = useState<Story | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const gefilterde = actieveTab === "alle"
    ? stories.filter((s) => s.status === "backlog" || s.status === "sprint")
    : stories.filter((s) => s.prioriteit === actieveTab && (s.status === "backlog" || s.status === "sprint"));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oudeIndex = stories.findIndex((s) => s.id === active.id);
    const nieuweIndex = stories.findIndex((s) => s.id === over.id);
    const nieuweVolgorde = arrayMove(stories, oudeIndex, nieuweIndex);
    setStories(nieuweVolgorde);

    // Sla nieuwe volgorde op
    await fetch(`/api/stories/${active.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ volgorde: nieuweIndex + 1 }),
    });
  }

  const handleStoryOpgeslagen = useCallback((story: Story) => {
    setStories((prev) => {
      const index = prev.findIndex((s) => s.id === story.id);
      if (index >= 0) {
        const nieuw = [...prev];
        nieuw[index] = story;
        return nieuw;
      }
      return [...prev, story];
    });
    setStoryFormulierOpen(false);
    setTeBewerkenStory(undefined);
  }, []);

  const handleStoryVerwijderen = useCallback(async (id: string) => {
    if (!confirm("Weet je zeker dat je deze story wilt verwijderen?")) return;
    await fetch(`/api/stories/${id}`, { method: "DELETE" });
    setStories((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleEpicOpgeslagen = useCallback((epic: OpgeslagenEpic) => {
    setEpics((prev) => {
      const index = prev.findIndex((e) => e.id === epic.id);
      if (index >= 0) {
        const nieuw = [...prev];
        nieuw[index] = epic;
        return nieuw;
      }
      return [...prev, epic];
    });
    setEpicFormulierOpen(false);
  }, []);

  const telPerCategorie = (cat: string) =>
    stories.filter((s) => s.prioriteit === cat && (s.status === "backlog" || s.status === "sprint")).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backlog</h1>
          <p className="text-sm text-gray-500 mt-1">{stories.filter(s => s.status === "backlog" || s.status === "sprint").length} stories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEpicFormulierOpen(true)}>
            <Plus className="h-4 w-4" />
            Epic
          </Button>
          <Button size="sm" onClick={() => { setTeBewerkenStory(undefined); setStoryFormulierOpen(true); }}>
            <Plus className="h-4 w-4" />
            Story toevoegen
          </Button>
        </div>
      </div>

      {/* Epics overzicht */}
      {epics.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          {epics.map((epic) => (
            <span
              key={epic.id}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: epic.kleur }}
            >
              {epic.titel}
              <span className="ml-1.5 opacity-75">
                ({stories.filter((s) => s.epicId === epic.id).length})
              </span>
            </span>
          ))}
        </div>
      )}

      {/* MoSCoW tabs */}
      <Tabs value={actieveTab} onValueChange={setActieveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="alle">Alle ({stories.filter(s => s.status !== "gereed").length})</TabsTrigger>
          <TabsTrigger value="must">Must ({telPerCategorie("must")})</TabsTrigger>
          <TabsTrigger value="should">Should ({telPerCategorie("should")})</TabsTrigger>
          <TabsTrigger value="could">Could ({telPerCategorie("could")})</TabsTrigger>
          <TabsTrigger value="wont">Won&apos;t ({telPerCategorie("wont")})</TabsTrigger>
        </TabsList>

        <TabsContent value={actieveTab}>
          {gefilterde.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">Geen stories gevonden</p>
              <p className="text-sm mt-1">Voeg je eerste user story toe</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={gefilterde.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {gefilterde.map((story) => (
                    <SortableStoryKaart
                      key={story.id}
                      story={story}
                      onBewerken={(s) => { setTeBewerkenStory(s); setStoryFormulierOpen(true); }}
                      onVerwijderen={handleStoryVerwijderen}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </TabsContent>
      </Tabs>

      {/* Formulieren */}
      <StoryFormulier
        open={storyFormulierOpen}
        onSluiten={() => { setStoryFormulierOpen(false); setTeBewerkenStory(undefined); }}
        onOpgeslagen={handleStoryOpgeslagen}
        story={teBewerkenStory}
        epics={epics}
      />
      <EpicFormulier
        open={epicFormulierOpen}
        onSluiten={() => setEpicFormulierOpen(false)}
        onOpgeslagen={handleEpicOpgeslagen}
        productId={productId}
      />
    </div>
  );
}
