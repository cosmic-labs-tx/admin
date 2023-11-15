import { cn } from "~/lib/utils";

type Props = {
  list: Record<string, unknown>;
  children?: React.ReactNode;
};
export function DetailsList(props: Props) {
  return (
    <dl className="divide-y divide-muted">
      {Object.entries(props.list).map(([label, value]) => {
        if (!value) return null;
        return <DetailItem key={label} label={label} value={value} />;
      })}
      {props.children}
    </dl>
  );
}

export function DetailItem({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="py-2.5 text-sm sm:grid sm:grid-cols-4 sm:gap-4 sm:px-0">
      <dt className="font-medium capitalize">{label}</dt>
      <dd className={cn("mt-1 text-muted-foreground sm:col-span-3 sm:mt-0")}>{String(value)}</dd>
    </div>
  );
}
