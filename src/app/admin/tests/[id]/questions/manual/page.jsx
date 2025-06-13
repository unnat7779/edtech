import ManualQuestionForm from "@/components/admin/ManualQuestionForm"

export default async function ManualQuestionEntryPage({ params }) {
  const resolvedParams = await params

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add Questions</h1>
          <p className="mt-2 text-gray-600">Manually add questions to the test</p>
        </div>

        <ManualQuestionForm testId={resolvedParams.id} />
      </div>
    </div>
  )
}
