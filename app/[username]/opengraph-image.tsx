import { ImageResponse } from "next/og";

export const alt = "MyLink profile";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type FirestoreValue = {
  stringValue?: string;
  integerValue?: string;
};

type FirestoreDocument = {
  fields?: Record<string, FirestoreValue>;
};

function getStringField(document: FirestoreDocument | null, field: string) {
  return document?.fields?.[field]?.stringValue || "";
}

function getIntegerField(document: FirestoreDocument | null, field: string) {
  const value = document?.fields?.[field]?.integerValue;
  return value ? Number(value) : 0;
}

function normalizeRouteKey(value: string) {
  const decodedValue = (() => {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  })();

  return decodedValue
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[/#?[\]]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function getDocument(path: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    { next: { revalidate: 60 } },
  );

  if (!response.ok) return null;

  return (await response.json()) as FirestoreDocument;
}

async function getCollection(path: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return [];

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    { next: { revalidate: 60 } },
  );

  if (!response.ok) return [];

  const data = (await response.json()) as { documents?: FirestoreDocument[] };
  return data.documents || [];
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const routeKey = normalizeRouteKey(username);
  const routeDocument = await getDocument(
    `profileRoutes/${encodeURIComponent(routeKey)}`,
  );
  const userId = getStringField(routeDocument, "userId");
  const profileDocument = userId
    ? await getDocument(`users/${encodeURIComponent(userId)}/profile/main`)
    : null;
  const linkDocuments = userId
    ? await getCollection(`users/${encodeURIComponent(userId)}/links`)
    : [];

  const displayName = getStringField(profileDocument, "displayName") || "MyLink";
  const profileRouteKey = getStringField(profileDocument, "routeKey") || routeKey;
  const bio = getStringField(profileDocument, "bio") || "My personal links";
  const photoURL = getStringField(profileDocument, "photoURL");
  const linkCount = linkDocuments.length;
  const totalClickCount = linkDocuments.reduce(
    (total, document) => total + getIntegerField(document, "clickCount"),
    0,
  );
  const topLinks = linkDocuments
    .map((document) => ({
      title: getStringField(document, "title") || "Link",
      clickCount: getIntegerField(document, "clickCount"),
    }))
    .sort((first, second) => second.clickCount - first.clickCount)
    .slice(0, 3);
  const initial = displayName.slice(0, 1).toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f8f8",
          color: "#111827",
          padding: 58,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#2448e8",
                color: "white",
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              M
            </div>
            <div style={{ display: "flex", fontSize: 34, fontWeight: 900 }}>
              MyLink
            </div>
          </div>
          <div
            style={{
              display: "flex",
              color: "#1557ff",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            /{profileRouteKey}
          </div>
        </div>

        <div style={{ display: "flex", gap: 42, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                width: 178,
                height: 178,
                borderRadius: 89,
                border: "7px solid white",
                boxShadow: "0 22px 46px rgba(15, 23, 42, 0.18)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ff914d",
                color: "white",
                fontSize: 82,
                fontWeight: 900,
              }}
            >
              {photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoURL}
                  alt=""
                  width={178}
                  height={178}
                  style={{ width: 178, height: 178, objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  background: "white",
                  border: "2px solid #dcdfe4",
                  padding: "13px 18px",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                {linkCount} links
              </div>
              <div
                style={{
                  display: "flex",
                  background: "white",
                  border: "2px solid #dcdfe4",
                  color: "#2448e8",
                  padding: "13px 18px",
                  fontSize: 22,
                  fontWeight: 900,
                }}
              >
                {totalClickCount.toLocaleString("ko-KR")} clicks
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 900, lineHeight: 1.03 }}>
              {displayName}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 34,
                fontWeight: 800,
                color: "#6b7280",
              }}
            >
              @{profileRouteKey}
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 720,
                marginTop: 24,
                fontSize: 30,
                fontWeight: 700,
                lineHeight: 1.35,
                color: "#374151",
              }}
            >
              {bio}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {(topLinks.length > 0
            ? topLinks
            : [
                { title: "GitHub", clickCount: 0 },
                { title: "Blog", clickCount: 0 },
                { title: "Portfolio", clickCount: 0 },
              ]
          ).map((link) => (
            <div
              key={link.title}
              style={{
                flex: 1,
                minWidth: 0,
                height: 76,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "white",
                border: "2px solid #dcdfe4",
                padding: "0 22px",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              <span>{link.title}</span>
              <span style={{ color: "#1557ff", fontSize: 20 }}>
                {link.clickCount.toLocaleString("ko-KR")}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
