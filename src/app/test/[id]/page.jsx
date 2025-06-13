import TestPortal from "@/components/test/TestPortal"

export default async function TestPage({ params }) {
  const resolvedParams = await params
  return <TestPortal testId={resolvedParams.id} />
}
