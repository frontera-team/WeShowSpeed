import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type { LanguageId } from '../types';

const WS_URL = (() => {
  const u =
    typeof window !== 'undefined' ? new URL(window.location.href) : null;
  if (!u) return 'ws://localhost:3001';
  const protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = u.hostname === 'localhost' ? 'localhost:3001' : u.host;
  return `${protocol}//${host}`;
})();

type RoomState =
  | 'idle'
  | 'waiting'
  | 'confirming'
  | 'countdown'
  | 'racing'
  | 'done';

interface Player {
  name: string;
  confirmed: boolean;
  result?: { wpm: number; accuracy: number };
}

interface CompetitionContextValue {
  roomId: string | null;
  roomState: RoomState;
  players: Player[];
  secondConfirmDeadline: number | null;
  countdownSec: number | null;
  startData: {
    text: string;
    durationSec: number;
    languageId: LanguageId;
  } | null;
  results: { name: string; result: { wpm: number; accuracy: number } }[] | null;
  createRoom: (
    name: string,
    languageId: LanguageId,
    durationSec: number,
  ) => void;
  joinRoom: (roomId: string, name: string) => void;
  confirm: () => void;
  submitResult: (result: {
    wpm: number;
    accuracy: number;
    correctChars: number;
    totalChars: number;
    timeSeconds: number;
  }) => void;
  reset: () => void;
  error: string | null;
}

const CompetitionContext = createContext<CompetitionContextValue | null>(null);

export function CompetitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const wsRef = useRef<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomState, setRoomState] = useState<RoomState>('idle');
  const [players, setPlayers] = useState<Player[]>([]);
  const [secondConfirmDeadline, setSecondConfirmDeadline] = useState<
    number | null
  >(null);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [startData, setStartData] =
    useState<CompetitionContextValue['startData']>(null);
  const [results, setResults] =
    useState<CompetitionContextValue['results']>(null);
  const [error, setError] = useState<string | null>(null);
  const myNameRef = useRef<string>('');

  const ensureWs = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return wsRef.current;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'room_created') {
          setRoomId(msg.roomId);
          setRoomState('waiting');
          setPlayers([{ name: myNameRef.current || 'You', confirmed: false }]);
          setError(null);
        } else if (msg.type === 'room_updated') {
          setPlayers(msg.players || []);
        } else if (msg.type === 'player_confirmed') {
          setSecondConfirmDeadline(msg.secondConfirmDeadline || null);
          setPlayers(msg.players || []);
        } else if (msg.type === 'confirm_expired') {
          setRoomState('waiting');
          setSecondConfirmDeadline(null);
          setPlayers((p) => p.map((x) => ({ ...x, confirmed: false })));
        } else if (msg.type === 'countdown_start') {
          setRoomState('countdown');
          setCountdownSec(msg.sec);
        } else if (msg.type === 'countdown') {
          setCountdownSec(msg.sec);
          if (msg.sec <= 0) setCountdownSec(null);
        } else if (msg.type === 'start') {
          const data = {
            text: msg.text,
            durationSec: msg.durationSec,
            languageId: msg.languageId,
          };
          setStartData(data);
          setRoomState('racing');
          setCountdownSec(null);
          setSecondConfirmDeadline(null);
          navigate('/competition-test', { replace: true, state: data });
        } else if (msg.type === 'results') {
          setResults(msg.results || []);
          setRoomState('done');
          setStartData(null);
          navigate('/competition-results', {
            replace: true,
            state: { results: msg.results },
          });
        } else if (msg.type === 'error') {
          setError(msg.message || 'Error');
        }
      } catch {
        // ignore
      }
    };
    ws.onclose = () => {
      wsRef.current = null;
    };
    return ws;
  }, [navigate]);

  const createRoom = useCallback(
    (name: string, languageId: LanguageId, durationSec: number) => {
      reset();
      myNameRef.current = name;
      const ws = ensureWs();
      if (ws.readyState !== WebSocket.OPEN) {
        ws.addEventListener('open', () => {
          ws.send(
            JSON.stringify({
              type: 'create_room',
              name,
              languageId,
              durationSec,
            }),
          );
        });
      } else {
        ws.send(
          JSON.stringify({
            type: 'create_room',
            name,
            languageId,
            durationSec,
          }),
        );
      }
    },
    [ensureWs],
  );

  const joinRoom = useCallback(
    (rid: string, name: string) => {
      reset();
      myNameRef.current = name;
      const ws = ensureWs();
      if (ws.readyState !== WebSocket.OPEN) {
        ws.addEventListener('open', () => {
          ws.send(
            JSON.stringify({
              type: 'join_room',
              roomId: rid.toUpperCase(),
              name,
            }),
          );
        });
      } else {
        ws.send(
          JSON.stringify({
            type: 'join_room',
            roomId: rid.toUpperCase(),
            name,
          }),
        );
      }
    },
    [ensureWs],
  );

  const confirm = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'confirm' }));
  }, []);

  const submitResult = useCallback(
    (result: {
      wpm: number;
      accuracy: number;
      correctChars: number;
      totalChars: number;
      timeSeconds: number;
    }) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(JSON.stringify({ type: 'submit_result', result }));
    },
    [],
  );

  const reset = useCallback(() => {
    setRoomId(null);
    setRoomState('idle');
    setPlayers([]);
    setSecondConfirmDeadline(null);
    setCountdownSec(null);
    setStartData(null);
    setResults(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const value: CompetitionContextValue = {
    roomId,
    roomState,
    players,
    secondConfirmDeadline,
    countdownSec,
    startData,
    results,
    createRoom,
    joinRoom,
    confirm,
    submitResult,
    reset,
    error,
  };

  return (
    <CompetitionContext.Provider value={value}>
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition() {
  const ctx = useContext(CompetitionContext);
  if (!ctx)
    throw new Error('useCompetition must be used within CompetitionProvider');
  return ctx;
}
