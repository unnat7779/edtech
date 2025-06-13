export const validateTestForm = (formData) => {
  const errors = {}

  if (!formData.title?.trim()) {
    errors.title = "Test title is required"
  }

  if (!formData.description?.trim()) {
    errors.description = "Test description is required"
  }

  if (!formData.subject) {
    errors.subject = "Subject is required"
  }

  if (!formData.class) {
    errors.class = "Class is required"
  }

  if (!formData.duration || formData.duration < 1) {
    errors.duration = "Duration must be at least 1 minute"
  }

  if (!formData.totalMarks || formData.totalMarks < 1) {
    errors.totalMarks = "Total marks must be at least 1"
  }

  if (formData.type === "chapter-wise" && !formData.chapter?.trim()) {
    errors.chapter = "Chapter is required for chapter-wise tests"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const validateQuestionForm = (questionData) => {
  const errors = {}

  if (!questionData.questionText?.trim()) {
    errors.questionText = "Question text is required"
  }

  if (!questionData.subject) {
    errors.subject = "Subject is required"
  }

  if (!questionData.difficulty) {
    errors.difficulty = "Difficulty level is required"
  }

  if (questionData.questionType === "mcq") {
    if (!questionData.options || questionData.options.length < 2) {
      errors.options = "At least 2 options are required"
    }

    const hasValidOptions = questionData.options?.some((option) => option.text?.trim())
    if (!hasValidOptions) {
      errors.options = "At least one option must have text"
    }

    if (questionData.correctAnswer === undefined || questionData.correctAnswer < 0) {
      errors.correctAnswer = "Please select a correct answer"
    }
  } else if (questionData.questionType === "numerical") {
    if (questionData.numericalAnswer === undefined || questionData.numericalAnswer === "") {
      errors.numericalAnswer = "Numerical answer is required"
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}
