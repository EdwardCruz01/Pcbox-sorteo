import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// Exercise the real Edge Function handler without production registrations or payments.
async function apiHarness() {
  const saved = [];
  const filters = [];
  const folders = [];
  let dniCalls = 0;
  let handle;
  const storage = {
    createSignedUploadUrl: async (path) => ({ data: { path, token: "test-token" } }),
    list: async (folder, { search }) => {
      folders.push(folder);
      return { data: [{ name: search, metadata: { size: 100, mimetype: "image/png" } }] };
    },
    remove: async () => ({ error: null }),
  };
  const admin = {
    storage: { from: () => storage },
    from(table) {
      let record;
      const eq = [];
      const builder = {
        select() {
          return builder;
        },
        insert(value) {
          record = value;
          return builder;
        },
        eq(key, value) {
          eq.push([key, value]);
          return builder;
        },
        in() {
          return builder;
        },
        async maybeSingle() {
          return { data: { id: "raffle", ticket_price: 5, status: "activo" } };
        },
        async single() {
          saved.push(record);
          return {
            data: {
              id: "registration",
              status: record.status,
              amount: record.amount,
              quantity: record.quantity,
            },
          };
        },
        async order() {
          filters.push(...eq);
          if (table === "tickets")
            return { data: [{ registration_id: "registration", number: 100 }] };
          return {
            data: [{ id: "registration", full_name: "Prueba", raffles: { title: "Evento" } }],
          };
        },
      };
      return builder;
    },
  };
  const context = vm.createContext({
    Response,
    Request,
    Headers,
    URL,
    crypto,
    console,
    Deno: {
      env: { get: () => "test" },
      serve: (fn) => {
        handle = fn;
      },
    },
    fetch: async () => {
      dniCalls++;
      return Response.json({ success: true, data: { nombre_completo: "ANA PEREZ LOPEZ" } });
    },
  });
  const supabase = new vm.SyntheticModule(
    ["createClient"],
    function () {
      this.setExport("createClient", () => admin);
    },
    { context },
  );
  const compile = (file) =>
    new vm.SourceTextModule(
      ts.transpileModule(readFileSync(new URL(file, import.meta.url), "utf8"), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      }).outputText,
      { context },
    );
  const identity = compile("../supabase/functions/_shared/registration-identity.ts");
  await identity.link(() => {});
  const source = compile("../supabase/functions/public-api/index.ts");
  await source.link((specifier) => (specifier.startsWith("https:") ? supabase : identity));
  await source.evaluate();
  return {
    saved,
    filters,
    folders,
    identity: identity.namespace,
    get dniCalls() {
      return dniCalls;
    },
    async request(action, body) {
      const response = await handle(
        new Request("https://test.invalid/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ...body }),
        }),
      );
      return { status: response.status, body: await response.json() };
    },
  };
}

const ce = {
  raffleId: "raffle",
  documentType: "CE",
  dni: "001234567",
  firstNames: " Ana María ",
  paternalSurname: "De la Cruz",
  maternalSurname: "",
  fullName: "Ignored client name",
  birthDate: "",
  phone: "912345678",
  email: "",
  adultConfirmed: true,
  termsAccepted: true,
  quantity: 2,
  receiptPath: "CE-001234567/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png",
};
const dni = {
  ...ce,
  documentType: undefined,
  dni: "01234567",
  fullName: "Ana Pérez López",
  receiptPath: "01234567/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png",
};

test("existing DNI clients retain lookup, authoritative name and legacy receipt paths", async () => {
  const api = await apiHarness();
  const result = await api.request("crear-inscripcion", dni);
  assert.equal(result.status, 200);
  assert.equal(api.dniCalls, 1);
  assert.equal(api.saved[0].document_type, "DNI");
  assert.equal(api.saved[0].dni, "01234567");
  assert.equal(api.saved[0].full_name, "ANA PEREZ LOPEZ");
  assert.equal(api.saved[0].first_names, null);
  assert.equal(api.folders[0], "01234567");
});

test("a tampered DNI name is still rejected", async () => {
  const api = await apiHarness();
  assert.equal(
    (await api.request("crear-inscripcion", { ...dni, fullName: "OTRA PERSONA" })).status,
    400,
  );
  assert.equal(api.dniCalls, 1);
  assert.equal(api.saved.length, 0);
});

test("CE saves separate names, leading zeros, phone and quantity without a DNI lookup", async () => {
  const api = await apiHarness();
  assert.equal((await api.request("crear-inscripcion", ce)).status, 200);
  assert.equal(api.dniCalls, 0);
  assert.equal(api.saved[0].document_type, "CE");
  assert.equal(api.saved[0].dni, "001234567");
  assert.equal(api.saved[0].full_name, "Ana María De la Cruz");
  assert.equal(api.saved[0].first_names, "Ana María");
  assert.equal(api.saved[0].paternal_surname, "De la Cruz");
  assert.equal(api.saved[0].maternal_surname, null);
  assert.equal(api.saved[0].phone, "912345678");
  assert.equal(api.saved[0].amount, 10);
  assert.equal(api.saved[0].status, "pendiente");
  assert.equal(api.folders[0], "CE-001234567");
});

test("CE keeps the optional maternal surname when supplied", async () => {
  const api = await apiHarness();
  assert.equal(
    (await api.request("crear-inscripcion", { ...ce, maternalSurname: "Muñoz" })).status,
    200,
  );
  assert.equal(api.saved[0].full_name, "Ana María De la Cruz Muñoz");
  assert.equal(api.saved[0].maternal_surname, "Muñoz");
});

for (const [label, change] of Object.entries({
  "invalid document type": { documentType: "PASSPORT" },
  "short CE": { dni: "123" },
  "oversized CE": { dni: "1234567890123" },
  "non-numeric CE": { dni: "0012X4567" },
  "empty given names": { firstNames: " " },
  "missing paternal surname": { paternalSurname: "" },
  "HTML in names": { firstNames: "<script>" },
  "overlong name": { firstNames: "a".repeat(81) },
  "missing consent": { termsAccepted: false },
  "missing age confirmation": { adultConfirmed: false },
  "invalid WhatsApp": { phone: "123456789" },
  "foreign receipt owner": { receiptPath: "CE-009999999/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png" },
  "DNI receipt reused for CE": {
    receiptPath: "001234567/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png",
  },
  "quantity outside limits": { quantity: 51 },
})) {
  test(`rejects ${label} before inserting`, async () => {
    const api = await apiHarness();
    assert.equal((await api.request("crear-inscripcion", { ...ce, ...change })).status, 400);
    assert.equal(api.saved.length, 0);
  });
}

test("receipt uploads distinguish DNI and CE with the same numeric value", async () => {
  const api = await apiHarness();
  const upload = { dni: "00123456", extension: "png", contentType: "image/png" };
  assert.match((await api.request("crear-upload", upload)).body.path, /^00123456\//);
  assert.match(
    (await api.request("crear-upload", { ...upload, documentType: "CE" })).body.path,
    /^CE-00123456\//,
  );
});

for (const type of [undefined, "DNI", "CE"]) {
  test(`ticket lookup isolates document type ${type ?? "legacy DNI"}`, async () => {
    const api = await apiHarness();
    const result = await api.request("consultar-inscripciones", {
      dni: "00123456",
      documentType: type,
    });
    assert.equal(result.status, 200);
    assert.deepEqual(api.filters, [
      ["dni", "00123456"],
      ["document_type", type ?? "DNI"],
    ]);
    assert.deepEqual(result.body.inscripciones[0].tickets, [100]);
  });
}
