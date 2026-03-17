import { getPluginBySlug } from "@/data/queries";
import { OG, OGLayout, createOGResponse, formatCount } from "@/lib/og";

export const alt = "Plugin";
export const size = { width: OG.width, height: OG.height };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getPluginBySlug(slug);

  if (!data) {
    return createOGResponse(
      <OGLayout>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            color: OG.text,
          }}
        >
          Plugin not found
        </div>
      </OGLayout>,
    );
  }

  const components = data.plugin_components ?? [];
  const typeCounts: Record<string, number> = {};
  for (const c of components) {
    typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
  }
  const componentSummary = Object.entries(typeCounts)
    .map(([type, count]) => `${count} ${type}${count > 1 ? "s" : ""}`)
    .join(" · ");

  return createOGResponse(
    <OGLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {data.logo && (
            <img
              src={data.logo}
              width={72}
              height={72}
              style={{ borderRadius: 16, border: `1px solid ${OG.border}` }}
            />
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                color: OG.text,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {data.name}
            </div>
            {data.author_name && (
              <div style={{ fontSize: 22, color: OG.textSecondary }}>
                by {data.author_name}
              </div>
            )}
          </div>
        </div>

        {data.description && (
          <div
            style={{
              fontSize: 24,
              color: OG.textSecondary,
              lineHeight: 1.4,
              maxWidth: 900,
            }}
          >
            {data.description.length > 150
              ? `${data.description.slice(0, 150)}...`
              : data.description}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 22,
              color: OG.text,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#f5a623"
              stroke="#f5a623"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontWeight: 700 }}>{formatCount(data.star_count)}</span>
          </div>

          {componentSummary && (
            <div style={{ fontSize: 20, color: OG.textTertiary }}>
              {componentSummary}
            </div>
          )}
        </div>

        {data.keywords && data.keywords.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.keywords.slice(0, 6).map((kw) => (
              <div
                key={kw}
                style={{
                  fontSize: 16,
                  color: OG.textSecondary,
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1px solid ${OG.border}`,
                  backgroundColor: OG.cardBg,
                }}
              >
                {kw}
              </div>
            ))}
          </div>
        )}
      </div>
    </OGLayout>,
  );
}
