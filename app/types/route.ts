// app/types/route.ts
export type RouteParams<K extends string> = { params: Promise<Record<K, string>> };
export const dynamic = "force-dynamic";
