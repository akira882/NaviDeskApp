"use client";

import type { Route } from "next";
import Link from "next/link";

import { useContent } from "@/components/content-provider";
import { useRole } from "@/components/role-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listVisibleArticles } from "@/lib/content-helpers";
import type { Category } from "@/types/domain";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const { role } = useRole();
  const content = useContent();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {categories.map((category) => {
        const count = listVisibleArticles(content, role).filter((article) => article.categoryId === category.id).length;

        return (
          <Link key={category.id} href={`/categories/${category.slug}` as Route}>
            <Card className="h-full hover:-translate-y-0.5">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">{category.name}</h2>
                  <Badge>{count}件</Badge>
                </div>
                <p className="text-sm leading-6 text-text-secondary">{category.description}</p>
                <p className="text-sm text-text-muted">主管部門: {category.ownerDepartment}</p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
