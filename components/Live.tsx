import React, { useCallback, useEffect, useState } from "react";
import LiveCursors from "./cursors/LiveCursors";
import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@liveblocks/react";
import CursorChat from "./cursors/CursorChat";
import { CursorMode, CursorState, Reaction, ReactionEvent } from "@/types/type";
import ReactionSelector from "./reactions/ReactionButton";
import FlyingReaction from "./reactions/FlyingReaction";
import useInterval from "@/hooks/useInterval";

const Live = () => {
  // for tracking other cursors
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence() as any;

  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });

  // Reactions state
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const broadcast = useBroadcastEvent();

  // Filter out old reactions for flying animations
  useInterval(() => {
    setReactions((reaction) =>
      reaction.filter((r) => r.timestamp > Date.now() - 4000)
    );
  }, 100);

  // Use interval hook to create the animation effect for the reaction
  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  // to be able to see other reactions or activity on our own screen
  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
        event.preventDefault();
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [cursor, cursorState.mode, updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
      updateMyPresence({ cursor: { x, y } });

      setCursorState((state) =>
        state.mode === CursorMode.Reaction
          ? { ...state, isPressed: true }
          : state
      );
    },
    [updateMyPresence]
  );

  const handlePointerUp = useCallback(() => {
    setCursorState((state) =>
      state.mode === CursorMode.Reaction
        ? { ...state, isPressed: false }
        : state
    );
  }, [cursorState.mode]);

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setCursorState({
          mode: CursorMode.Hidden,
        });
      } else if (e.key === "e") {
        if (cursorState.mode === CursorMode.ReactionSelector) {
          // Exit the ReactionSelector mode
          setCursorState({
            mode: CursorMode.Hidden,
          });
        } else {
          // Enter the ReactionSelector mode
          setCursorState({
            mode: CursorMode.ReactionSelector,
          });
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  // Render reactions cursor
  const setReaction = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  return (
    <div
      // Adding event listeners
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      className="h-[100vh] w-full flex justify-center items-center text-center"
    >
      <h1 className="text-5xl text-white">Liveblocks Figma Code</h1>

      {/* For flying reactions */}
      {reactions.map((r) => (
        <FlyingReaction
          key={r.timestamp.toString()}
          x={r.point.x}
          y={r.point.y}
          timestamp={r.timestamp}
          value={r.value}
        />
      ))}

      {cursor && (
        <CursorChat
          cursor={cursor}
          cursorState={cursorState}
          setCursorState={setCursorState}
          updateMyPresence={updateMyPresence}
        />
      )}

      {/* For adding reactions */}
      {cursorState.mode === CursorMode.ReactionSelector && (
        <>
          <br />
          <ReactionSelector setReaction={setReaction} />
        </>
      )}
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;