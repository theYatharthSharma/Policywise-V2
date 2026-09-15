import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Shield className="h-5 w-5" /></div>
            <div className="font-bold">PolicyWise</div>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Securing families for generations. Explore, calculate and apply for policies with confidence.
          </p>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Product</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/policies" className="hover:text-foreground">Policies</Link></li>
            <li><Link to="/calculator" className="hover:text-foreground">Calculator</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Company</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Privacy</a></li>
            <li><a href="#" className="hover:text-foreground">Terms</a></li>
            <li><a href="#" className="hover:text-foreground">Support</a></li>
          </ul>
        </div>
        <div>
          <div className="mb-3 text-sm font-semibold">Follow</div>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Twitter</a>
            <a href="#" className="hover:text-foreground">LinkedIn</a>
            <a href="#" className="hover:text-foreground">YouTube</a>
          </div>
        </div>
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} PolicyWise · Demo interface. Not affiliated with Life Insurance Corporation of India.
      </div>
    </footer>
  );
}
