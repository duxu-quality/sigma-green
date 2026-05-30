import { generateOptionLabels } from '../utils/questionProcessing';

export default function QuizCard({
  question,
  isMulti,
  onAnswer,
  onSelectOption,
  onConfirm,
  onSkip,
  onNext,
  showResult,
  selectedAnswer,
  isCorrect,
  hasVisualRef,
  isStrongVisualRef,
}) {
  const optionLabels = generateOptionLabels(question.options.length);

  // --- 视觉引用警告条 ---
  const renderVisualWarning = () => {
    if (!hasVisualRef) return null;
    return (
      <div className="flex items-center gap-2 mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400 shrink-0">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-xs text-amber-400 flex-1">
          {isStrongVisualRef ? '图表缺失，此题可能无法作答' : '此题引用图表，原始图表已丢失'}
        </span>
        {onSkip && !showResult && (
          <button
            onClick={onSkip}
            className="text-xs text-amber-400 underline shrink-0 active:opacity-60"
          >
            跳过
          </button>
        )}
      </div>
    );
  };

  // --- 单选项渲染（不变） ---
  const renderSingleOption = (option, index) => {
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
  };

  // --- 多选项渲染 ---
  const renderMultiOption = (option, index) => {
    const isSelected = selectedAnswer instanceof Set && selectedAnswer.has(index);
    const isCorrectOption = Array.isArray(question.answer) && question.answer.includes(index);
    const isWrongSelection = isSelected && showResult && !isCorrectOption;
    const isMissedCorrect = !isSelected && showResult && isCorrectOption;

    let btnStyle;
    let iconStyle;

    if (!showResult) {
      // 选择阶段
      if (isSelected) {
        btnStyle = 'bg-sigma-accent/10 border-sigma-accent text-sigma-text';
        iconStyle = 'bg-sigma-accent text-sigma-dark';
      } else {
        btnStyle = 'bg-sigma-dark border-sigma-border text-sigma-text';
        iconStyle = 'bg-sigma-border text-sigma-subtle';
      }
    } else {
      // 结果阶段：四态着色
      if (isCorrectOption && isSelected) {
        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-400';
        iconStyle = 'bg-emerald-500 text-white';
      } else if (isCorrectOption && !isSelected) {
        btnStyle = 'bg-emerald-500/10 border-emerald-500/50 border-dashed text-sigma-subtle';
        iconStyle = 'bg-emerald-500/30 text-emerald-400';
      } else if (!isCorrectOption && isSelected) {
        btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
        iconStyle = 'bg-red-500 text-white';
      } else {
        btnStyle = 'bg-sigma-dark border-sigma-border text-sigma-subtle opacity-60';
        iconStyle = 'bg-sigma-border text-sigma-subtle';
      }
    }

    return (
      <button
        key={index}
        onClick={() => !showResult && onSelectOption && onSelectOption(index)}
        disabled={showResult}
        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-colors ${btnStyle} ${
          !showResult ? 'active:bg-sigma-border' : ''
        }`}
      >
        {/* Checkbox icon */}
        <span className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0 ${iconStyle}`}>
          {!showResult && isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {!showResult && !isSelected && optionLabels[index]}
          {showResult && isCorrectOption && isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {showResult && isCorrectOption && !isSelected && optionLabels[index]}
          {showResult && !isCorrectOption && isSelected && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
          {showResult && !isCorrectOption && !isSelected && optionLabels[index]}
        </span>
        <span className="text-sm leading-snug flex-1">{option}</span>
        {/* 漏选标记 */}
        {isMissedCorrect && (
          <span className="text-xs text-emerald-400 shrink-0">漏选</span>
        )}
      </button>
    );
  };

  // --- 正确答案文本 ---
  const renderCorrectAnswer = () => {
    if (isMulti) {
      return `正确答案：${question.answer.map(i => optionLabels[i]).join('、')}`;
    }
    return `正确答案：${optionLabels[question.answer]}`;
  };

  return (
    <div className="bg-sigma-card border border-sigma-border rounded-2xl p-5">
      {/* 头部标签行 */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-xs px-2 py-0.5 rounded-full bg-sigma-accent/20 text-sigma-accent">
          {question.category}
        </span>
        {isMulti && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
            多选题
          </span>
        )}
        {question.source && (
          <span className="text-xs text-sigma-subtle ml-auto truncate max-w-[180px]">
            {question.source}
          </span>
        )}
      </div>

      {/* 图表缺失警告 */}
      {renderVisualWarning()}

      {/* 题干 */}
      <h2 className="text-lg font-semibold text-sigma-text mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* 选项区 */}
      <div className="space-y-2.5">
        {question.options.map((option, index) =>
          isMulti ? renderMultiOption(option, index) : renderSingleOption(option, index)
        )}
      </div>

      {/* 多选确认按钮（选择阶段） */}
      {isMulti && !showResult && (
        <button
          onClick={onConfirm}
          disabled={!selectedAnswer || selectedAnswer.size === 0}
          className="mt-4 w-full py-3 bg-sigma-accent text-sigma-dark font-semibold rounded-xl active:opacity-80 transition-opacity disabled:opacity-40 disabled:pointer-events-none"
        >
          确认
        </button>
      )}

      {/* 结果区 */}
      {showResult && (
        <div className="mt-5 pt-4 border-t border-sigma-border">
          <div className={`text-sm font-medium mb-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? '✅ 正确！' : '❌ 答错了'}
            <span className="text-sigma-subtle ml-2 text-xs">
              {renderCorrectAnswer()}
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
