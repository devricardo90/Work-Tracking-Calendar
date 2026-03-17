import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f1e8_0%,#f3efe7_28%,#ece6db_62%,#e4ddd1_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="grid gap-6 rounded-4xl border border-stone-300/70 bg-white/80 p-8 shadow-[0_30px_120px_-40px_rgba(60,40,20,0.35)] backdrop-blur md:grid-cols-[1.5fr_1fr] md:p-12">
          <div className="flex flex-col gap-6">
            <Badge className="w-fit rounded-full bg-stone-900 px-4 py-1 text-xs uppercase tracking-[0.24em] text-stone-50 hover:bg-stone-900">
              Worker Hours Tracker
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
                Calendario, lancamentos diários e API documentada em um fluxo só.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700 md:text-lg">
                A base do projeto já tem Fastify, Prisma, PostgreSQL e documentação em Scalar.
                O atalho abaixo abre a referência da API local.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-stone-900 px-6 text-stone-50 hover:bg-stone-800"
              >
                <a href="http://localhost:3333/docs/api" target="_blank" rel="noreferrer">
                  Abrir docs da API
                </a>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-stone-300 bg-white/70 px-6 text-stone-900 hover:bg-stone-100"
              >
                <Link href="#status">Ver status atual</Link>
              </Button>
            </div>
          </div>

          <Card className="rounded-3xl border-stone-300/80 bg-stone-950 text-stone-50 shadow-none">
            <CardHeader>
              <CardTitle className="text-xl">Endpoint de documentação</CardTitle>
              <CardDescription className="text-stone-300">
                Link local usado durante o desenvolvimento.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 font-mono text-stone-100">
                http://localhost:3333/docs/api
              </div>
              <Separator className="bg-stone-800" />
              <p className="leading-7 text-stone-300">
                O OpenAPI JSON também está exposto em
                {" "}
                <span className="font-mono text-stone-100">/docs/api/openapi.json</span>.
              </p>
            </CardContent>
          </Card>
        </section>

        <section id="status" className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-stone-300/80 bg-white/85">
            <CardHeader>
              <CardTitle>Backend</CardTitle>
              <CardDescription>Fastify + Prisma + Scalar</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-stone-700">
              Healthcheck, CRUD inicial de `WorkEntry` e docs em `/docs/api`.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-stone-300/80 bg-white/85">
            <CardHeader>
              <CardTitle>Frontend</CardTitle>
              <CardDescription>Next.js + shadcn/ui</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-stone-700">
              Base visual pronta com componentes para calendario, formularios e navegação.
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-stone-300/80 bg-white/85">
            <CardHeader>
              <CardTitle>Proximo passo</CardTitle>
              <CardDescription>Core Domain na interface</CardDescription>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-stone-700">
              Substituir esta home pelo calendario mensal e conectar os lançamentos à API.
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
