import { useState } from 'react';

export default function QuizCard({ question, onAnswer, onNext, showResult, selectedAnswer, isCorrect }) {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-sigma-card border border-sigma-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs px-2 py-0.5 rounded-full bg-sigma-accent/20 text-sigma-accent">
          {question.category}
        </span>
      </div>

      <h2 className="text-lg font-semibold text-sigma-text mb-6 leading-relaxed">
        {question.question}
      </h2>

      <div className="space-y-2.5">
        {question.options.map((option, index) => {
          let btnStyle = 'bg-sigma-dark border-sigma-border text-sigma-text';
          if (showResult) {
            if (index === question.answer) {
              btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
            } else if (selectedAnswer === index && !isCorrect) {
              btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
            } else {
              btnStyle = 'bg-sigma-dark border-sigma-border text-sigma-subtle';
            }
          }

          return (
            <button
              key={index}
              onClick={() => !showResult && onAnswer(index)}
              disabled={showResult}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${btnStyle} ${
                !showResult ? 'active:bg-sigma-border' : ''
              }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                showResult && index === question.answer
                  ? 'bg-emerald-500 text-white'
                  : showResult && selectedAnswer === index && !isCorrect
                  ? 'bg-red-500 text-white'
                  : 'bg-sigma-border text-sigma-subtle'
              }`}>
                {optionLabels[index]}
              </span>
              <span className="text-sm leading-snug">{option}</span>
            </button>
          );
        })}
      </div>

      {showResult && (
        <div className="mt-5 pt-4 border-t border-sigma-border">
          <div className={`text-sm font-medium mb-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? '正确！' : '答错了'}
            <span className="text-sigma-subtle ml-2 text-xs">
              正确答案：{optionLabels[question.answer]}
              {Array.isArray(question.answer) ? question.answer.map(i => optionLabels[i]).join('') : ''}
            </span>
          </div>
          {question.explanation ? (
            <p className="text-sm text-sigma-subtle leading-relaxed">{question.explanation}</p>
          ) : (
            <p className="text-xs text-sigma-subtle">
              所属阶段：{question.category} · 来源：{question.source}
            </p>
          )}
          <button
            onClick={onNext}
            className="mt-4 w-full py-3 bg-sigma-accent text-sigma-dark font-semibold rounded-xl active:opacity-80 transition-opacity"
          >
            下一题
          </button>
        </div>
      )}
    </div>
  );
}
