export type DocumentType = "DNI" | "CE";

export function documentType(value: unknown): DocumentType {
  // Clients published before CE support do not send a document type.
  if (value === undefined || value === "DNI") return "DNI";
  if (value === "CE") return "CE";
  throw new Error("Selecciona DNI o carnet de extranjería.");
}

export function documentNumber(type: DocumentType, value: unknown): string {
  const number = typeof value === "string" ? value.trim() : "";
  const pattern = type === "DNI" ? /^\d{8}$/ : /^\d{8,12}$/;
  if (!pattern.test(number)) {
    throw new Error(
      type === "DNI"
        ? "El DNI debe tener 8 dígitos."
        : "Ingresa un carnet de extranjería de 8 a 12 dígitos.",
    );
  }
  return number;
}

function personName(value: unknown, label: string, optional = false): string {
  if (optional && (value === undefined || value === "")) return "";
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (optional && name === "") return "";
  if (!name || name.length > 80 || !/^[\p{L}\p{M}][\p{L}\p{M} .’'-]*$/u.test(name)) {
    throw new Error(`Ingresa ${label} válido (máximo 80 caracteres).`);
  }
  return name;
}

export function foreignResidentIdentity(data: Record<string, unknown>) {
  const firstNames = personName(data.firstNames, "un nombre");
  const paternalSurname = personName(data.paternalSurname, "un apellido paterno");
  const maternalSurname = personName(data.maternalSurname, "un apellido materno", true);
  return {
    firstNames,
    paternalSurname,
    maternalSurname,
    fullName: [firstNames, paternalSurname, maternalSurname].filter(Boolean).join(" "),
  };
}

export function receiptFolder(type: DocumentType, number: string): string {
  return type === "CE" ? `CE-${number}` : number;
}
