import type Stripe from "stripe";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ExternalLink } from "~/components/ui/external-link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { cn } from "~/lib/utils";
import { formatCurrency } from "~/utils";

export function ChargesTable(charges: Stripe.Response<Stripe.ApiList<Stripe.Charge>>) {
  return (
    <div>
      <h2 className="mb-2">Charges</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Created</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {charges.data.map((c) => {
            return (
              <TableRow key={c.id}>
                <TableCell>{new Date(c.created * 1000).toLocaleString()}</TableCell>
                <TableCell>{formatCurrency(c.amount / 100, { currency: c.currency })}</TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "failed" ? "destructive" : "default"} className={cn(c.status === "succeeded" && "bg-transparent border-success text-success", "capitalize")}>
                    {c.status}
                  </Badge>
                </TableCell>
                {c.receipt_url && (
                  <TableCell>
                    <Button variant="link" asChild>
                      <ExternalLink to={c.receipt_url}>Receipt</ExternalLink>
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
