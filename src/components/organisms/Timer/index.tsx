import React, { useContext, useEffect, useState } from 'react';
import SettingsContext from '../../../context/Settings.context';
import { IonButton, IonIcon, IonToast } from '@ionic/react';
import { eyeOffSharp, eyeSharp } from 'ionicons/icons';
import CircleLoader from '../../atoms/CircleLoader';
import SettingsModal from '../SettingsModal';
import TaskName from '../../atoms/TaskName';
import BREAK_SOUND from '../../../../resources/finishing_bell.wav';
import WORK_SOUND from '../../../../resources/success.wav';
import styles from './Timer.module.scss';
import TimerControls from '../../molecules/TimerControls';

export enum TIMER_TYPE {
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
  WORK = 'WORK',
  FINISHED = 'FINISHED'
}

const Timer = () => {
  const breakSound = new Audio(BREAK_SOUND);
  const workSound = new Audio(WORK_SOUND);
  const [settingsModalIsOpen, setSettingsModalIsOpen] = useState<boolean>(false);
  const { workTime, shortBreakTime, longBreakTime, rounds, timerIsRunning, setTimerIsRunning } =
    useContext(SettingsContext);
  const [minutes, setMinutes] = useState<number>(workTime);
  const [seconds, setSeconds] = useState<number>(0);
  const [roundsLeft, setRoundsLeft] = useState<number>(rounds);
  const [timerType, setTimerType] = useState<TIMER_TYPE>(TIMER_TYPE.WORK);
  const [progress, setProgress] = useState<number>(0);
  const [showTime, setShowTime] = useState<boolean>(true);
  const [showToaster, setShowToaster] = useState<boolean>(false);

  // Consolidated useEffect for timer logic
  useEffect(() => {
    const handleTimerExpiration = () => {
      if (seconds === 1 && minutes === 0) {
        // Ring the bell after each round
        timerType === TIMER_TYPE.WORK ? workSound.play() : breakSound.play();
      }

      if (seconds === 0) {
        if (minutes === 0) {
          updateRoundsAndTimerType();
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      } else {
        setSeconds(seconds - 1);
      }
    };

    let interval: NodeJS.Timeout;
    if (timerIsRunning) {
      interval = setInterval(handleTimerExpiration, 1000);
    }

    return () => clearInterval(interval); // Clear interval on component unmount or when isRunning changes
  }, [timerIsRunning, seconds, minutes]);

  // UseEffect for reset when settings change, kept as is but can add logic here as needed.
  useEffect(() => {
    reset();
  }, [workTime, shortBreakTime, longBreakTime, rounds]);

  useEffect(() => {
    const totalTimeInSeconds =
      (timerType === TIMER_TYPE.WORK
        ? workTime
        : timerType === TIMER_TYPE.SHORT_BREAK
          ? shortBreakTime
          : longBreakTime) * 60;
    setProgress((100 / totalTimeInSeconds) * (minutes * 60 + seconds));
  }, [seconds, minutes, timerType, workTime, shortBreakTime, longBreakTime]);

  const updateRoundsAndTimerType = () => {
    let nextType = timerType;
    let nextRoundsLeft = roundsLeft;

    switch (timerType) {
      case TIMER_TYPE.WORK:
        nextType =
          roundsLeft > 1
            ? TIMER_TYPE.SHORT_BREAK
            : roundsLeft === 1
              ? TIMER_TYPE.LONG_BREAK
              : TIMER_TYPE.FINISHED;
        nextRoundsLeft = roundsLeft === 1 ? 0 : roundsLeft;
        break;
      case TIMER_TYPE.SHORT_BREAK:
        nextType = TIMER_TYPE.WORK;
        nextRoundsLeft -= 1;
        break;
      case TIMER_TYPE.LONG_BREAK:
        setShowToaster(true);
        nextRoundsLeft -= 1;
        nextType = TIMER_TYPE.FINISHED;
        break;
    }

    setTimerType(nextType);
    setRoundsLeft(nextRoundsLeft);
    resetTimer(nextType);
  };

  const resetTimer = (type: TIMER_TYPE) => {
    switch (type) {
      case TIMER_TYPE.WORK:
        setMinutes(workTime);
        break;
      case TIMER_TYPE.SHORT_BREAK:
        setMinutes(shortBreakTime);
        break;
      case TIMER_TYPE.LONG_BREAK:
        setMinutes(longBreakTime);
        break;
      case TIMER_TYPE.FINISHED:
        reset();
    }
    setSeconds(0);
  };

  const reset = () => {
    setTimerIsRunning(false);
    setTimerType(TIMER_TYPE.WORK);
    setRoundsLeft(rounds);
    resetTimer(TIMER_TYPE.WORK);
  };

  const timerMinutes = minutes < 10 ? `0${minutes}` : minutes.toString();
  const timerSeconds = seconds < 10 ? `0${seconds}` : seconds.toString();

  const setNextRound = () => {
    setMinutes(0);
    setSeconds(1);
  };

  return (
    <div className={styles.wrapper}>
      {import.meta.env.VITE_ENV === 'DEV' ? (
        <button onClick={setNextRound}>Next Round</button>
      ) : null}

      <IonToast
        position={'top'}
        isOpen={showToaster}
        message="Congratulations, you've successfully completed a pomodoro session! 🎉"
        onDidDismiss={() => setShowToaster(false)}
        duration={5000}
      />

      <SettingsModal setIsOpen={setSettingsModalIsOpen} isOpen={settingsModalIsOpen} />

      <TaskName timerType={timerType} />

      <h5 className={styles.subTitle}>Rounds left: {roundsLeft}</h5>

      <div className={styles.timeWrapper}>
        <div className={styles.circle}>
          <CircleLoader progress={progress} />
        </div>

        <IonButton
          className={styles.timeButton}
          fill="clear"
          color="secondary"
          onClick={() => setShowTime(!showTime)}>
          <div className={styles.timeButtonContent}>
            <h1 className={showTime ? '' : styles.blurred}>
              {timerMinutes}:{timerSeconds}
            </h1>
            <span className="sr-only">{!showTime ? 'show time' : 'hide time'}</span>
            <IonIcon
              color={'primary'}
              aria-hidden="true"
              size="large"
              icon={!showTime ? eyeSharp : eyeOffSharp}
            />
          </div>
        </IonButton>
      </div>

      <TimerControls
        openSettingsModal={() => setSettingsModalIsOpen(true)}
        reset={reset}
        disabled={workTime === minutes && seconds === 0 && rounds === roundsLeft}
      />
    </div>
  );
};

export default Timer;
