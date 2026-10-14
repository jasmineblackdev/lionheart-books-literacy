// Responsive image helper. Every photo in src/assets has a smaller "-sm" copy next to it
// (480px wide; 600px for the wide Field Guide strip), so browsers on phones and in small
// cards download the small one. Usage: <img {...responsive(book.cover, "240px")} alt=... />
const files = import.meta.glob<string>("../assets/*.jpg", { eager: true, query: "?url", import: "default" });

type Variant = { sm: string; smW: number; w: number };
const variants = new Map<string, Variant>();
for (const [path, url] of Object.entries(files)) {
  if (path.endsWith("-sm.jpg")) continue;
  const sm = files[path.replace(/\.jpg$/, "-sm.jpg")];
  if (!sm) continue;
  const name = path.split("/").pop()!;
  const wide = name === "field-guide-pages.jpg";
  variants.set(url, { sm, smW: wide ? 600 : 480, w: name.endsWith("-cover.jpg") ? 800 : wide ? 1000 : 935 });
}

/** src, srcSet and sizes for an asset URL; falls back to the plain src if it has no small copy. */
export function responsive(src: string, sizes: string) {
  const v = variants.get(src);
  return v ? { src: v.sm, srcSet: `${v.sm} ${v.smW}w, ${src} ${v.w}w`, sizes } : { src };
}
