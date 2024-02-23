import React, {useEffect, useState} from 'react';
import BackgroundColorLoader, {TIMER_BACKGROUND_COLOR} from "./BackgroundColorLoader";
import {time} from "ionicons/icons";

const WORK_TIME = 2;
const SHORT_BREAK_TIME = 1;
const LONG_BREAK_TIME = 10;

enum TIMER_TYPE {
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
  WORK = 'WORK',
}

const Timer = () => {
  const [minutes, setMinutes] = useState(WORK_TIME);
  const [seconds, setSeconds] = useState(0);
  const [rounds, setRounds] = useState(3);
  const [timerType, setTimerType] = useState<TIMER_TYPE>(TIMER_TYPE.WORK);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval = setInterval(() => {
      clearInterval(interval);
      if (isRunning) {
        handleSeconds()
      }
    }, 1000);
  }, [seconds, isRunning]);


  const handleMinutes = () => {
    if (minutes !== 0) {
      setSeconds(59);
      setMinutes(minutes - 1);
    } else {
      handleRounds()
    }
  }

  const handleRounds = () => {
    let thisRounds = rounds
    if (thisRounds !== 0 && timerType === TIMER_TYPE.SHORT_BREAK) {
      setRounds(thisRounds - 1)
    }

    if (thisRounds !== 0 && timerType !== TIMER_TYPE.LONG_BREAK) {
      handleTimer(thisRounds);
    }
  }

  const handleTimer = (rounds: number) => {
    let thisTimerType = timerType;

    if (rounds > 1) {
      if (thisTimerType === TIMER_TYPE.WORK) {
        thisTimerType = TIMER_TYPE.SHORT_BREAK;
      } else if (thisTimerType === TIMER_TYPE.SHORT_BREAK) {
        thisTimerType = TIMER_TYPE.WORK;
      }
    } else {
      thisTimerType = TIMER_TYPE.LONG_BREAK;
    }

    setTimerType(thisTimerType);
    resetTimer(thisTimerType);
  }

  const handleSeconds = () => {
    if (seconds === 0) {
      handleMinutes();
    } else {
      setSeconds(seconds - 1);
    }
  }

  const resetTimer = (timerType: TIMER_TYPE) => {
    if (timerType === TIMER_TYPE.WORK) {
      setMinutes(WORK_TIME - 1);
    }

    if (timerType === TIMER_TYPE.SHORT_BREAK) {
      setMinutes(SHORT_BREAK_TIME - 1);
    }
    if (timerType === TIMER_TYPE.LONG_BREAK) {
      setMinutes(LONG_BREAK_TIME - 1);
    }
      setSeconds(59);
  }

  const reset = () => {
    setIsRunning(false);
    setMinutes(WORK_TIME);
    setSeconds(0);
    setRounds(3);
    setTimerType(TIMER_TYPE.WORK);
  }

  useEffect(() => {
    setProgress(getProgress)
  }, [seconds]);

  const getProgress = () => {
    let time = 0;
    switch (timerType) {
      case TIMER_TYPE.WORK: time = WORK_TIME; break;
      case TIMER_TYPE.SHORT_BREAK: time = SHORT_BREAK_TIME; break;
      case TIMER_TYPE.LONG_BREAK: time = LONG_BREAK_TIME; break;
      default: time = WORK_TIME;
    }

    let timeInSeconds = time * 60 // 100%
    return (100 / timeInSeconds) * (minutes * 60 + seconds)
  }

  const getTimerColor = () => {
    switch (timerType) {
      case TIMER_TYPE.WORK: return TIMER_BACKGROUND_COLOR.RED
      case TIMER_TYPE.SHORT_BREAK: return TIMER_BACKGROUND_COLOR.VIOLET
      case TIMER_TYPE.LONG_BREAK: return TIMER_BACKGROUND_COLOR.BLUE
    }
  }

  const timerMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timerSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return (
    <BackgroundColorLoader backgroundColor={getTimerColor()} progress={progress}>
      <div>Rounds left: {rounds}</div>
      {/*<div>Runden übrig: {rounds}</div>*/}
      <div>
        {timerMinutes}:{timerSeconds}
      </div>
      <div>{timerType && <div>Type: {timerType}</div>}</div>

      {isRunning ?
        <button onClick={() => setIsRunning(false)}>Pause</button>
        :
        <button onClick={() => setIsRunning(true)}>Play</button>
      }
      <button onClick={reset}>Reset</button>
    </BackgroundColorLoader>
  );
};

export default Timer;
