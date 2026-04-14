"use client";

type Stakeholder = {
  id: string;
  naam: string;
  invloed: number;
  belang: number;
  categorie: string;
};

const CATEGORIE_KLEUREN_HEX: Record<string, string> = {
  sponsor: "#7c3aed",
  gebruiker: "#2563eb",
  expert: "#16a34a",
  management: "#ea580c",
};

interface Props {
  stakeholders: Stakeholder[];
}

export function PowerInterestGrid({ stakeholders }: Props) {
  const BREEDTE = 480;
  const HOOGTE = 400;
  const MARGE = 48;

  // invloed = Y-as (1-5, hoog = boven)
  // belang = X-as (1-5, hoog = rechts)
  function xPositie(belang: number) {
    return MARGE + ((belang - 1) / 4) * (BREEDTE - 2 * MARGE);
  }
  function yPositie(invloed: number) {
    return HOOGTE - MARGE - ((invloed - 1) / 4) * (HOOGTE - 2 * MARGE);
  }

  const kwadranten = [
    { label: "Geïnformeerd houden", x: 0, y: 0, breedte: "50%", hoogte: "50%", kleur: "bg-yellow-50" },
    { label: "Nauw betrekken", x: "50%", y: 0, breedte: "50%", hoogte: "50%", kleur: "bg-green-50" },
    { label: "Monitoren", x: 0, y: "50%", breedte: "50%", hoogte: "50%", kleur: "bg-gray-50" },
    { label: "Tevreden houden", x: "50%", y: "50%", breedte: "50%", hoogte: "50%", kleur: "bg-blue-50" },
  ];

  return (
    <div className="bg-white border rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Power-Interest Matrix</h3>
      <p className="text-sm text-gray-500 mb-6">
        X-as = Belang (interesse in het project) · Y-as = Invloed (macht om het project te beïnvloeden)
      </p>

      <div className="relative w-full max-w-2xl mx-auto" style={{ aspectRatio: `${BREEDTE}/${HOOGTE}` }}>
        <svg
          viewBox={`0 0 ${BREEDTE} ${HOOGTE}`}
          className="w-full h-full"
          style={{ fontFamily: "inherit" }}
        >
          {/* Kwadrant achtergronden */}
          <rect x={MARGE} y={MARGE} width={(BREEDTE - 2 * MARGE) / 2} height={(HOOGTE - 2 * MARGE) / 2} fill="#fef9c3" rx="4" />
          <rect x={(BREEDTE + 2 * MARGE) / 2} y={MARGE} width={(BREEDTE - 2 * MARGE) / 2} height={(HOOGTE - 2 * MARGE) / 2} fill="#f0fdf4" rx="4" />
          <rect x={MARGE} y={(HOOGTE + 2 * MARGE) / 2} width={(BREEDTE - 2 * MARGE) / 2} height={(HOOGTE - 2 * MARGE) / 2} fill="#f9fafb" rx="4" />
          <rect x={(BREEDTE + 2 * MARGE) / 2} y={(HOOGTE + 2 * MARGE) / 2} width={(BREEDTE - 2 * MARGE) / 2} height={(HOOGTE - 2 * MARGE) / 2} fill="#eff6ff" rx="4" />

          {/* Kwadrant labels */}
          <text x={MARGE + (BREEDTE - 2 * MARGE) / 4} y={MARGE + 16} textAnchor="middle" fill="#78716c" fontSize="10" fontWeight="600">
            GEÏNFORMEERD HOUDEN
          </text>
          <text x={(3 * BREEDTE - 2 * MARGE) / 4} y={MARGE + 16} textAnchor="middle" fill="#15803d" fontSize="10" fontWeight="600">
            NAUW BETREKKEN
          </text>
          <text x={MARGE + (BREEDTE - 2 * MARGE) / 4} y={(HOOGTE + 2 * MARGE) / 2 + 16} textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="600">
            MONITOREN
          </text>
          <text x={(3 * BREEDTE - 2 * MARGE) / 4} y={(HOOGTE + 2 * MARGE) / 2 + 16} textAnchor="middle" fill="#1d4ed8" fontSize="10" fontWeight="600">
            TEVREDEN HOUDEN
          </text>

          {/* Assen */}
          <line x1={MARGE} y1={MARGE} x2={MARGE} y2={HOOGTE - MARGE} stroke="#d1d5db" strokeWidth="1" />
          <line x1={MARGE} y1={HOOGTE - MARGE} x2={BREEDTE - MARGE} y2={HOOGTE - MARGE} stroke="#d1d5db" strokeWidth="1" />

          {/* Midden lijn */}
          <line x1={(BREEDTE) / 2} y1={MARGE} x2={(BREEDTE) / 2} y2={HOOGTE - MARGE} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />
          <line x1={MARGE} y1={HOOGTE / 2} x2={BREEDTE - MARGE} y2={HOOGTE / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />

          {/* As labels */}
          <text x={BREEDTE / 2} y={HOOGTE - 8} textAnchor="middle" fill="#6b7280" fontSize="11">
            Belang →
          </text>
          <text x={12} y={HOOGTE / 2} textAnchor="middle" fill="#6b7280" fontSize="11" transform={`rotate(-90, 12, ${HOOGTE / 2})`}>
            Invloed →
          </text>

          {/* Stakeholder punten */}
          {stakeholders.map((s) => {
            const x = xPositie(s.belang);
            const y = yPositie(s.invloed);
            const kleur = CATEGORIE_KLEUREN_HEX[s.categorie] ?? "#6366f1";
            return (
              <g key={s.id}>
                <circle cx={x} cy={y} r={16} fill={kleur} fillOpacity={0.9} />
                <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">
                  {s.naam.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase()}
                </text>
                <text x={x} y={y + 28} textAnchor="middle" fill="#374151" fontSize="9">
                  {s.naam.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {stakeholders.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5 text-xs text-gray-600">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: CATEGORIE_KLEUREN_HEX[s.categorie] ?? "#6366f1" }}
            />
            {s.naam}
          </div>
        ))}
      </div>
    </div>
  );
}
