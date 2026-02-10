import { useState, useEffect } from "react";
import questions from "./questions";
import Confetti from "react-confetti";
import confetti from "canvas-confetti";

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const App = () => {
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);

  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [timer, setTimer] = useState(5);
  const [shuffledOptions, setShuffledOptions] = useState([]);
 


  const launchFirework = () => {
    const duration = 800;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const frame = () => {
      confetti({
        particleCount: 50,
        startVelocity: 40,
        spread: 60,
        origin: {
          x: Math.random(),
          y: randomInRange(0.1, 0.3),
        },
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  useEffect(() => {
    const randomizedQuestions = shuffleArray(questions);
    setShuffledQuestions(randomizedQuestions);
  }, []);

  useEffect(() => {
    if (shuffledQuestions.length === 0) return;

    const currentQ = shuffledQuestions[currentQuestion];

    const answerObjects = currentQ.options.map((option, index) => ({
      text: option,
      isCorrect: index === currentQ.correctAnswer,
    }));

    setShuffledOptions(shuffleArray(answerObjects));
  }, [shuffledQuestions, currentQuestion]);

  // COUNTDOWN EFFECT 
  useEffect(() => { if (!showCountdown) return; 
  const interval = setInterval(() => {
 setCountdown((c) => { 
  if (c <= 1) {
 clearInterval(interval); 
 setShowCountdown(false);
  setQuizStarted(true);
   return 0; } 
   return c - 1; 
  }); 
  }, 1000);
  return () => clearInterval(interval); 
  }, [showCountdown]);

  // TIMER EFFECT
  useEffect(() => {
    if (!quizStarted || isFinished) return;

    setTimer(5);

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);

          if (!isAnswered) {
            setIsAnswered(true);
            setSelectedAnswer(null);
          }

          setTimeout(() => {
            handleNextClick();
          }, 800);

          return 0;
        }

        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, quizStarted, isFinished]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (shuffledQuestions.length === 0) {
    return <p>Loading quiz…</p>;
  }

  const currentQ = shuffledQuestions[currentQuestion];

  const handleAnswerClick = (index) => {
    if (isAnswered || isFinished) return;

    setSelectedAnswer(index);
    setIsAnswered(true);

    if (shuffledOptions[index].isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleNextClick = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);

      if (score === shuffledQuestions.length) {
        setShowCelebration(true);

        launchFirework();
        setTimeout(launchFirework, 400);
        setTimeout(launchFirework, 800);
      }
    }
  };

  const handleReset = () => {
    const randomizedQuestions = shuffleArray(questions);
    setShuffledQuestions(randomizedQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setShowCelebration(false);
    setTimer(5);
    setQuizStarted(false);
    setShowCountdown(false); 
    setCountdown(3);
  };

  return (
    <>
      <div className="card-container">
        <div className="header">
          <h1>The Ultimate Geography Quiz!</h1>

         {quizStarted && !isFinished && !showCountdown && (
            <>
              <p>
                {currentQuestion + 1}: {currentQ.question}
              </p>
              <p className={`timer ${timer <= 2 ? "warning" : ""}`}>
                ⏱️ Time left: {timer}s
              </p>
            </>
          )}

          {isFinished && (
            <div
              className={`results-message ${
                score === shuffledQuestions.length ? "perfect-score" : ""
              }`}
            >
              {score === shuffledQuestions.length && (
                <div className="smashed-it">
                  <h2>A Perfect Score!</h2>
                  <h3>You Are The Quiz Master</h3>
                </div>
              )}

              {score !== shuffledQuestions.length && (
                <h2 className="nice-try">
                  Nice try, but you didn’t get a perfect score — So Don’t Give Up!
                </h2>
              )}

              <p>
                Quiz Finished! Your Score: {score}/{shuffledQuestions.length}
              </p>
            </div>
          )}
        </div>
 {/* COUNTDOWN SCREEN */}
        {showCountdown && (
          <div className="countdown-screen">
            <h2>Get Ready…</h2>
            <h1>{countdown}</h1>
          </div>
        )}       

        {showCelebration && (
          <Confetti width={windowSize.width} height={windowSize.height} />
        )}

        {quizStarted && !isFinished && (
          <ul className="questions">
            {shuffledOptions.map((optionObj, index) => {
              let className = "";

              if (isAnswered) {
                if (optionObj.isCorrect) {
                  className = "correct";
                } else if (index === selectedAnswer) {
                  className = "incorrect";
                }
              }

              return (
                <li
                  key={index}
                  className={className}
                  onClick={() => handleAnswerClick(index)}
                >
                  {optionObj.text}
                </li>
              );
            })}
          </ul>
        )}

        {/* BUTTONS AT THE BOTTOM */}
        {!quizStarted  && !showCountdown ? (
          <button 
          onClick={() => { setShowCountdown(true);
          setCountdown(3);
          }}
          >
          Start Quiz
          </button>
        ) : !isFinished && !showCountdown ? (
          currentQuestion === 0 ? (
            <button onClick={handleNextClick}>Next Question</button>
          ) : currentQuestion === shuffledQuestions.length - 1 ? (
            <button onClick={handleNextClick}>Finish Quiz</button>
          ) : (
            <button onClick={handleNextClick}>Next Question</button>
          )
        ) : (
          isFinished && <button onClick={handleReset}>Reset Quiz</button>
        )}
      </div>
    </>
  );
};

export default App;
