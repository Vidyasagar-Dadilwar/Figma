import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursors/LiveCursors'
import { useMyPresence, useOthers } from '@liveblocks/react'
import CursorChat from './cursors/CursorChat';
import { CursorMode } from '@/types/type';

const Live = () => {
    // for tracking other cursors
    const others = useOthers();
    const [{cursor}, updateMyPresence] = useMyPresence() as any;

    const [cursorState, setCursorState] = useState(
        {
            mode: CursorMode.Hidden,
        }
    )

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
        updateMyPresence({cursor: {x, y}});
    }, []);

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
      setCursorState({mode: CursorMode.Hidden})
      updateMyPresence({ cursor: null, mesage: null });
    }, []);

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
      updateMyPresence({ cursor: { x, y } });
    }, []);

    useEffect(() => {
        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key == "/") {
              setCursorState({
                mode: CursorMode.Chat,
                previousMessage: null,
                message: "",
              });
            } 
            else if (e.key === "Escape") {
              updateMyPresence({message: ''})
              setCursorState({
                mode: CursorMode.Hidden,
              });
            }
        }

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/"){
                e.preventDefault();
            }
        }

        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        }

    }, [updateMyPresence])

  return (
    <div
      // Adding event listeners
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      className="h-[100vh] w-full flex justify-center items-center text-center"
    >
      <h1 className="text-5xl text-white">Liveblocks Figma Code</h1>
      {cursor && (<CursorChat 
        cursor={cursor}
        cursorState={cursorState}
        setCursorState={setCursorState}
        updateMyPresence={updateMyPresence}
      />)}
      <LiveCursors others={others} />
    </div>
  );
}

export default Live