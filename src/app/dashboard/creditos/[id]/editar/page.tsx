import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { EditarClient } from "./editar-client"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarCreditoPage({ params }: PageProps) {
  const { id } = await params

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      client: true
    }
  })

  if (!loan) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <EditarClient loan={loan} />
    </div>
  )
}
