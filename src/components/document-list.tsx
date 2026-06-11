import { FileText } from "lucide-react";

type DocumentListProps = {
  documents: readonly {
    name: string;
    status: string;
  }[];
};

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="space-y-3">
      {documents.map((document) => (
        <div
          key={document.name}
          className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-gold">
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">{document.name}</span>
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] ${
              document.status === "Nouveau"
                ? "bg-gold text-gold-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {document.status}
          </span>
        </div>
      ))}
    </div>
  );
}
