"use client";

import Link from "next/link";
import {
  List,
  CalendarDays,
  Target,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDatum } from "@/lib/utils";

type Product = { id: string; naam: string; visie?: string | null };

type Statistieken = {
  totalStories: number;
  backlogStories: number;
  gereedStories: number;
  sprintStories: number;
  mustHave: number;
  shouldHave: number;
  couldHave: number;
  wontHave: number;
  backlogPunten: number;
  activeSprint: {
    naam: string;
    totalItems: number;
    totalPunten: number;
    startDatum: Date | string;
    eindDatum: Date | string;
  } | null;
  aantalStakeholders: number;
  aantalOkrs: number;
};

interface Props {
  product: Product | null;
  statistieken: Statistieken;
}

function KpiKaart({
  label,
  waarde,
  subtext,
  icon: Icon,
  kleur,
  href,
}: {
  label: string;
  waarde: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  kleur: string;
  href?: string;
}) {
  const inhoud = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{waarde}</p>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
          </div>
          <div className={`p-2.5 rounded-lg ${kleur}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {href && (
          <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            Bekijk <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{inhoud}</Link> : inhoud;
}

export function DashboardClient({ product, statistieken: s }: Props) {
  const gezondheidsScore = s.totalStories > 0
    ? Math.round((s.gereedStories / s.totalStories) * 100)
    : 0;

  const moscow = [
    { label: "Must", waarde: s.mustHave, kleur: "#ef4444" },
    { label: "Should", waarde: s.shouldHave, kleur: "#f97316" },
    { label: "Could", waarde: s.couldHave, kleur: "#3b82f6" },
    { label: "Won't", waarde: s.wontHave, kleur: "#9ca3af" },
  ];
  const totaalMoscow = moscow.reduce((sum, m) => sum + m.waarde, 0) || 1;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {product?.naam ?? "Dashboard"}
        </h1>
        {product?.visie && (
          <p className="text-sm text-gray-500 mt-1 max-w-2xl">{product.visie}</p>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KpiKaart
          label="Backlog items"
          waarde={s.backlogStories}
          subtext={`${s.backlogPunten} story points`}
          icon={List}
          kleur="bg-indigo-100 text-indigo-600"
          href="/backlog"
        />
        <KpiKaart
          label="In sprint"
          waarde={s.sprintStories}
          subtext={s.activeSprint ? `Sprint: ${s.activeSprint.naam}` : "Geen actieve sprint"}
          icon={CalendarDays}
          kleur="bg-blue-100 text-blue-600"
          href="/sprints"
        />
        <KpiKaart
          label="Stakeholders"
          waarde={s.aantalStakeholders}
          icon={Users}
          kleur="bg-purple-100 text-purple-600"
          href="/stakeholders"
        />
        <KpiKaart
          label="Actieve OKRs"
          waarde={s.aantalOkrs}
          icon={Target}
          kleur="bg-green-100 text-green-600"
          href="/strategie"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* MoSCoW verdeling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Backlog prioritering (MoSCoW)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {s.totalStories === 0 ? (
              <p className="text-sm text-gray-400">Nog geen stories in de backlog</p>
            ) : (
              <div className="space-y-3">
                {moscow.map((m) => (
                  <div key={m.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium" style={{ color: m.kleur }}>{m.label} Have</span>
                      <span className="text-gray-500">{m.waarde} stories</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(m.waarde / totaalMoscow) * 100}%`,
                          backgroundColor: m.kleur,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sprint voortgang */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              Actieve sprint
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!s.activeSprint ? (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-400">Geen actieve sprint</p>
                <Link href="/sprints" className="text-sm text-primary hover:underline mt-1 inline-block">
                  Sprint aanmaken →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900">{s.activeSprint.naam}</p>
                  <p className="text-sm text-gray-500">
                    {formatDatum(s.activeSprint.startDatum)} – {formatDatum(s.activeSprint.eindDatum)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-700">{s.activeSprint.totalItems}</p>
                    <p className="text-xs text-blue-500">Stories</p>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-700">{s.activeSprint.totalPunten}</p>
                    <p className="text-xs text-indigo-500">Story points</p>
                  </div>
                </div>
                <Link href="/sprints" className="flex items-center gap-1 text-sm text-primary hover:underline">
                  Naar sprint board <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Backlog gezondheid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Backlog gezondheid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-4xl font-bold text-gray-900">{gezondheidsScore}%</span>
              <div className="text-right text-sm text-gray-500">
                <p>{s.gereedStories} gereed</p>
                <p>{s.totalStories} totaal</p>
              </div>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${gezondheidsScore}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-gray-50 rounded p-2">
                <p className="font-semibold text-gray-700">{s.backlogStories}</p>
                <p className="text-gray-400">Backlog</p>
              </div>
              <div className="bg-blue-50 rounded p-2">
                <p className="font-semibold text-blue-700">{s.sprintStories}</p>
                <p className="text-blue-400">In sprint</p>
              </div>
              <div className="bg-green-50 rounded p-2">
                <p className="font-semibold text-green-700">{s.gereedStories}</p>
                <p className="text-green-400">Gereed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Snelle acties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Snelle navigatie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: "/backlog", label: "Backlog beheren", icon: List, kleur: "text-indigo-600 bg-indigo-50" },
                { href: "/sprints", label: "Sprint plannen", icon: CalendarDays, kleur: "text-blue-600 bg-blue-50" },
                { href: "/strategie", label: "Strategie & OKRs", icon: Target, kleur: "text-green-600 bg-green-50" },
                { href: "/stakeholders", label: "Stakeholders", icon: Users, kleur: "text-purple-600 bg-purple-50" },
              ].map(({ href, label, icon: Icon, kleur }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className={`p-2 rounded-md ${kleur}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
