// Minimal .xlsx reader for the admin KDP report upload: unzips with the browser's
// DecompressionStream and reads each sheet's cells with DOMParser. Handles shared and
// inline strings, numbers and booleans; formulas yield their cached values.

export type Cell = string | number | boolean | null;
export type Sheet = { name: string; rows: Cell[][] };

async function unzip(buf: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const v = new DataView(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 65557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("Not an .xlsx file");
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const files = new Map<string, Uint8Array>();
  const dec = new TextDecoder();
  for (let n = 0; n < count; n++) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new Error("Damaged .xlsx file");
    const method = v.getUint16(p + 10, true);
    const size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = dec.decode(new Uint8Array(buf, p + 46, nameLen));
    p += 46 + nameLen + extraLen + commentLen;
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    const raw = new Uint8Array(buf, start, size);
    if (method === 0) files.set(name, raw);
    else if (method === 8) {
      const input = new ReadableStream<BufferSource>({
        start(c) {
          c.enqueue(raw.slice());
          c.close();
        },
      });
      const stream = input.pipeThrough(new DecompressionStream("deflate-raw"));
      files.set(name, new Uint8Array(await new Response(stream).arrayBuffer()));
    } else throw new Error("Unsupported .xlsx compression");
  }
  return files;
}

const els = (node: Document | Element, tag: string) => Array.from(node.getElementsByTagNameNS("*", tag));
const textOf = (el: Element) => els(el, "t").map((t) => t.textContent ?? "").join("");

function colIndex(ref: string) {
  let n = 0;
  for (const ch of ref.replace(/\d+$/, "")) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export async function readXlsx(buf: ArrayBuffer): Promise<Sheet[]> {
  const files = await unzip(buf);
  const dec = new TextDecoder();
  const xml = (path: string) => {
    const f = files.get(path);
    return f ? new DOMParser().parseFromString(dec.decode(f), "application/xml") : null;
  };
  const shared = (() => {
    const doc = xml("xl/sharedStrings.xml");
    return doc ? els(doc, "si").map(textOf) : [];
  })();
  const rels = new Map(
    els(xml("xl/_rels/workbook.xml.rels") ?? new Document(), "Relationship").map((r) => [r.getAttribute("Id"), r.getAttribute("Target") ?? ""]),
  );
  const workbook = xml("xl/workbook.xml");
  if (!workbook) throw new Error("Not an .xlsx file");

  return els(workbook, "sheet").map((s) => {
    const rid = s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") ?? s.getAttribute("r:id");
    const target = (rels.get(rid) ?? "").replace(/^\/?xl\//, "").replace(/^\//, "");
    const doc = xml(`xl/${target}`);
    const rows: Cell[][] = [];
    for (const row of doc ? els(doc, "row") : []) {
      const cells: Cell[] = [];
      for (const c of els(row, "c")) {
        const t = c.getAttribute("t");
        const v = els(c, "v")[0]?.textContent ?? null;
        let value: Cell = null;
        if (t === "inlineStr") value = textOf(c);
        else if (t === "s") value = v == null ? null : (shared[Number(v)] ?? null);
        else if (t === "str") value = v;
        else if (t === "b") value = v === "1";
        else if (v != null) value = Number(v);
        cells[colIndex(c.getAttribute("r") ?? "A")] = value;
      }
      rows.push(Array.from(cells, (x) => x ?? null));
    }
    return { name: s.getAttribute("name") ?? "", rows };
  });
}
