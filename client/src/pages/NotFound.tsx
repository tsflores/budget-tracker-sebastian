import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <img 
        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663183403549/aAaiETBequFcyb2jW9Meb6/empty-state-vault-h8BBWKHAuefASTG6VatWmy.webp"
        alt="Vault"
        className="w-32 h-32 object-contain opacity-60 mb-6"
      />
      <h1 className="font-display text-3xl text-foreground mb-2">Page Not Found</h1>
      <p className="text-sm text-muted-foreground mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="bg-gold text-navy-dark hover:bg-gold-light">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
