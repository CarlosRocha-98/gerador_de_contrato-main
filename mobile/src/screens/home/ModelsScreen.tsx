import React from "react";

import { Page } from "@/components/Page";
import { Card, EmptyState } from "@/components/ui";

export function ModelsScreen() {
  return (
    <Page title="Modelos" subtitle="Modelos de contrato prontos para usar.">
      <Card>
        <EmptyState
          title="Em breve"
          subtitle="Os modelos de contrato estarão disponíveis aqui."
        />
      </Card>
    </Page>
  );
}
