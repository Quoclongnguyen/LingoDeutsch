import type {
  ExerciseAnswer,
  InternalExercise,
} from "@lingo-deutsch/shared";

export class InvalidExerciseAnswersError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidExerciseAnswersError";
  }
}

function normalizeFillAnswer(answer: string, caseSensitive: boolean) {
  const normalized = answer.trim().replace(/\s+/gu, " ").normalize("NFC");
  return caseSensitive ? normalized : normalized.toLocaleLowerCase("de-DE");
}

function isCorrect(exercise: InternalExercise, answer: ExerciseAnswer) {
  if (exercise.type === "multiple_choice") {
    if (answer.type !== "multiple_choice") {
      throw new InvalidExerciseAnswersError(
        `Answer type does not match exercise ${exercise.id}.`,
      );
    }
    return answer.answer === exercise.correctOptionId;
  }
  if (exercise.type === "fill_blank") {
    if (answer.type !== "fill_blank") {
      throw new InvalidExerciseAnswersError(
        `Answer type does not match exercise ${exercise.id}.`,
      );
    }
    const submitted = normalizeFillAnswer(answer.answer, exercise.caseSensitive);
    return exercise.acceptedAnswers.some(
      (accepted) =>
        normalizeFillAnswer(accepted, exercise.caseSensitive) === submitted,
    );
  }
  if (answer.type !== "word_ordering") {
    throw new InvalidExerciseAnswersError(
      `Answer type does not match exercise ${exercise.id}.`,
    );
  }
  return (
    answer.answer.length === exercise.correctOrder.length &&
    answer.answer.every((tokenId, index) => tokenId === exercise.correctOrder[index])
  );
}

export function gradeExercises(
  exercises: InternalExercise[],
  answers: ExerciseAnswer[],
) {
  const answersByExercise = new Map<string, ExerciseAnswer>();
  for (const answer of answers) {
    if (answersByExercise.has(answer.exerciseId)) {
      throw new InvalidExerciseAnswersError(
        "Submit exactly one answer for each exercise.",
      );
    }
    answersByExercise.set(answer.exerciseId, answer);
  }
  if (
    answersByExercise.size !== exercises.length ||
    answers.some(
      (answer) => !exercises.some((exercise) => exercise.id === answer.exerciseId),
    )
  ) {
    throw new InvalidExerciseAnswersError(
      "Submit exactly one answer for each exercise.",
    );
  }

  const results = exercises.map((exercise) => {
    const answer = answersByExercise.get(exercise.id);
    if (!answer) {
      throw new InvalidExerciseAnswersError(
        "Submit exactly one answer for each exercise.",
      );
    }
    const correct = isCorrect(exercise, answer);
    return {
      correct,
      exerciseId: exercise.id,
      feedbackVi: correct
        ? exercise.feedbackCorrectVi
        : exercise.feedbackIncorrectVi,
      type: exercise.type,
    };
  });
  const incorrectExerciseIds = results
    .filter((result) => !result.correct)
    .map((result) => result.exerciseId);

  return {
    incorrectExerciseIds,
    results,
    score: results.length - incorrectExerciseIds.length,
    total: results.length,
  };
}
