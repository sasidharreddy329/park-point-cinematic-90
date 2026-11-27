import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationSql = readFileSync(
  resolve(process.cwd(), "drizzle/migrations/0000_secure_review_visibility_and_parking_images.sql"),
  "utf8",
);

const policySql = (name: string) => {
  const start = migrationSql.indexOf(`CREATE POLICY "${name}"`);
  if (start < 0) return "";
  const end = migrationSql.indexOf(";", start);
  return end < 0 ? "" : migrationSql.slice(start, end + 1);
};

describe("selected database security policies", () => {
  it("limits public reviews to active parking locations", () => {
    const policy = policySql("Anyone can view reviews for active locations");

    expect(policy).toContain("TO public");
    expect(policy).toContain("location.id = reviews.location_id");
    expect(policy).toContain("location.is_active = true");
    expect(policy).not.toMatch(/USING\s*\(\s*true\s*\)/i);
  });

  it("limits image uploads to the signed-in uploader", () => {
    const policy = policySql("Authenticated users can upload parking images");

    expect(policy).toContain("FOR INSERT");
    expect(policy).toContain("TO authenticated");
    expect(policy).toContain("bucket_id = 'parking-images'");
    expect(policy).toContain("owner_id = (SELECT auth.uid()::text)");
  });

  it("limits image updates to the signed-in owner before and after changes", () => {
    const policy = policySql("Users can update own parking images");
    const ownerChecks = policy.match(/owner_id = \(SELECT auth\.uid\(\)::text\)/g) ?? [];

    expect(policy).toContain("FOR UPDATE");
    expect(ownerChecks).toHaveLength(2);
  });

  it("limits image deletion to the signed-in owner", () => {
    const policy = policySql("Users can delete own parking images");

    expect(policy).toContain("FOR DELETE");
    expect(policy).toContain("owner_id = (SELECT auth.uid()::text)");
  });
});