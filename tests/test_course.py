"""Verify every advanced example, solution and behavioral exercise check."""
import contextlib
import io
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read_js_data(filename, variable, suffix):
    text = (ROOT / filename).read_text()
    return json.loads(text.split(f"const {variable} = ", 1)[1].split(suffix, 1)[0])


LESSONS = read_js_data("advanced-lessons.js", "ADVANCED_LESSONS", ";\nLESSONS.push")
QUESTIONS = read_js_data("interviews.js", "INTERVIEW_QUESTIONS", ";\n")


class CourseTests(unittest.TestCase):
    def test_lesson_ids_continue_foundations(self):
        self.assertEqual([lesson["id"] for lesson in LESSONS], list(range(34, 50)))
        self.assertEqual({lesson["track"] for lesson in LESSONS}, {"Intermediate", "Advanced"})

    def test_examples_and_solutions(self):
        for lesson in LESSONS:
            exercise = lesson["content"]["exercise"]
            for name, code in [("example", lesson["content"]["pythonExample"]),
                               ("solution", exercise["solution"])]:
                with self.subTest(lesson=lesson["title"], kind=name):
                    output = io.StringIO()
                    namespace = {}
                    with contextlib.redirect_stdout(output):
                        exec(code, namespace)
                        exec(exercise["validationCode"], namespace)
                    self.assertEqual(output.getvalue().strip(), exercise["expectedOutput"].strip())

    def test_print_only_answers_fail_behavior_checks(self):
        for lesson in LESSONS:
            exercise = lesson["content"]["exercise"]
            with self.subTest(lesson=lesson["title"]):
                namespace = {}
                with contextlib.redirect_stdout(io.StringIO()):
                    exec(f"print({exercise['expectedOutput']!r})", namespace)
                    with self.assertRaises((NameError, AssertionError)):
                        exec(exercise["validationCode"], namespace)

    def test_all_lessons_have_practical_labs_and_sources(self):
        for lesson in LESSONS:
            with self.subTest(lesson=lesson["title"]):
                content = lesson["content"]
                self.assertTrue(content["lab"])
                self.assertTrue(content["pitfall"])
                self.assertTrue(content["sources"])
                compile(content["exercise"]["starterCode"], "starter", "exec")
                for source in content["sources"]:
                    self.assertTrue(source["url"].startswith("https://"))

    def test_interview_bank_is_complete(self):
        self.assertEqual(len(QUESTIONS), 32)
        self.assertEqual(len({question["id"] for question in QUESTIONS}), len(QUESTIONS))
        for question in QUESTIONS:
            for field in ["question", "answer", "followUp", "category", "level"]:
                self.assertTrue(question[field])


if __name__ == "__main__":
    unittest.main()
